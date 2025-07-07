import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import Comment from '@/models/Comment';
import Story from '@/models/Story';
import { commentSchema } from '@/utils/validation';
import { checkRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const { id: storyId } = params;

    // Check if story exists and user has access
    const story = await Story.findById(storyId);
    if (!story) {
      return NextResponse.json(
        { success: false, message: 'Story not found' },
        { status: 404 }
      );
    }

    // Check access permissions
    const userRole = session.user.role;
    const userId = session.user.id;

    if (userRole === 'child' && story.userId.toString() !== userId) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    // Get comments for the story
    const comments = await Comment.find({ storyId })
      .populate('commenterId', 'name role')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: comments
    });

  } catch (error) {
    console.error('Get comments error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Only mentors and admins can add comments
    if (!['mentor', 'admin'].includes(session.user.role || '')) {
      return NextResponse.json(
        { success: false, message: 'Permission denied' },
        { status: 403 }
      );
    }

    // Rate limiting - 10 comments per minute
    const rateLimitResult = await checkRateLimit(
      `comments:${session.user.id}`,
      10,
      60 * 1000 // 1 minute
    );

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Too many comments. Please slow down.',
          retryAfter: rateLimitResult.resetTime 
        },
        { status: 429 }
      );
    }

    await connectToDatabase();

    const { id: storyId } = params;
    const body = await request.json();

    // Validate request data
    const validation = commentSchema.safeParse({
      ...body,
      storyId
    });

    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid comment data',
          errors: validation.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const { content, commentType, highlightedText, position } = validation.data;

    // Check if story exists
    const story = await Story.findById(storyId);
    if (!story) {
      return NextResponse.json(
        { success: false, message: 'Story not found' },
        { status: 404 }
      );
    }

    // Create new comment
    const comment = new Comment({
      storyId,
      commenterId: session.user.id,
      commenterName: session.user.name,
      commenterRole: session.user.role,
      content,
      commentType,
      highlightedText,
      position,
      createdAt: new Date(),
      isResolved: false,
      emojiReactions: []
    });

    await comment.save();

    // Update story's comment count
    await Story.findByIdAndUpdate(storyId, {
      $inc: { commentCount: 1 },
      lastCommentAt: new Date()
    });

    // Populate commenter info for response
    await comment.populate('commenterId', 'name role');

    return NextResponse.json({
      success: true,
      data: comment,
      message: 'Comment added successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Add comment error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to add comment' },
      { status: 500 }
    );
  }
}