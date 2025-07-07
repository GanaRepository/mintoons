import { NextRequest, NextResponse } from 'next/server';
import { downloadFile, getFileInfo, deleteFile } from '@/utils/gridfs';
import { requireAuthApi } from '@/lib/auth';
import { SecurityLogger } from '@/lib/security';
import { logError, trackAPIPerformance } from '@/lib/monitoring';

export const dynamic = 'force-dynamic';

// GET - Download file
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = performance.now();
  let statusCode = 200;

  try {
    const { id } = params;

    // Get file info first
    const fileInfo = await getFileInfo(id);
    if (!fileInfo) {
      statusCode = 404;
      return NextResponse.json(
        { success: false, message: 'File not found' },
        { status: 404 }
      );
    }

    // Basic access control - files uploaded by users should be accessible
    // In a more sophisticated system, you might check ownership or permissions here
    
    // Get file stream
    const stream = await downloadFile(id);

    // Log file access
    try {
      const authResult = await requireAuthApi();
      if ('error' not in authResult) {
        await SecurityLogger.logEvent(
          'file_accessed',
          req,
          { 
            fileId: id,
            fileName: fileInfo.filename,
            fileSize: fileInfo.size,
            contentType: fileInfo.contentType,
          },
          authResult.user.id,
          'info'
        );
      }
    } catch (authError) {
      // Continue with download even if auth logging fails
      console.warn('Failed to log file access:', authError);
    }

    // Create response with proper headers
    const response = new Response(stream as any, {
      headers: {
        'Content-Type': fileInfo.contentType,
        'Content-Length': fileInfo.size.toString(),
        'Cache-Control': 'public, max-age=31536000', // 1 year
        'Content-Disposition': `inline; filename="${fileInfo.filename}"`,
        'X-File-Id': id,
        'Last-Modified': fileInfo.uploadDate.toUTCString(),
      },
    });

    return response;

  } catch (error) {
    statusCode = 500;
    
    await logError(
      'File download failed',
      {
        fileId: params.id,
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
        message: 'Failed to download file',
      },
      { status: 500 }
    );
  } finally {
    // Track API performance
    const responseTime = performance.now() - startTime;
    await trackAPIPerformance(
      `/api/files/${params.id}`,
      'GET',
      responseTime,
      statusCode
    );
  }
}

// DELETE - Delete file
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = performance.now();
  let statusCode = 200;

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
    const { id } = params;

    // Get file info first to check ownership
    const fileInfo = await getFileInfo(id);
    if (!fileInfo) {
      statusCode = 404;
      return NextResponse.json(
        { success: false, message: 'File not found' },
        { status: 404 }
      );
    }

    // Check if user can delete this file
    // Files have user ID prefix, so we can check ownership
    const canDelete = user.role === 'admin' || 
                     fileInfo.filename.startsWith(`${user.id}_`);

    if (!canDelete) {
      statusCode = 403;
      await SecurityLogger.logEvent(
        'permission_denied',
        req,
        { 
          reason: 'Unauthorized file deletion attempt',
          fileId: id,
          fileName: fileInfo.filename,
          requestedBy: user.id,
        },
        user.id,
        'medium'
      );

      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    // Delete the file
    await deleteFile(id);

    // Log successful deletion
    await SecurityLogger.logEvent(
      'file_deleted',
      req,
      { 
        fileId: id,
        fileName: fileInfo.filename,
        fileSize: fileInfo.size,
      },
      user.id,
      'info'
    );

    statusCode = 200;
    return NextResponse.json(
      {
        success: true,
        message: 'File deleted successfully',
      },
      { status: 200 }
    );

  } catch (error) {
    statusCode = 500;
    
    await logError(
      'File deletion failed',
      {
        fileId: params.id,
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
        message: 'Failed to delete file',
      },
      { status: 500 }
    );
  } finally {
    // Track API performance
    const responseTime = performance.now() - startTime;
    await trackAPIPerformance(
      `/api/files/${params.id}`,
      'DELETE',
      responseTime,
      statusCode
    );
  }
}

// HEAD - Get file metadata without downloading
export async function HEAD(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = performance.now();
  let statusCode = 200;

  try {
    const { id } = params;

    // Get file info
    const fileInfo = await getFileInfo(id);
    if (!fileInfo) {
      statusCode = 404;
      return new Response(null, { status: 404 });
    }

    // Return headers without body
    statusCode = 200;
    return new Response(null, {
      status: 200,
      headers: {
        'Content-Type': fileInfo.contentType,
        'Content-Length': fileInfo.size.toString(),
        'Last-Modified': fileInfo.uploadDate.toUTCString(),
        'X-File-Id': id,
        'X-File-Name': fileInfo.filename,
      },
    });

  } catch (error) {
    statusCode = 500;
    
    await logError(
      'File metadata request failed',
      {
        fileId: params.id,
        url: req.url,
        method: req.method,
        userAgent: req.headers.get('user-agent'),
      },
      { error: error instanceof Error ? error.message : 'Unknown error' },
      error instanceof Error ? error.stack : undefined
    );

    return new Response(null, { status: 500 });
  } finally {
    // Track API performance
    const responseTime = performance.now() - startTime;
    await trackAPIPerformance(
      `/api/files/${params.id}`,
      'HEAD',
      responseTime,
      statusCode
    );
  }
}