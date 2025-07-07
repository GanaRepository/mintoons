import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import Notification from '@/models/Notification';
import { requireAuthApi } from '@/lib/auth';
import { checkUserActionLimit } from '@/lib/rate-limit';
import { SecurityLogger } from '@/lib/security';
import { trackAPICall, logError } from '@/lib/monitoring';

export const dynamic = 'force-dynamic';

// GET /api/notifications - Get user notifications
export async function GET(req: NextRequest) {
  let statusCode = 200;
  
  try {
    const startTime = performance.now();
    
    // Rate limiting
    const rateLimitResult = await checkUserActionLimit(req, 'notifications_read', 100); // 100 per hour
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

    // Get query parameters
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);
    const unreadOnly = url.searchParams.get('unreadOnly') === 'true';
    const type = url.searchParams.get('type');

    // Build query
    const query: any = { userId: user.id };
    
    if (unreadOnly) {
      query.read = false;
    }
    
    if (type) {
      query.type = type;
    }

    // Get total count
    const totalCount = await Notification.countDocuments(query);

    // Get notifications with pagination
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    // Get unread count
    const unreadCount = await Notification.countDocuments({
      userId: user.id,
      read: false,
    });

    // Track API call
    await trackAPICall(req, {
      endpoint: '/api/notifications',
      method: 'GET',
      userId: user.id,
      responseTime: performance.now() - startTime,
      statusCode,
    });

    // Log security event
    await SecurityLogger.logEvent({
      type: 'notifications_accessed',
      userId: user.id,
      userEmail: user.email,
      ipAddress: req.ip || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
      details: {
        notificationCount: notifications.length,
        unreadCount,
        filters: { unreadOnly, type },
      },
    });

    return NextResponse.json({
      success: true,
      notifications: notifications.map(notification => ({
        id: notification._id.toString(),
        type: notification.type,
        title: notification.title,
        message: notification.message,
        read: notification.read,
        actionUrl: notification.actionUrl,
        metadata: notification.metadata,
        timestamp: notification.createdAt,
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1,
      },
      unreadCount,
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    statusCode = 500;
    
    await logError(error as Error, {
      endpoint: '/api/notifications',
      method: 'GET',
      userId: 'unknown',
    });

    return NextResponse.json(
      { success: false, message: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Create notification (internal use)
export async function POST(req: NextRequest) {
  let statusCode = 200;
  
  try {
    const startTime = performance.now();
    
    // Rate limiting
    const rateLimitResult = await checkUserActionLimit(req, 'notifications_create', 50); // 50 per hour
    if (!rateLimitResult.allowed) {
      statusCode = 429;
      return NextResponse.json(
        { success: false, message: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Authentication check (admin only for manual creation)
    const authResult = await requireAuthApi();
    if ('error' in authResult) {
      statusCode = authResult.status;
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: authResult.status }
      );
    }

    const { user } = authResult;

    // Only admins can manually create notifications
    if (user.role !== 'admin') {
      statusCode = 403;
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { 
      userId, 
      type, 
      title, 
      message, 
      actionUrl, 
      metadata = {},
      priority = 'normal' 
    } = body;

    // Validate required fields
    if (!userId || !type || !title || !message) {
      statusCode = 400;
      return NextResponse.json(
        { success: false, message: 'Missing required fields: userId, type, title, message' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Create notification
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      actionUrl,
      metadata,
      priority,
      read: false,
      createdBy: user.id,
    });

    await notification.save();

    // Track API call
    await trackAPICall(req, {
      endpoint: '/api/notifications',
      method: 'POST',
      userId: user.id,
      responseTime: performance.now() - startTime,
      statusCode,
    });

    // Log security event
    await SecurityLogger.logEvent({
      type: 'notification_created',
      userId: user.id,
      userEmail: user.email,
      ipAddress: req.ip || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
      details: {
        notificationId: notification._id.toString(),
        targetUserId: userId,
        notificationType: type,
        priority,
      },
    });

    return NextResponse.json({
      success: true,
      notification: {
        id: notification._id.toString(),
        type: notification.type,
        title: notification.title,
        message: notification.message,
        read: notification.read,
        actionUrl: notification.actionUrl,
        metadata: notification.metadata,
        priority: notification.priority,
        timestamp: notification.createdAt,
      },
    });

  } catch (error) {
    console.error('Create notification error:', error);
    statusCode = 500;
    
    await logError(error as Error, {
      endpoint: '/api/notifications',
      method: 'POST',
      userId: 'unknown',
    });

    return NextResponse.json(
      { success: false, message: 'Failed to create notification' },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications - Clear all notifications
export async function DELETE(req: NextRequest) {
  let statusCode = 200;
  
  try {
    const startTime = performance.now();
    
    // Rate limiting
    const rateLimitResult = await checkUserActionLimit(req, 'notifications_clear', 10); // 10 per hour
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

    // Get URL parameters
    const url = new URL(req.url);
    const clearAll = url.searchParams.get('all') === 'true';
    const olderThan = url.searchParams.get('olderThan'); // ISO date string

    let deleteQuery: any = { userId: user.id };

    if (!clearAll) {
      // Only clear read notifications by default
      deleteQuery.read = true;
    }

    if (olderThan) {
      deleteQuery.createdAt = { $lt: new Date(olderThan) };
    }

    // Delete notifications
    const deleteResult = await Notification.deleteMany(deleteQuery);

    // Track API call
    await trackAPICall(req, {
      endpoint: '/api/notifications',
      method: 'DELETE',
      userId: user.id,
      responseTime: performance.now() - startTime,
      statusCode,
    });

    // Log security event
    await SecurityLogger.logEvent({
      type: 'notifications_cleared',
      userId: user.id,
      userEmail: user.email,
      ipAddress: req.ip || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
      details: {
        deletedCount: deleteResult.deletedCount,
        clearAll,
        olderThan,
      },
    });

    return NextResponse.json({
      success: true,
      message: `${deleteResult.deletedCount} notifications cleared`,
      deletedCount: deleteResult.deletedCount,
    });

  } catch (error) {
    console.error('Clear notifications error:', error);
    statusCode = 500;
    
    await logError(error as Error, {
      endpoint: '/api/notifications',
      method: 'DELETE',
      userId: 'unknown',
    });

    return NextResponse.json(
      { success: false, message: 'Failed to clear notifications' },
      { status: 500 }
    );
  }
}