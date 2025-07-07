import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import Story from '@/models/Story';
import { checkRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

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

    // Rate limiting - 30 likes per minute
    const rateLimitResult = await checkRateLimit(
      `likes:${session.user.id}`,
      30,
      60 * 1000 // 1 minute
    );

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Too many likes. Please slow down.',
          retryAfter: rateLimitResult.resetTime 
        },
        { status: 429 }
      );
    }

    await connectToDatabase();

    const { id: storyId } = params;
    const userId = session.user.id;

    // Find the story
    const story = await Story.findById(storyId);
    if (!story) {
      return NextResponse.json(
        { success: false, message: 'Story not found' },
        { status: 404 }
      );
    }

    // Check if story is published
    if (story.status !== 'published') {
      return NextResponse.json(
        { success: false, message: 'Can only like published stories' },
        { status: 400 }
      );
    }

    // Initialize likes array if it doesn't exist
    if (!story.likedBy) {
      story.likedBy = [];
    }

    // Check if user already liked the story
    const hasLiked = story.likedBy.some((like: any) => 
      like.userId?.toString() === userId || like.toString() === userId
    );

    if (hasLiked) {
      // Unlike the story
      story.likedBy = story.likedBy.filter((like: any) => 
        like.userId?.toString() !== userId && like.toString() !== userId
      );
      story.likes = Math.max(0, story.likes - 1);
    } else {
      // Like the story
      story.likedBy.push({
        userId,
        likedAt: new Date()
      });
      story.likes += 1;
    }

    await story.save();

    return NextResponse.json({
      success: true,
      data: {
        isLiked: !hasLiked,
        likes: story.likes
      },
      message: hasLiked ? 'Story unliked' : 'Story liked'
    });

  } catch (error) {
    console.error('Like story error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update like status' },
      { status: 500 }
    );
  }
}

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
    const userId = session.user.id;

    // Find the story
    const story = await Story.findById(storyId).select('likes likedBy');
    if (!story) {
      return NextResponse.json(
        { success: false, message: 'Story not found' },
        { status: 404 }
      );
    }

    // Check if user has liked the story
    const hasLiked = story.likedBy?.some((like: any) => 
      like.userId?.toString() === userId || like.toString() === userId
    ) || false;

    return NextResponse.json({
      success: true,
      data: {
        isLiked: hasLiked,
        likes: story.likes || 0
      }
    });

  } catch (error) {
    console.error('Get like status error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to get like status' },
      { status: 500 }
    );
  }
}