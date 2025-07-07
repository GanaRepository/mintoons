import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import Story from '@/models/Story';
import { createStorySchema, searchStoriesSchema } from '@/lib/validations';
import { requireAuthApi } from '@/lib/auth';
import { checkUserActionLimit } from '@/lib/rate-limit';
import { ContentFilter, SecurityLogger } from '@/lib/security';
import { generateStory } from '@/lib/ai-providers';
import { trackStoryCreated } from '@/lib/analytics';
import { logError, trackAPIPerformance } from '@/lib/monitoring';
import { notifyStoryUpdate } from '@/lib/pusher';

export const dynamic = 'force-dynamic';

// GET - Fetch stories with search/filter
export async function GET(req: NextRequest) {
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

    // Parse search parameters
    const { searchParams } = new URL(req.url);
    const searchQuery = {
      query: searchParams.get('query') || undefined,
      genre: searchParams.get('genre') || undefined,
      status: searchParams.get('status') || undefined,
      authorId: searchParams.get('authorId') || undefined,
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0'),
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    };

    // Validate search parameters
    const validation = searchStoriesSchema.safeParse(searchQuery);
    if (!validation.success) {
      statusCode = 400;
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid search parameters',
          errors: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const validatedQuery = validation.data;

    // Connect to database
    await connectToDatabase();

    // Build MongoDB query
    const mongoQuery: any = {};

    // Access control based on user role
    if (user.role === 'user') {
      // Users can only see their own stories
      mongoQuery.authorId = user.id;
    } else if (user.role === 'mentor') {
      // Mentors can see their assigned students' stories
      // This would require a relationship lookup in a real implementation
      mongoQuery.authorId = user.id; // Simplified for now
    }
    // Admins can see all stories (no additional filter)

    // Apply search filters
    if (validatedQuery.query) {
      mongoQuery.$or = [
        { title: { $regex: validatedQuery.query, $options: 'i' } },
        { content: { $regex: validatedQuery.query, $options: 'i' } },
      ];
    }

    if (validatedQuery.genre) {
      mongoQuery['elements.genre'] = validatedQuery.genre;
    }

    if (validatedQuery.status) {
      mongoQuery.status = validatedQuery.status;
    }

    if (validatedQuery.authorId) {
      mongoQuery.authorId = validatedQuery.authorId;
    }

    // Build sort object
    const sortObj: any = {};
    sortObj[validatedQuery.sortBy] = validatedQuery.sortOrder === 'asc' ? 1 : -1;

    // Execute query
    const [stories, totalCount] = await Promise.all([
      Story.find(mongoQuery)
        .sort(sortObj)
        .skip(validatedQuery.offset)
        .limit(validatedQuery.limit)
        .populate('authorId', 'name email')
        .lean(),
      Story.countDocuments(mongoQuery),
    ]);

    statusCode = 200;
    return NextResponse.json(
      {
        success: true,
        data: {
          stories,
          pagination: {
            total: totalCount,
            limit: validatedQuery.limit,
            offset: validatedQuery.offset,
            hasMore: validatedQuery.offset + validatedQuery.limit < totalCount,
          },
        },
      },
      { status: 200 }
    );

  } catch (error) {
    statusCode = 500;
    
    await logError(
      'Failed to fetch stories',
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
        message: 'Failed to fetch stories',
      },
      { status: 500 }
    );
  } finally {
    // Track API performance
    const responseTime = performance.now() - startTime;
    await trackAPIPerformance(
      '/api/stories',
      'GET',
      responseTime,
      statusCode
    );
  }
}

// POST - Create new story
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
      'story_create'
    );

    if (!rateLimitResult.allowed) {
      statusCode = 429;
      return NextResponse.json(
        {
          success: false,
          message: 'Story creation limit reached',
          retryAfter: Math.ceil((rateLimitResult.resetTime.getTime() - Date.now()) / 1000),
        },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await req.json();

    // Validate input
    const validation = createStorySchema.safeParse(body);
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

    const { title, elements } = validation.data;

    // Content filtering for title
    const titleFilter = ContentFilter.filterContent(title);
    if (!titleFilter.isClean) {
      statusCode = 400;
      await SecurityLogger.logEvent(
        'content_violation',
        req,
        { violations: titleFilter.violations, field: 'title' },
        user.id,
        'medium'
      );

      return NextResponse.json(
        {
          success: false,
          message: 'Title contains inappropriate content',
          errors: { title: 'Please choose an appropriate title' },
        },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Generate AI opening for the story
    let aiResponse;
    try {
      aiResponse = await generateStory(elements, user.age || 10);
    } catch (aiError) {
      await logError(
        'AI story generation failed',
        {
          userId: user.id,
          elements,
          userAge: user.age,
        },
        { error: aiError }
      );

      // Provide fallback content
      aiResponse = {
        opening: `Once upon a time, in a ${elements.setting.toLowerCase()}, there lived a ${elements.character.toLowerCase()}...`,
        responseTemplates: {
          continue: ['What happens next in your story?'],
          twist: ['Add an unexpected surprise!'],
          character: ['Introduce a new character!'],
          challenge: ['Create a challenge for your character!'],
        },
        wordCount: 300,
      };
    }

    // Create story
    const story = new Story({
      title: titleFilter.cleanedContent,
      authorId: user.id,
      elements,
      status: 'draft',
      content: aiResponse.opening,
      aiResponse: {
        opening: aiResponse.opening,
        responseTemplates: aiResponse.responseTemplates,
        estimatedWordCount: aiResponse.wordCount,
      },
      wordCount: aiResponse.opening.split(/\s+/).length,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await story.save();

    // Track story creation
    await trackStoryCreated(story._id.toString(), user.id, {
      elements,
      aiProvider: 'default',
      estimatedWordCount: aiResponse.wordCount,
    });

    // Notify real-time updates
    await notifyStoryUpdate(
      story._id.toString(),
      user.id,
      'content'
    );

    // Log successful creation
    await SecurityLogger.logEvent(
      'story_created',
      req,
      { 
        storyId: story._id.toString(),
        elements,
        wordCount: story.wordCount,
      },
      user.id,
      'info'
    );

    statusCode = 201;
    return NextResponse.json(
      {
        success: true,
        message: 'Story created successfully',
        data: {
          story: {
            id: story._id.toString(),
            title: story.title,
            elements: story.elements,
            content: story.content,
            status: story.status,
            aiResponse: story.aiResponse,
            wordCount: story.wordCount,
            createdAt: story.createdAt,
          },
        },
      },
      { status: 201 }
    );

  } catch (error) {
    statusCode = 500;
    
    await logError(
      'Story creation failed',
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
        message: 'Failed to create story',
      },
      { status: 500 }
    );
  } finally {
    // Track API performance
    const responseTime = performance.now() - startTime;
    await trackAPIPerformance(
      '/api/stories',
      'POST',
      responseTime,
      statusCode
    );
  }
}