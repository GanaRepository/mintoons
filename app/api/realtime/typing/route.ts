import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';

// In-memory store for typing indicators
// In production, you'd use Redis or another shared store
const typingUsers = new Map<string, Map<string, { userId: string; userName: string; timestamp: number }>>();

// Cleanup interval to remove stale typing indicators
const TYPING_TIMEOUT = 3000; // 3 seconds
setInterval(() => {
  const now = Date.now();
  for (const [storyId, users] of typingUsers.entries()) {
    for (const [userId, data] of users.entries()) {
      if (now - data.timestamp > TYPING_TIMEOUT) {
        users.delete(userId);
      }
    }
    if (users.size === 0) {
      typingUsers.delete(storyId);
    }
  }
}, 1000);

// Server-Sent Events for typing indicators
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const storyId = searchParams.get('storyId');

    if (!storyId) {
      return NextResponse.json({ error: 'Story ID required' }, { status: 400 });
    }

    const encoder = new TextEncoder();
    
    const stream = new ReadableStream({
      start(controller) {
        // Send initial connection message
        const data = `data: ${JSON.stringify({ 
          type: 'connected', 
          storyId,
          message: 'Typing indicators connected',
          timestamp: new Date().toISOString()
        })}\n\n`;
        controller.enqueue(encoder.encode(data));

        // Send current typing users
        const currentTypers = typingUsers.get(storyId);
        if (currentTypers && currentTypers.size > 0) {
          const typersArray = Array.from(currentTypers.values())
            .filter(user => user.userId !== session.user.id); // Don't include self
          
          if (typersArray.length > 0) {
            const initialData = `data: ${JSON.stringify({
              type: 'typing_update',
              storyId,
              typingUsers: typersArray,
              timestamp: new Date().toISOString()
            })}\n\n`;
            controller.enqueue(encoder.encode(initialData));
          }
        }

        // Set up periodic updates
        const updateInterval = setInterval(() => {
          try {
            const currentTypers = typingUsers.get(storyId);
            const typersArray = currentTypers 
              ? Array.from(currentTypers.values()).filter(user => user.userId !== session.user.id)
              : [];

            const updateData = `data: ${JSON.stringify({
              type: 'typing_update',
              storyId,
              typingUsers: typersArray,
              timestamp: new Date().toISOString()
            })}\n\n`;
            controller.enqueue(encoder.encode(updateData));
          } catch (error) {
            console.error('Typing update error:', error);
            clearInterval(updateInterval);
          }
        }, 1000); // Update every second

        // Heartbeat
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
        }, 30000);

        // Cleanup on connection close
        request.signal.addEventListener('abort', () => {
          clearInterval(updateInterval);
          clearInterval(heartbeat);
          
          // Remove user from typing indicators
          const storyTypers = typingUsers.get(storyId);
          if (storyTypers) {
            storyTypers.delete(session.user.id);
            if (storyTypers.size === 0) {
              typingUsers.delete(storyId);
            }
          }
          
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
    console.error('Typing SSE setup error:', error);
    return NextResponse.json(
      { error: 'Failed to establish typing connection' },
      { status: 500 }
    );
  }
}

// Update typing status
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storyId, isTyping, context } = await request.json();

    if (!storyId) {
      return NextResponse.json({ error: 'Story ID required' }, { status: 400 });
    }

    // Get or create typing users map for this story
    if (!typingUsers.has(storyId)) {
      typingUsers.set(storyId, new Map());
    }

    const storyTypers = typingUsers.get(storyId)!;

    if (isTyping) {
      // Add user to typing indicators
      storyTypers.set(session.user.id, {
        userId: session.user.id,
        userName: session.user.name || 'Anonymous',
        timestamp: Date.now()
      });
    } else {
      // Remove user from typing indicators
      storyTypers.delete(session.user.id);
    }

    // Clean up empty maps
    if (storyTypers.size === 0) {
      typingUsers.delete(storyId);
    }

    // Get current typing users (excluding the current user)
    const currentTypers = Array.from(storyTypers.values())
      .filter(user => user.userId !== session.user.id);

    return NextResponse.json({
      success: true,
      storyId,
      typingUsers: currentTypers,
      isTyping,
      context
    });

  } catch (error) {
    console.error('Update typing status error:', error);
    return NextResponse.json(
      { error: 'Failed to update typing status' },
      { status: 500 }
    );
  }
}

// Get current typing users for a story
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storyId } = await request.json();

    if (!storyId) {
      return NextResponse.json({ error: 'Story ID required' }, { status: 400 });
    }

    const storyTypers = typingUsers.get(storyId);
    const currentTypers = storyTypers 
      ? Array.from(storyTypers.values()).filter(user => user.userId !== session.user.id)
      : [];

    return NextResponse.json({
      storyId,
      typingUsers: currentTypers,
      count: currentTypers.length
    });

  } catch (error) {
    console.error('Get typing users error:', error);
    return NextResponse.json(
      { error: 'Failed to get typing users' },
      { status: 500 }
    );
  }
}

// Clear typing status (used when user leaves or stops editing)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const storyId = searchParams.get('storyId');

    if (!storyId) {
      return NextResponse.json({ error: 'Story ID required' }, { status: 400 });
    }

    const storyTypers = typingUsers.get(storyId);
    if (storyTypers) {
      storyTypers.delete(session.user.id);
      if (storyTypers.size === 0) {
        typingUsers.delete(storyId);
      }
    }

    return NextResponse.json({
      success: true,
      storyId,
      message: 'Typing status cleared'
    });

  } catch (error) {
    console.error('Clear typing status error:', error);
    return NextResponse.json(
      { error: 'Failed to clear typing status' },
      { status: 500 }
    );
  }
}

// Utility function to get typing status for multiple stories
export async function getMultipleStoryTypingStatus(storyIds: string[], excludeUserId?: string) {
  const result: Record<string, any[]> = {};
  
  for (const storyId of storyIds) {
    const storyTypers = typingUsers.get(storyId);
    result[storyId] = storyTypers 
      ? Array.from(storyTypers.values()).filter(user => user.userId !== excludeUserId)
      : [];
  }
  
  return result;
}

// Admin endpoint to monitor typing activity
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get statistics about typing activity
    const stats = {
      activeStories: typingUsers.size,
      totalTypingUsers: Array.from(typingUsers.values()).reduce((total, users) => total + users.size, 0),
      storiesWithActivity: Array.from(typingUsers.entries()).map(([storyId, users]) => ({
        storyId,
        typingCount: users.size,
        users: Array.from(users.values())
      }))
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Get typing stats error:', error);
    return NextResponse.json(
      { error: 'Failed to get typing statistics' },
      { status: 500 }
    );
  }
}