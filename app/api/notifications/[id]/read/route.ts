import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/utils/db';
import Notification from '@/models/Notification';
import { requireAuthApi } from '@/lib/auth';
import { checkUserActionLimit } from '@/lib/rate-limit';
import { SecurityLogger } from '@/lib/security';
import { trackAPICall, logError } from '@/lib/monitoring';

export const dynamic = 'force-dynamic';

// PATCH /api/notifications/[id]/read - Mark notification as read
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  let statusCode = 200;
  
  try {
    const startTime = performance.now();
    const { id } = params;

    // Validate notification ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      statusCode = 400;
      return NextResponse.json(
        { success: false, message: 'Invalid notification ID' },
        { status: 400 }
      );
    }

    // Rate limiting
    const rateLimitResult = await checkUserActionLimit(req, 'notifications_update', 100); // 100 per hour
    if (!rateLimitResult.allowed) {
      statusCode = 429;
      return NextResponse.json(
        { success: false, message: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Authentication check
    const authResult = await requireAuthApi();
    if ('error' in authResult) {
      statusCode = authResult.status;
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: authResult.status }
      );
    }

    const { user } = authResult;

    await connectToDatabase();

    // Find notification and verify ownership
    const notification = await Notification.findOne({
      _id: id,
      userId: user.id,
    });

    if (!notification) {
      statusCode = 404;
      return NextResponse.json(
        { success: false, message: 'Notification not found' },
        { status: 404 }
      );
    }

    // Check if already read
    if (notification.read) {
      return NextResponse.json({
        success: true,
        message: 'Notification already marked as read',
        notification: {
          id: notification._id.toString(),
          read: notification.read,
          readAt: notification.readAt,
        },
      });
    }

    // Mark as read
    notification.read = true;
    notification.readAt = new Date();
    await notification.save();

    // Track API call
    await trackAPICall(req, {
      endpoint: `/api/notifications/${id}/read`,
      method: 'PATCH',
      userId: user.id,
      responseTime: performance.now() - startTime,
      statusCode,
    });

    // Log security event
    await SecurityLogger.logEvent({
      type: 'notification_read',
      userId: user.id,
      userEmail: user.email,
      ipAddress: req.ip || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
      details: {
        notificationId: id,
        notificationType: notification.type,
        wasRead: false, // It was unread before this action
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Notification marked as read',
      notification: {
        id: notification._id.toString(),
        type: notification.type,
        title: notification.title,
        message: notification.message,
        read: notification.read,
        readAt: notification.readAt,
        actionUrl: notification.actionUrl,
        metadata: notification.metadata,
        timestamp: notification.createdAt,
      },
    });

  } catch (error) {
    console.error('Mark notification as read error:', error);
    statusCode = 500;
    
    await logError(error as Error, {
      endpoint: `/api/notifications/${params.id}/read`,
      method: 'PATCH',
      userId: 'unknown',
    });

    return NextResponse.json(
      { success: false, message: 'Failed to mark notification as read' },
      { status: 500 }
    );
  }
}

// PUT /api/notifications/[id]/read - Toggle read status
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  let statusCode = 200;
  
  try {
    const startTime = performance.now();
    const { id } = params;

    // Validate notification ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      statusCode = 400;
      return NextResponse.json(
        { success: false, message: 'Invalid notification ID' },
        { status: 400 }
      );
    }

    // Rate limiting
    const rateLimitResult = await checkUserActionLimit(req, 'notifications_update', 100); // 100 per hour
    if (!rateLimitResult.allowed) {
      statusCode = 429;
      return NextResponse.json(
        { success: false, message: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Authentication check
    const authResult = await requireAuthApi();
    if ('error' in authResult) {
      statusCode = authResult.status;
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: authResult.status }
      );
    }

    const { user } = authResult;

    await connectToDatabase();

    // Get request body
    const body = await req.json();
    const { read } = body;

    if (typeof read !== 'boolean') {
      statusCode = 400;
      return NextResponse.json(
        { success: false, message: 'Invalid read status. Must be boolean.' },
        { status: 400 }
      );
    }

    // Find notification and verify ownership
    const notification = await Notification.findOne({
      _id: id,
      userId: user.id,
    });

    if (!notification) {
      statusCode = 404;
      return NextResponse.json(
        { success: false, message: 'Notification not found' },
        { status: 404 }
      );
    }

    const wasRead = notification.read;

    // Update read status
    notification.read = read;
    if (read && !wasRead) {
      notification.readAt = new Date();
    } else if (!read) {
      notification.readAt = undefined;
    }
    
    await notification.save();

    // Track API call
    await trackAPICall(req, {
      endpoint: `/api/notifications/${id}/read`,
      method: 'PUT',
      userId: user.id,
      responseTime: performance.now() - startTime,
      statusCode,
    });

    // Log security event
    await SecurityLogger.logEvent({
      type: 'notification_status_changed',
      userId: user.id,
      userEmail: user.email,
      ipAddress: req.ip || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
      details: {
        notificationId: id,
        notificationType: notification.type,
        fromStatus: wasRead,
        toStatus: read,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Notification marked as ${read ? 'read' : 'unread'}`,
      notification: {
        id: notification._id.toString(),
        type: notification.type,
        title: notification.title,
        message: notification.message,
        read: notification.read,
        readAt: notification.readAt,
        actionUrl: notification.actionUrl,
        metadata: notification.metadata,
        timestamp: notification.createdAt,
      },
    });

  } catch (error) {
    console.error('Toggle notification read status error:', error);
    statusCode = 500;
    
    await logError(error as Error, {
      endpoint: `/api/notifications/${params.id}/read`,
      method: 'PUT',
      userId: 'unknown',
    });

    return NextResponse.json(
      { success: false, message: 'Failed to update notification status' },
      { status: 500 }
    );
  }
}