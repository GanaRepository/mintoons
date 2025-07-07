import { NextRequest, NextResponse } from 'next/server';
import { requireAuthApi } from '@/lib/auth';
import { aiGenerateSchema } from '@/lib/validations';
import { checkAIRateLimit } from '@/lib/rate-limit';
import { SecurityLogger } from '@/lib/security';
import { generateStory } from '@/lib/ai-providers';
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
          reason: 'AI generation limit exceeded',
          limitType: 'ai_generation',
        },
        user.id,
        'medium'
      );

      return NextResponse.json(
        {
          success: false,
          message: 'AI generation limit reached',
          error: aiLimitResult.error,
        },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await req.json();

    // Validate input
    const validation = aiGenerateSchema.safeParse(body);
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

    const { elements, userAge, previousContent } = validation.data;

    // Log AI request for monitoring
    await SecurityLogger.logEvent(
      'ai_request',
      req,
      { 
        type: 'generation',
        elements,
        userAge,
        hasPreviousContent: !!previousContent,
      },
      user.id,
      'info'
    );

    // Generate story content with AI
    const aiResponse = await generateStory(elements, userAge);

    // Estimate cost (this would be more accurate with actual token counts)
    const estimatedCost = 0.02; // $0.02 per generation as per our optimization

    // Track AI usage
    await trackAIGeneration(
      'default', // This would be the actual provider used
      estimatedCost,
      user.id
    );

    // Return the AI response
    statusCode = 200;
    return NextResponse.json(
      {
        success: true,
        data: {
          opening: aiResponse.opening,
          responseTemplates: aiResponse.responseTemplates,
          estimatedWordCount: aiResponse.wordCount,
          metadata: {
            provider: 'default',
            cost: estimatedCost,
            generatedAt: new Date().toISOString(),
          },
        },
      },
      { status: 200 }
    );

  } catch (error) {
    statusCode = 500;
    
    await logError(
      'AI story generation failed',
      {
        url: req.url,
        method: req.method,
        userAgent: req.headers.get('user-agent'),
      },
      { error: error instanceof Error ? error.message : 'Unknown error' },
      error instanceof Error ? error.stack : undefined
    );

    // Provide fallback response for better UX
    const fallbackResponse = {
      opening: "Once upon a time, there was an amazing story waiting to be told...",
      responseTemplates: {
        continue: ["What happens next in your adventure?"],
        twist: ["Add an unexpected surprise to your story!"],
        character: ["Introduce a new character to your tale!"],
        challenge: ["Create an exciting challenge for your hero!"],
      },
      estimatedWordCount: 300,
    };

    return NextResponse.json(
      {
        success: false,
        message: 'AI generation temporarily unavailable',
        fallback: fallbackResponse,
        error: 'Please try again in a moment',
      },
      { status: 500 }
    );
  } finally {
    // Track API performance
    const responseTime = performance.now() - startTime;
    await trackAPIPerformance(
      '/api/ai/generate',
      'POST',
      responseTime,
      statusCode
    );
  }
}