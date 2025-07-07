import { NextRequest, NextResponse } from 'next/server';
import { requireAuthApi } from '@/lib/auth';
import { checkUserActionLimit } from '@/lib/rate-limit';
import { SecurityLogger, FileSecurity, ContentFilter } from '@/lib/security';
import { uploadFile } from '@/utils/gridfs';
import { logError, trackAPIPerformance } from '@/lib/monitoring';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const startTime = performance.now();
  let statusCode = 201;

  try {
    // Authenticate user
    const authResult = await requireAuthApi();
    if ('error' in authResult) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: authResult.status }
      );
    }

    const user = authResult.user;

    // Check rate limits
    const rateLimitResult = await checkUserActionLimit(
      user.id,
      user.role,
      'file_upload'
    );

    if (!rateLimitResult.allowed) {
      statusCode = 429;
      return NextResponse.json(
        {
          success: false,
          message: 'File upload limit reached',
          retryAfter: Math.ceil((rateLimitResult.resetTime.getTime() - Date.now()) / 1000),
        },
        { status: 429 }
      );
    }

    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      statusCode = 400;
      return NextResponse.json(
        {
          success: false,
          message: 'No file provided',
          errors: { file: 'Please select a file to upload' },
        },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Validate file
    const fileValidation = FileSecurity.validateFile({
      name: file.name,
      size: file.size,
      type: file.type,
      buffer,
    });

    if (!fileValidation.isValid) {
      statusCode = 400;
      await SecurityLogger.logEvent(
        'content_violation',
        req,
        { 
          violations: fileValidation.violations,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
        },
        user.id,
        'medium'
      );

      return NextResponse.json(
        {
          success: false,
          message: 'File validation failed',
          errors: { file: fileValidation.violations.join('. ') },
        },
        { status: 400 }
      );
    }

    // Sanitize filename
    const fileNameValidation = ContentFilter.validateFileName(file.name);
    const sanitizedFileName = fileNameValidation.sanitizedName;

    // Add user prefix to prevent filename conflicts
    const finalFileName = `${user.id}_${Date.now()}_${sanitizedFileName}`;

    // Upload to GridFS
    const fileId = await uploadFile(
      buffer,
      finalFileName,
      file.type
    );

    // Log successful upload
    await SecurityLogger.logEvent(
      'file_uploaded',
      req,
      { 
        fileId,
        originalName: file.name,
        sanitizedName: finalFileName,
        fileSize: file.size,
        fileType: file.type,
      },
      user.id,
      'info'
    );

    statusCode = 201;
    return NextResponse.json(
      {
        success: true,
        message: 'File uploaded successfully',
        data: {
          fileId,
          originalName: file.name,
          fileName: finalFileName,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString(),
          downloadUrl: `/api/files/${fileId}`,
        },
      },
      { status: 201 }
    );

  } catch (error) {
    statusCode = 500;
    
    await logError(
      'File upload failed',
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
        message: 'File upload failed',
        error: 'Please try again with a different file',
      },
      { status: 500 }
    );
  } finally {
    // Track API performance
    const responseTime = performance.now() - startTime;
    await trackAPIPerformance(
      '/api/files/upload',
      'POST',
      responseTime,
      statusCode
    );
  }
}