import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectToDatabase } from '@/utils/db';
import User from '@/models/User';
import PasswordReset from '@/models/PasswordReset';
import { forgotPasswordSchema } from '@/lib/validations';
import { checkAuthRateLimit } from '@/lib/rate-limit';
import { SecurityLogger } from '@/lib/security';
import { sendPasswordResetEmail } from '@/lib/email';
import { logError, trackAPIPerformance } from '@/lib/monitoring';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const startTime = performance.now();
  let statusCode = 200;

  try {
    // Rate limiting
    const rateLimitResult = await checkAuthRateLimit(req, 'forgotPassword');
    if (rateLimitResult) {
      return rateLimitResult;
    }

    // Parse request body
    const body = await req.json();

    // Validate input
    const validation = forgotPasswordSchema.safeParse(body);
    if (!validation.success) {
      statusCode = 400;
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email address',
          errors: validation.error.errors.reduce((acc, error) => {
            acc[error.path[0]] = error.message;
            return acc;
          }, {} as Record<string, string>),
        },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    // Connect to database
    await connectToDatabase();

    // Find user by email
    const user = await User.findOne({ 
      email: email.toLowerCase() 
    });

    // Always return success to prevent email enumeration
    // but only send email if user exists
    if (user) {
      // Check if user account is active
      if (!user.isActive) {
        await SecurityLogger.logEvent(
          'failed_login',
          req,
          { reason: 'Account deactivated', email, userId: user._id.toString() },
          user._id.toString(),
          'medium'
        );

        // Still return success to prevent account enumeration
        return NextResponse.json(
          {
            success: true,
            message: 'If an account with that email exists, we have sent a password reset link.',
          },
          { status: 200 }
        );
      }

      // Check for existing recent reset requests
      const existingReset = await PasswordReset.findOne({
        userId: user._id,
        expiresAt: { $gt: new Date() },
        used: false,
      });

      if (existingReset) {
        // If request was made within last 5 minutes, don't send another email
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        if (existingReset.createdAt > fiveMinutesAgo) {
          await SecurityLogger.logEvent(
            'suspicious_activity',
            req,
            { 
              reason: 'Multiple password reset requests', 
              email, 
              userId: user._id.toString() 
            },
            user._id.toString(),
            'medium'
          );

          return NextResponse.json(
            {
              success: true,
              message: 'If an account with that email exists, we have sent a password reset link.',
            },
            { status: 200 }
          );
        }

        // Invalidate existing reset token
        await PasswordReset.updateOne(
          { _id: existingReset._id },
          { used: true, usedAt: new Date() }
        );
      }

      // Generate secure reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

      // Create password reset record
      const passwordReset = new PasswordReset({
        userId: user._id,
        token: hashedToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
      });

      await passwordReset.save();

      // Send password reset email
      try {
        await sendPasswordResetEmail(
          user.email,
          user.name,
          resetToken
        );

        await SecurityLogger.logEvent(
          'password_reset_requested',
          req,
          { email, userId: user._id.toString() },
          user._id.toString(),
          'info'
        );
      } catch (emailError) {
        // Log error but don't expose it to user
        await logError(
          'Failed to send password reset email',
          { 
            userId: user._id.toString(), 
            email,
            url: req.url,
            userAgent: req.headers.get('user-agent'),
          },
          { error: emailError }
        );

        // Invalidate the reset token since we couldn't send the email
        await PasswordReset.updateOne(
          { _id: passwordReset._id },
          { used: true, usedAt: new Date() }
        );
      }
    } else {
      // Log attempt to reset password for non-existent email
      await SecurityLogger.logEvent(
        'failed_login',
        req,
        { reason: 'Password reset for non-existent email', email },
        undefined,
        'low'
      );
    }

    // Always return the same success message
    statusCode = 200;
    return NextResponse.json(
      {
        success: true,
        message: 'If an account with that email exists, we have sent a password reset link.',
      },
      { status: 200 }
    );

  } catch (error) {
    statusCode = 500;
    
    await logError(
      'Password reset request failed',
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
        errors: { general: 'Password reset request failed. Please try again.' },
      },
      { status: 500 }
    );
  } finally {
    // Track API performance
    const responseTime = performance.now() - startTime;
    await trackAPIPerformance(
      '/api/user/forgot-password',
      'POST',
      responseTime,
      statusCode,
      {
        userAgent: req.headers.get('user-agent'),
      }
    );
  }
}