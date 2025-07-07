import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { connectToDatabase } from '@/utils/db';
import User from '@/models/User';
import PasswordReset from '@/models/PasswordReset';
import { resetPasswordSchema } from '@/lib/validations';
import { checkAuthRateLimit } from '@/lib/rate-limit';
import { SecurityLogger, PasswordSecurity } from '@/lib/security';
import { logError, trackAPIPerformance } from '@/lib/monitoring';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const startTime = performance.now();
  let statusCode = 200;

  try {
    // Rate limiting
    const rateLimitResult = await checkAuthRateLimit(req, 'login');
    if (rateLimitResult) {
      return rateLimitResult;
    }

    // Parse request body
    const body = await req.json();

    // Validate input
    const validation = resetPasswordSchema.safeParse(body);
    if (!validation.success) {
      statusCode = 400;
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: validation.error.errors.reduce((acc, error) => {
            acc[error.path[0]] = error.message;
            return acc;
          }, {} as Record<string, string>),
        },
        { status: 400 }
      );
    }

    const { token, password } = validation.data;

    // Additional password validation
    const passwordValidation = PasswordSecurity.validatePassword(password);
    if (!passwordValidation.isValid) {
      statusCode = 400;
      return NextResponse.json(
        {
          success: false,
          message: 'Password does not meet security requirements',
          errors: { 
            password: passwordValidation.feedback.join('. '),
            passwordScore: passwordValidation.score,
          },
        },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Hash the token to find the reset request
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find valid password reset request
    const passwordReset = await PasswordReset.findOne({
      token: hashedToken,
      expiresAt: { $gt: new Date() },
      used: false,
    }).populate('userId');

    if (!passwordReset) {
      statusCode = 400;
      await SecurityLogger.logEvent(
        'invalid_token',
        req,
        { reason: 'Invalid or expired password reset token' },
        undefined,
        'medium'
      );

      return NextResponse.json(
        {
          success: false,
          message: 'Invalid or expired reset token',
          errors: { token: 'The password reset link is invalid or has expired' },
        },
        { status: 400 }
      );
    }

    // Get the user
    const user = await User.findById(passwordReset.userId);
    if (!user) {
      statusCode = 400;
      await SecurityLogger.logEvent(
        'invalid_token',
        req,
        { reason: 'User not found for password reset token' },
        undefined,
        'medium'
      );

      return NextResponse.json(
        {
          success: false,
          message: 'Invalid reset token',
          errors: { token: 'The password reset link is invalid' },
        },
        { status: 400 }
      );
    }

    // Check if user account is active
    if (!user.isActive) {
      statusCode = 400;
      await SecurityLogger.logEvent(
        'permission_denied',
        req,
        { reason: 'Password reset for deactivated account', userId: user._id.toString() },
        user._id.toString(),
        'medium'
      );

      return NextResponse.json(
        {
          success: false,
          message: 'Account is deactivated',
          errors: { general: 'This account has been deactivated' },
        },
        { status: 400 }
      );
    }

    // Check if new password is different from current password
    const isSamePassword = await bcrypt.compare(password, user.password);
    if (isSamePassword) {
      statusCode = 400;
      return NextResponse.json(
        {
          success: false,
          message: 'New password must be different',
          errors: { password: 'Please choose a different password' },
        },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user password
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      passwordChangedAt: new Date(),
      // Optionally invalidate all existing sessions
      sessionVersion: (user.sessionVersion || 0) + 1,
    });

    // Mark password reset as used
    await PasswordReset.findByIdAndUpdate(passwordReset._id, {
      used: true,
      usedAt: new Date(),
      usedByIP: req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                req.headers.get('x-real-ip') || 
                'unknown',
    });

    // Invalidate any other unused reset tokens for this user
    await PasswordReset.updateMany(
      {
        userId: user._id,
        used: false,
        _id: { $ne: passwordReset._id },
      },
      {
        used: true,
        usedAt: new Date(),
      }
    );

    // Log successful password reset
    await SecurityLogger.logEvent(
      'password_reset_completed',
      req,
      { 
        userId: user._id.toString(),
        passwordScore: passwordValidation.score,
      },
      user._id.toString(),
      'info'
    );

    statusCode = 200;
    return NextResponse.json(
      {
        success: true,
        message: 'Password reset successfully',
        data: {
          passwordScore: passwordValidation.score,
          recommendations: passwordValidation.feedback.length === 0 
            ? ['Your password is strong!'] 
            : passwordValidation.feedback,
        },
      },
      { status: 200 }
    );

  } catch (error) {
    statusCode = 500;
    
    await logError(
      'Password reset failed',
      {
        url: req.url,
        method: req.method,
        userAgent: req.headers.get('user-agent'),
      },
      { error: error instanceof Error ? error.message : 'Unknown error' },
      error instanceof Error ? error.stack : undefined
    );

    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        errors: { general: 'Password reset failed. Please try again.' },
      },
      { status: 500 }
    );
  } finally {
    // Track API performance
    const responseTime = performance.now() - startTime;
    await trackAPIPerformance(
      '/api/user/reset-password',
      'POST',
      responseTime,
      statusCode,
      {
        userAgent: req.headers.get('user-agent'),
      }
    );
  }
}