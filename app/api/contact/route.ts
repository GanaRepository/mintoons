import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import { contactSchema } from '@/utils/validation';
import { sendEmail } from '@/lib/email';
import { checkRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';

    // Check rate limit - 5 submissions per hour per IP
    const rateLimitResult = await checkRateLimit(
      `contact:${clientIP}`,
      5,
      60 * 60 * 1000 // 1 hour
    );

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Too many contact submissions. Please try again later.',
          retryAfter: rateLimitResult.resetTime 
        },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = contactSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid form data', 
          errors: validationResult.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const { name, email, role, subject, message } = validationResult.data;

    // Connect to database
    await connectToDatabase();

    // Send email notification to support team
    const emailContent = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Role:</strong> ${role}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
        ${message.replace(/\n/g, '<br>')}
      </div>
      <p><strong>IP Address:</strong> ${clientIP}</p>
      <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
    `;

    await sendEmail({
      to: process.env.SUPPORT_EMAIL || 'support@mintoons.com',
      subject: `Contact Form: ${subject}`,
      html: emailContent
    });

    // Send auto-reply to user
    const autoReplyContent = `
      <h2>Thank you for contacting Mintoons!</h2>
      <p>Hi ${name},</p>
      <p>We've received your message and will get back to you within 24 hours.</p>
      <p><strong>Your message:</strong></p>
      <div style="background: #f0f9ff; padding: 15px; border-radius: 5px; border-left: 4px solid #3b82f6; margin: 10px 0;">
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong> ${message}</p>
      </div>
      <p>Best regards,<br>The Mintoons Team</p>
    `;

    await sendEmail({
      to: email,
      subject: 'We received your message - Mintoons Support',
      html: autoReplyContent
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you for your message! We\'ll get back to you soon.'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to send message. Please try again later.' 
      },
      { status: 500 }
    );
  }
}