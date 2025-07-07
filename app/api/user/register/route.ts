import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/utils/db';
import User from '@/models/User';
import { registerSchema } from '@/lib/validations';
import { checkAuthRateLimit } from '@/lib/rate-limit';
import { SecurityLogger, ContentFilter } from '@/lib/security';
import { sendWelcomeEmail } from '@/lib/email';
import { trackUserRegistration } from '@/lib/analytics';
import { logError, trackAPIPerformance } from '@/lib/monitoring';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const startTime = performance.now();
  let statusCode = 201;

  try {
    // Rate limiting
    const rateLimitResult = await checkAuthRateLimit(req, 'register');
    if (rateLimitResult) {
      return rateLimitResult;
    }

    // Parse request body
    const body = await req.json();

    // Validate input
    const validation = registerSchema.safeParse(body);
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

    const { name, email, password, age, parentEmail, agreedToTerms } = validation.data;

    // Content filtering for name
    const nameFilter = ContentFilter.filterContent(name);
    if (!nameFilter.isClean) {
      statusCode = 400;
      await SecurityLogger.logEvent(
        'content_violation',
        req,
        { violations: nameFilter.violations, field: 'name' },
        undefined,
        'medium'
      );

      return NextResponse.json(
        {
          success: false,
          message: 'Name contains inappropriate content',
          errors: { name: 'Please choose an appropriate name' },
        },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ 
      email: email.toLowerCase() 
    });

    if (existingUser) {
      statusCode = 409;
      await SecurityLogger.logEvent(
        'failed_login',
        req,
        { reason: 'Email already exists', email },
        undefined,
        'low'
      );

      return NextResponse.json(
        {
          success: false,
          message: 'User already exists',
          errors: { email: 'This email is already registered' },
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Check if parental consent is needed (COPPA compliance)
    const needsParentalConsent = age < 13;
    if (needsParentalConsent && !parentEmail) {
      statusCode = 400;
      return NextResponse.json(
        {
          success: false,
          message: 'Parental consent required',
          errors: { 
            parentEmail: 'Parent email is required for users under 13' 
          },
        },
        { status: 400 }
      );
    }

    // Create user
    const user = new User({
      name: nameFilter.cleanedContent,
      email: email.toLowerCase(),
      password: hashedPassword,
      age,
      parentEmail: parentEmail?.toLowerCase(),
      role: 'user',
      isActive: true,
      needsParentalConsent,
      agreedToTerms,
      agreedToTermsAt: new Date(),
      lastLoginAt: new Date(),
    });

    await user.save();

    // Track registration
    await trackUserRegistration(user._id.toString(), {
      age,
      needsParentalConsent,
      source: req.headers.get('referer') || 'direct',
    });

    // Send welcome email
    try {
      await sendWelcomeEmail(email, name);
    } catch (emailError) {
      // Log error but don't fail registration
      await logError(
        'Failed to send welcome email',
        { userId: user._id.toString(), email },
        { error: emailError }
      );
    }

    // Log successful registration
    await SecurityLogger.logEvent(
      'user_registered',
      req,
      { userId: user._id.toString(), age, needsParentalConsent },
      user._id.toString(),
      'info'
    );

    // Return success response (exclude password)
    const userResponse = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      age: user.age,
      role: user.role,
      createdAt: user.createdAt,
    };

    statusCode = 201;
    return NextResponse.json(
      {
        success: true,
        message: 'User registered successfully',
        user: userResponse,
      },
      { status: 201 }
    );

  } catch (error) {
    statusCode = 500;
    
    await logError(
      'User registration failed',
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
        errors: { general: 'Registration failed. Please try again.' },
      },
      { status: 500 }
    );
  } finally {
    // Track API performance
    const responseTime = performance.now() - startTime;
    await trackAPIPerformance(
      '/api/user/register',
      'POST',
      responseTime,
      statusCode,
      {
        userAgent: req.headers.get('user-agent'),
      }
    );
  }
}