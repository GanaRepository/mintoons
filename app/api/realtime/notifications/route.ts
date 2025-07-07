import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectDB } from '@/utils/db';
import Notification from '@/models/Notification';

// Server-Sent Events for real-time notifications
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Set up Server-Sent Events
    const encoder = new TextEncoder();
    
    const stream = new ReadableStream({
      start(controller) {
        // Send initial connection message
        const data = `data: ${JSON.stringify({ 
          type: 'connected', 
          message: 'Real-time notifications connected',
          timestamp: new Date().toISOString()
        })}\n\n`;
        controller.enqueue(encoder.encode(data));

        // Set up periodic heartbeat
        const heartbeat = setInterval(() => {
          try {
            const heartbeatData = `data: ${JSON.stringify({ 
              type: 'heartbeat',
              timestamp: new Date().toISOString()
            })}\n\n`;
            controller.enqueue(encoder.encode(heartbeatData));
          } catch (error) {
            console.error('Heartbeat error:', error);
            clearInterval(heartbeat);
          }
        }, 30000); // Every 30 seconds

        // Listen for new notifications
        const notificationListener = setInterval(async () => {
          try {
            // Get unread notifications for the user
            const notifications = await Notification.find({
              recipient: session.user.id,
              read: false,
              createdAt: { $gte: new Date(Date.now() - 60000) } // Last minute
            })
            .populate('sender', 'name avatar')
            .populate('relatedStory', 'title')
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

            if (notifications.length > 0) {
              const data = `data: ${JSON.stringify({
                type: 'notifications',
                notifications,
                count: notifications.length,
                timestamp: new Date().toISOString()
              })}\n\n`;
              controller.enqueue(encoder.encode(data));
            }
          } catch (error) {
            console.error('Notification polling error:', error);
          }
        }, 5000); // Check every 5 seconds

        // Cleanup on connection close
        request.signal.addEventListener('abort', () => {
          clearInterval(heartbeat);
          clearInterval(notificationListener);
          controller.close();
        });
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Cache-Control'
      }
    });

  } catch (error) {
    console.error('SSE setup error:', error);
    return NextResponse.json(
      { error: 'Failed to establish real-time connection' },
      { status: 500 }
    );
  }
}

// Get user notifications with pagination
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { page = 1, limit = 20, unreadOnly = false } = await request.json();

    const query: any = { recipient: session.user.id };
    if (unreadOnly) {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .populate('sender', 'name avatar role')
      .populate('relatedStory', 'title')
      .populate('relatedComment', 'content')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const totalNotifications = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      recipient: session.user.id,
      read: false
    });

    return NextResponse.json({
      notifications,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalNotifications / limit),
        totalNotifications,
        hasNextPage: page < Math.ceil(totalNotifications / limit),
        hasPrevPage: page > 1
      },
      unreadCount
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// Mark notifications as read
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { notificationIds, markAll = false } = await request.json();

    let updateResult;

    if (markAll) {
      // Mark all notifications as read for the user
      updateResult = await Notification.updateMany(
        { recipient: session.user.id, read: false },
        { read: true, readAt: new Date() }
      );
    } else if (notificationIds && Array.isArray(notificationIds)) {
      // Mark specific notifications as read
      updateResult = await Notification.updateMany(
        { 
          _id: { $in: notificationIds },
          recipient: session.user.id,
          read: false
        },
        { read: true, readAt: new Date() }
      );
    } else {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Get updated unread count
    const unreadCount = await Notification.countDocuments({
      recipient: session.user.id,
      read: false
    });

    return NextResponse.json({
      markedCount: updateResult.modifiedCount,
      unreadCount
    });

  } catch (error) {
    console.error('Mark notifications read error:', error);
    return NextResponse.json(
      { error: 'Failed to mark notifications as read' },
      { status: 500 }
    );
  }
}

// Delete notifications
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { notificationIds, deleteAll = false } = await request.json();

    let deleteResult;

    if (deleteAll) {
      // Delete all read notifications for the user
      deleteResult = await Notification.deleteMany({
        recipient: session.user.id,
        read: true
      });
    } else if (notificationIds && Array.isArray(notificationIds)) {
      // Delete specific notifications
      deleteResult = await Notification.deleteMany({
        _id: { $in: notificationIds },
        recipient: session.user.id
      });
    } else {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    return NextResponse.json({
      deletedCount: deleteResult.deletedCount
    });

  } catch (error) {
    console.error('Delete notifications error:', error);
    return NextResponse.json(
      { error: 'Failed to delete notifications' },
      { status: 500 }
    );
  }
}

// Utility function to create notifications (used by other parts of the app)
export async function createNotification({
  recipient,
  sender,
  type,
  title,
  message,
  relatedStory,
  relatedComment,
  actionUrl,
  priority = 'normal'
}: {
  recipient: string;
  sender?: string;
  type: 'story_comment' | 'story_like' | 'mentor_feedback' | 'achievement' | 'system' | 'story_published';
  title: string;
  message: string;
  relatedStory?: string;
  relatedComment?: string;
  actionUrl?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}) {
  try {
    await connectDB();

    const notification = new Notification({
      recipient,
      sender,
      type,
      title,
      message,
      relatedStory,
      relatedComment,
      actionUrl,
      priority,
      read: false
    });

    await notification.save();

    // Populate the notification for real-time sending
    await notification.populate('sender', 'name avatar');
    await notification.populate('relatedStory', 'title');
    
    return notification;

  } catch (error) {
    console.error('Create notification error:', error);
    throw error;
  }
}