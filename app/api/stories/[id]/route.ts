import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/utils/db';
import Story from '@/models/Story';
import { updateStorySchema } from '@/lib/validations';
import { requireAuthApi, validateStoryAccess } from '@/lib/auth';
import { checkUserActionLimit } from '@/lib/rate-limit';
import { ContentFilter, SecurityLogger } from '@/lib/security';
import { assessStory } from '@/lib/ai-providers';
import { trackStoryCompleted } from '@/lib/analytics';
import { logError, trackAPIPerformance } from '@/lib/monitoring';
import { notifyStoryUpdate, notifyAchievement } from '@/lib/pusher';

export const dynamic = 'force-dynamic';

// GET - Fetch individual story
export async function GET(
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

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      statusCode = 400;
      return NextResponse.json(
        { success: false, message: 'Invalid story ID' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Find story
    const story = await Story.findById(id)
      .populate('authorId', 'name email age')
      .lean();

    if (!story) {
      statusCode = 404;
      return NextResponse.json(
        { success: false, message: 'Story not found' },
        { status: 404 }
      );
    }

    // Check access permissions
    const hasAccess = await validateStoryAccess(story.authorId.toString());
    if (!hasAccess) {
      statusCode = 403;
      await SecurityLogger.logEvent(
        'permission_denied',
        req,
        { 
          reason: 'Unauthorized story access attempt',
          storyId: id,
          requestedBy: user.id,
          storyOwner: story.authorId.toString(),
        },
        user.id,
        'medium'
      );

      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    statusCode = 200;
    return NextResponse.json(
      {
        success: true,
        data: { story },
      },
      { status: 200 }
    );

  } catch (error) {
    statusCode = 500;
    
    await logError(
      'Failed to fetch story',
      {
        storyId: params.id,
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
        message: 'Failed to fetch story',
      },
      { status: 500 }
    );
  } finally {
    // Track API performance
    const responseTime = performance.now() - startTime;
    await trackAPIPerformance(
      `/api/stories/${params.id}`,
      'GET',
      responseTime,
      statusCode
    );
  }
}

// PUT - Update story
export async function PUT(
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

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      statusCode = 400;
      return NextResponse.json(
        { success: false, message: 'Invalid story ID' },
        { status: 400 }
      );
    }

    // Check rate limits
    const rateLimitResult = await checkUserActionLimit(
      user.id,
      user.role,
      'story_update'
    );

    if (!rateLimitResult.allowed) {
      statusCode = 429;
      return NextResponse.json(
        {
          success: false,
          message: 'Story update limit reached',
          retryAfter: Math.ceil((rateLimitResult.resetTime.getTime() - Date.now()) / 1000),
        },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await req.json();

    // Validate input
    const validation = updateStorySchema.safeParse(body);
    if (!validation.success) {
      statusCode = 400;
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: validation.error.errors.reduce((acc, error) => {
            acc[error.path.join('.')] = error.message;
            return acc;
          }, {} as Record<string, string>),
        },
        { status: 400 }
      );
    }

    const updateData = validation.data;

    // Connect to database
    await connectToDatabase();

    // Find story
    const story = await Story.findById(id);
    if (!story) {
      statusCode = 404;
      return NextResponse.json(
        { success: false, message: 'Story not found' },
        { status: 404 }
      );
    }

    // Check access permissions
    const hasAccess = await validateStoryAccess(story.authorId.toString());
    if (!hasAccess) {
      statusCode = 403;
      await SecurityLogger.logEvent(
        'permission_denied',
        req,
        { 
          reason: 'Unauthorized story update attempt',
          storyId: id,
          requestedBy: user.id,
          storyOwner: story.authorId.toString(),
        },
        user.id,
        'medium'
      );

      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    // Content filtering if updating content or title
    if (updateData.content) {
      const contentFilter = ContentFilter.filterContent(updateData.content);
      if (!contentFilter.isClean) {
        statusCode = 400;
        await SecurityLogger.logEvent(
          'content_violation',
          req,
          { violations: contentFilter.violations, field: 'content', storyId: id },
          user.id,
          'medium'
        );

        return NextResponse.json(
          {
            success: false,
            message: 'Content contains inappropriate material',
            errors: { content: 'Please revise your story content' },
          },
          { status: 400 }
        );
      }
      updateData.content = contentFilter.cleanedContent;
    }

    if (updateData.title) {
      const titleFilter = ContentFilter.filterContent(updateData.title);
      if (!titleFilter.isClean) {
        statusCode = 400;
        return NextResponse.json(
          {
            success: false,
            message: 'Title contains inappropriate content',
            errors: { title: 'Please choose an appropriate title' },
          },
          { status: 400 }
        );
      }
      updateData.title = titleFilter.cleanedContent;
    }

    // Calculate word count if content is updated
    if (updateData.content) {
      updateData.wordCount = updateData.content.split(/\s+/).length;
    }

    // Handle status changes
    let assessment = null;
    let shouldNotifyCompletion = false;

    if (updateData.status === 'published' && story.status !== 'published') {
      // Story is being published - run AI assessment
      try {
        assessment = await assessStory(
          updateData.content || story.content,
          story.elements,
          user.age || 10
        );

        updateData.assessment = assessment;
        updateData.completedAt = new Date();
        shouldNotifyCompletion = true;

        // Track story completion
        await trackStoryCompleted(
          id,
          user.id,
          assessment.overallScore,
          {
            wordCount: updateData.wordCount || story.wordCount,
            elements: story.elements,
          }
        );

      } catch (aiError) {
        await logError(
          'AI assessment failed during story publication',
          { storyId: id, userId: user.id },
          { error: aiError }
        );

        // Provide basic assessment
        assessment = {
          grammarScore: 75,
          creativityScore: 80,
          overallScore: 78,
          feedback: 'Great job on completing your story! Keep writing to improve your skills.',
          suggestions: ['Keep practicing your writing skills!'],
          strengths: ['Story completion'],
          improvements: ['Continue writing regularly'],
          readingLevel: 'Age appropriate',
        };

        updateData.assessment = assessment;
        updateData.completedAt = new Date();
      }
    }

    // Update story
    const updatedStory = await Story.findByIdAndUpdate(
      id,
      {
        ...updateData,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    ).populate('authorId', 'name email');

    if (!updatedStory) {
      statusCode = 404;
      return NextResponse.json(
        { success: false, message: 'Story not found after update' },
        { status: 404 }
      );
    }

    // Notify real-time updates
    await notifyStoryUpdate(
      id,
      user.id,
      updateData.status ? 'status' : 'content'
    );

    // Send completion notifications if story was just published
    if (shouldNotifyCompletion && assessment) {
      // Check for achievements (simplified example)
      const userStoryCount = await Story.countDocuments({
        authorId: user.id,
        status: 'published'
      });

      // First story achievement
      if (userStoryCount === 1) {
        await notifyAchievement(user.id, {
          _id: 'first-story',
          name: 'First Story',
          description: 'Completed your very first story!',
          icon: '🎉',
        });
      }

      // High score achievement
      if (assessment.overallScore >= 90) {
        await notifyAchievement(user.id, {
          _id: 'excellent-writer',
          name: 'Excellent Writer',
          description: 'Achieved a score of 90 or higher!',
          icon: '⭐',
        });
      }
    }

    // Log successful update
    await SecurityLogger.logEvent(
      'story_updated',
      req,
      { 
        storyId: id,
        updateFields: Object.keys(updateData),
        statusChange: updateData.status ? `${story.status} -> ${updateData.status}` : null,
      },
      user.id,
      'info'
    );

    statusCode = 200;
    return NextResponse.json(
      {
        success: true,
        message: 'Story updated successfully',
        data: {
          story: updatedStory,
          assessment: shouldNotifyCompletion ? assessment : undefined,
        },
      },
      { status: 200 }
    );

  } catch (error) {
    statusCode = 500;
    
    await logError(
      'Story update failed',
      {
        storyId: params.id,
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
        message: 'Failed to update story',
      },
      { status: 500 }
    );
  } finally {
    // Track API performance
    const responseTime = performance.now() - startTime;
    await trackAPIPerformance(
      `/api/stories/${params.id}`,
      'PUT',
      responseTime,
      statusCode
    );
  }
}

// DELETE - Delete story
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

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      statusCode = 400;
      return NextResponse.json(
        { success: false, message: 'Invalid story ID' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Find story
    const story = await Story.findById(id);
    if (!story) {
      statusCode = 404;
      return NextResponse.json(
        { success: false, message: 'Story not found' },
        { status: 404 }
      );
    }

    // Check access permissions
    const hasAccess = await validateStoryAccess(story.authorId.toString());
    if (!hasAccess) {
      statusCode = 403;
      await SecurityLogger.logEvent(
        'permission_denied',
        req,
        { 
          reason: 'Unauthorized story deletion attempt',
          storyId: id,
          requestedBy: user.id,
          storyOwner: story.authorId.toString(),
        },
        user.id,
        'high'
      );

      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    // Only allow deletion of draft stories or by admin
    if (story.status !== 'draft' && user.role !== 'admin') {
      statusCode = 400;
      return NextResponse.json(
        {
          success: false,
          message: 'Cannot delete published stories',
          errors: { status: 'Only draft stories can be deleted' },
        },
        { status: 400 }
      );
    }

    // Delete the story
    await Story.findByIdAndDelete(id);

    // Also delete related comments (if implemented)
    // await Comment.deleteMany({ storyId: id });

    // Log successful deletion
    await SecurityLogger.logEvent(
      'story_deleted',
      req,
      { 
        storyId: id,
        storyTitle: story.title,
        storyStatus: story.status,
        wordCount: story.wordCount,
      },
      user.id,
      'info'
    );

    statusCode = 200;
    return NextResponse.json(
      {
        success: true,
        message: 'Story deleted successfully',
      },
      { status: 200 }
    );

  } catch (error) {
    statusCode = 500;
    
    await logError(
      'Story deletion failed',
      {
        storyId: params.id,
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
        message: 'Failed to delete story',
      },
      { status: 500 }
    );
  } finally {
    // Track API performance
    const responseTime = performance.now() - startTime;
    await trackAPIPerformance(
      `/api/stories/${params.id}`,
      'DELETE',
      responseTime,
      statusCode
    );
  }
}