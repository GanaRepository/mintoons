import { NextRequest, NextResponse } from 'next/server';
import { requireAuthApi } from '@/lib/auth';
import { aiAssessSchema } from '@/lib/validations';
import { checkAIRateLimit } from '@/lib/rate-limit';
import { SecurityLogger, ContentFilter } from '@/lib/security';
import { assessStory } from '@/lib/ai-providers';
import { trackAIGeneration } from '@/lib/analytics';
import { logError, trackAPIPerformance } from '@/lib/monitoring';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
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

    // Check AI rate limits
    const aiLimitResult = await checkAIRateLimit(user.id);
    if (!aiLimitResult.allowed) {
      statusCode = 429;
      await SecurityLogger.logEvent(
        'rate_limit_exceeded',
        req,
        { 
          reason: 'AI assessment limit exceeded',
          limitType: 'ai_assessment',
        },
        user.id,
        'medium'
      );

      return NextResponse.json(
        {
          success: false,
          message: 'AI assessment limit reached',
          error: aiLimitResult.error,
        },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await req.json();

    // Validate input
    const validation = aiAssessSchema.safeParse(body);
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

    const { content, userAge, elements } = validation.data;

    // Content filtering and safety check
    const contentFilter = ContentFilter.filterContent(content);
    if (!contentFilter.isClean) {
      statusCode = 400;
      await SecurityLogger.logEvent(
        'content_violation',
        req,
        { 
          violations: contentFilter.violations, 
          field: 'story_content',
          contentLength: content.length,
        },
        user.id,
        'medium'
      );

      return NextResponse.json(
        {
          success: false,
          message: 'Content contains inappropriate material',
          violations: contentFilter.violations,
        },
        { status: 400 }
      );
    }

    // Additional validation for story length
    const wordCount = content.split(/\s+/).length;
    if (wordCount < 20) {
      statusCode = 400;
      return NextResponse.json(
        {
          success: false,
          message: 'Story too short for assessment',
          errors: { content: 'Please write at least 20 words before assessment' },
        },
        { status: 400 }
      );
    }

    // Log AI assessment request
    await SecurityLogger.logEvent(
      'ai_request',
      req,
      { 
        type: 'assessment',
        contentLength: content.length,
        wordCount,
        userAge,
        elements,
      },
      user.id,
      'info'
    );

    // Assess story with AI
    const assessment = await assessStory(
      contentFilter.cleanedContent,
      elements,
      userAge
    );

    // Estimate cost for assessment
    const estimatedCost = 0.015; // Slightly less than generation

    // Track AI usage
    await trackAIGeneration(
      'default', // Actual provider would be determined by the AI service
      estimatedCost,
      user.id
    );

    // Enhance assessment with additional metrics
    const enhancedAssessment = {
      ...assessment,
      metadata: {
        wordCount,
        readingTimeMinutes: Math.ceil(wordCount / 200), // Average reading speed
        complexity: wordCount > 300 ? 'high' : wordCount > 150 ? 'medium' : 'low',
        ageAppropriate: userAge >= 6 ? true : wordCount <= 100,
        provider: 'default',
        cost: estimatedCost,
        assessedAt: new Date().toISOString(),
      },
      achievements: this.checkAchievements(assessment, wordCount, userAge),
    };

    statusCode = 200;
    return NextResponse.json(
      {
        success: true,
        data: {
          assessment: enhancedAssessment,
        },
      },
      { status: 200 }
    );

  } catch (error) {
    statusCode = 500;
    
    await logError(
      'AI story assessment failed',
      {
        url: req.url,
        method: req.method,
        userAgent: req.headers.get('user-agent'),
      },
      { error: error instanceof Error ? error.message : 'Unknown error' },
      error instanceof Error ? error.stack : undefined
    );

    // Provide fallback assessment for better UX
    const fallbackAssessment = {
      grammarScore: 75,
      creativityScore: 80,
      overallScore: 78,
      feedback: "Great job completing your story! Keep writing to improve your skills.",
      suggestions: [
        "Continue practicing your writing",
        "Try reading more stories for inspiration",
        "Experiment with different story elements"
      ],
      strengths: [
        "Story completion",
        "Creative effort"
      ],
      improvements: [
        "Grammar practice",
        "Vocabulary expansion"
      ],
      readingLevel: "Age appropriate",
      metadata: {
        assessedAt: new Date().toISOString(),
        fallback: true,
      },
    };

    return NextResponse.json(
      {
        success: false,
        message: 'AI assessment temporarily unavailable',
        fallback: fallbackAssessment,
        error: 'Please try again in a moment',
      },
      { status: 500 }
    );
  } finally {
    // Track API performance
    const responseTime = performance.now() - startTime;
    await trackAPIPerformance(
      '/api/ai/assess',
      'POST',
      responseTime,
      statusCode
    );
  }
}

// Helper function to check for achievements based on assessment
function checkAchievements(assessment: any, wordCount: number, userAge: number): string[] {
  const achievements: string[] = [];

  // Grammar achievements
  if (assessment.grammarScore >= 95) {
    achievements.push('Grammar Master');
  } else if (assessment.grammarScore >= 85) {
    achievements.push('Grammar Expert');
  }

  // Creativity achievements
  if (assessment.creativityScore >= 90) {
    achievements.push('Creative Genius');
  } else if (assessment.creativityScore >= 80) {
    achievements.push('Creative Writer');
  }

  // Overall score achievements
  if (assessment.overallScore >= 95) {
    achievements.push('Perfect Story');
  } else if (assessment.overallScore >= 90) {
    achievements.push('Excellent Writer');
  } else if (assessment.overallScore >= 80) {
    achievements.push('Great Storyteller');
  }

  // Length achievements
  if (wordCount >= 500) {
    achievements.push('Prolific Writer');
  } else if (wordCount >= 300) {
    achievements.push('Detailed Storyteller');
  }

  // Age-appropriate achievements
  if (userAge <= 8 && assessment.overallScore >= 70) {
    achievements.push('Young Talent');
  } else if (userAge <= 12 && assessment.overallScore >= 85) {
    achievements.push('Rising Star');
  }

  return achievements;
}