// File 109: app/api/admin/content-moderation/route.ts - Content Moderation API
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import Story from '@/models/Story';
import { ContentFilter } from '@/lib/content-filter';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    const url = new URL(request.url);
    const status = url.searchParams.get('status') || 'pending';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');

    const stories = await Story.find({ moderationStatus: status })
      .populate('author', 'username email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Story.countDocuments({ moderationStatus: status });

    return NextResponse.json({
      stories,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Content moderation fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storyId, action, notes } = await request.json();
    
    if (!storyId || !action) {
      return NextResponse.json({ error: 'Story ID and action required' }, { status: 400 });
    }

    await connectToDatabase();
    
    const story = await Story.findById(storyId);
    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    // Update moderation status
    story.moderationStatus = action; // 'approved', 'rejected', 'flagged'
    if (notes) {
      story.moderationNotes.push({
        moderator: session.user.id,
        action,
        notes,
        timestamp: new Date(),
      });
    }

    await story.save();

    // If rejected, notify the author
    if (action === 'rejected') {
      // Send notification to author
      // Implementation depends on notification system
    }

    return NextResponse.json({ message: 'Moderation action completed' });
  } catch (error) {
    console.error('Content moderation action error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
