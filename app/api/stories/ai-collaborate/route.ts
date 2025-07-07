import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import rateLimit from '@/lib/rate-limit';

// Rate limiting for AI requests
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

interface AICollaborationRequest {
  storyContent: string;
  selectedText?: string;
  type: 'continuation' | 'improvement' | 'character' | 'plot' | 'dialogue' | 'feedback' | 'story_starter' | 'custom';
  prompt?: string;
  genre?: string;
  targetAge?: string;
  context?: {
    wordCount?: number;
    lastParagraph?: string;
    title?: string;
    tags?: string[];
  };
}

interface AISuggestion {
  id: string;
  type: string;
  content: string;
  context?: string;
  confidence: number;
}

// Mock AI provider - In production, you'd use OpenAI, Claude, etc.
class AIProvider {
  static async generateSuggestions(request: AICollaborationRequest): Promise<AISuggestion[]> {
    const { type, storyContent, selectedText, prompt, genre = 'adventure', targetAge = '8-12' } = request;
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const suggestions: AISuggestion[] = [];
    
    switch (type) {
      case 'continuation':
        suggestions.push({
          id: `cont_${Date.now()}`,
          type: 'continuation',
          content: this.generateContinuation(storyContent, genre, targetAge),
          confidence: 0.85
        });
        break;
        
      case 'improvement':
        suggestions.push({
          id: `imp_${Date.now()}`,
          type: 'improvement',
          content: this.generateImprovement(selectedText || storyContent, genre, targetAge),
          context: selectedText,
          confidence: 0.78
        });
        break;
        
      case 'character':
        suggestions.push({
          id: `char_${Date.now()}`,
          type: 'character',
          content: this.generateCharacter(genre, targetAge),
          confidence: 0.82
        });
        break;
        
      case 'dialogue':
        suggestions.push({
          id: `dial_${Date.now()}`,
          type: 'dialogue',
          content: this.generateDialogue(storyContent, genre, targetAge),
          confidence: 0.80
        });
        break;
        
      case 'story_starter':
        suggestions.push({
          id: `start_${Date.now()}`,
          type: 'story_starter',
          content: this.generateStoryStarter(genre, targetAge, prompt),
          confidence: 0.88
        });
        break;
        
      case 'feedback':
        suggestions.push(...this.generateFeedback(storyContent, genre, targetAge));
        break;
        
      case 'custom':
        suggestions.push({
          id: `custom_${Date.now()}`,
          type: 'custom',
          content: this.generateCustomResponse(prompt || '', storyContent, genre, targetAge),
          confidence: 0.75
        });
        break;
    }
    
    return suggestions;
  }
  
  private static generateContinuation(storyContent: string, genre: string, targetAge: string): string {
    const continuations = {
      adventure: [
        "Just then, a mysterious figure emerged from behind the ancient oak tree, carrying what appeared to be a glowing map.",
        "The ground beneath their feet began to rumble, and suddenly a hidden passage opened up in the forest floor.",
        "A gentle breeze carried the sound of distant music, leading them toward an adventure they never could have imagined."
      ],
      mystery: [
        "But as they examined the clue more closely, they noticed something that changed everything - a small symbol that seemed oddly familiar.",
        "The next morning, another piece of the puzzle appeared in the most unexpected place: tucked inside their locker at school.",
        "Just when they thought they had solved it, a new mystery presented itself, even more puzzling than the first."
      ],
      fantasy: [
        "The magic within them stirred, responding to something powerful and ancient hidden nearby.",
        "A shimmering portal appeared in the air before them, revealing glimpses of a world beyond their wildest dreams.",
        "The wise old owl perched on the windowsill spoke in a voice as clear as a bell: 'The time has come for you to learn the truth.'"
      ]
    };
    
    const options = continuations[genre as keyof typeof continuations] || continuations.adventure;
    return options[Math.floor(Math.random() * options.length)];
  }
  
  private static generateImprovement(text: string, genre: string, targetAge: string): string {
    const improvements = [
      "Consider adding more sensory details - what did it smell like? What sounds filled the air?",
      "This scene could benefit from showing the character's emotions through their actions rather than just stating how they feel.",
      "Try varying your sentence length to create better rhythm and flow in your writing.",
      "Adding dialogue here could help bring the characters to life and move the story forward.",
      "Consider describing the setting in more detail to help readers visualize the scene."
    ];
    
    return improvements[Math.floor(Math.random() * improvements.length)];
  }
  
  private static generateCharacter(genre: string, targetAge: string): string {
    const characters = {
      adventure: [
        "Maya, a skilled young cartographer who can read maps that others can't see, joins the quest with her enchanted compass.",
        "Captain Finn, a talking parrot with a mysterious past, becomes an unlikely ally with knowledge of ancient treasures.",
        "Sam, a quiet kid from school who turns out to have an extraordinary talent for solving puzzles and riddles."
      ],
      mystery: [
        "Detective Ruby, an eleven-year-old with a keen eye for details that adults often miss, offers to help solve the case.",
        "Mr. Chen, the school's enigmatic janitor, seems to know more about the strange occurrences than he lets on.",
        "Alex's younger sister Emma, who has an uncanny ability to be in the right place at the right time."
      ],
      fantasy: [
        "Luna, a shape-shifting cat who can only be understood by those with magical abilities, becomes a trusted companion.",
        "Master Willow, an ancient tree sprite who teaches the old ways of magic through riddles and nature lessons.",
        "Phoenix, a young dragon rider whose bond with their dragon helps them navigate the mystical realms."
      ]
    };
    
    const options = characters[genre as keyof typeof characters] || characters.adventure;
    return options[Math.floor(Math.random() * options.length)];
  }
  
  private static generateDialogue(storyContent: string, genre: string, targetAge: string): string {
    const dialogues = [
      '"Wait," said Alex, stopping suddenly. "Did you hear that? It sounded like someone calling for help."',
      '"I don\'t think we should go in there," whispered Sam, pointing toward the dark entrance. "What if we get lost?"',
      '"Look at this!" Maya exclaimed, her eyes wide with excitement. "I\'ve never seen anything like it before."',
      '"Are you sure about this?" asked the wise old woman, studying their faces carefully. "Once you begin this journey, there\'s no turning back."',
      '"We can do this together," said Jordan confidently. "We\'ve come too far to give up now."'
    ];
    
    return dialogues[Math.floor(Math.random() * dialogues.length)];
  }
  
  private static generateStoryStarter(genre: string, targetAge: string, customPrompt?: string): string {
    if (customPrompt) {
      return `${customPrompt}\n\nThe adventure began on what seemed like an ordinary Tuesday morning...`;
    }
    
    const starters = {
      adventure: [
        "The old lighthouse had been abandoned for fifty years, but today, a light was shining from its tower. Maya grabbed her backpack and headed toward the mysterious beacon, not knowing that this decision would change her life forever.",
        "When the school's time capsule was finally opened after twenty-five years, nobody expected to find a hand-drawn map leading to somewhere that shouldn't exist. But there it was, as clear as day, marked with an X and the words 'The greatest treasure lies where courage meets curiosity.'",
        "The antique snow globe in Grandma's attic looked ordinary enough, until the moment Jordan shook it and suddenly found themselves standing in the miniature winter village inside, surrounded by talking snowmen and a very confused-looking polar bear."
      ],
      mystery: [
        "Every morning for a week, Sam had found a different colored marble on their windowsill. Today, there were seven marbles arranged in a perfect circle, and underneath them, a note that simply read: 'Follow the pattern, find the truth.'",
        "The new student, Morgan, claimed to be from a town that didn't exist on any map. When Alex tried to look it up online, every search came back empty, as if the place had been erased from the internet entirely.",
        "Mrs. Peterson's class pet hamster, Einstein, had been acting strangely all week - arranging his bedding into complex patterns and squeaking in what almost sounded like morse code. Then, on Friday morning, his cage was empty, and in his place was a tiny rolled-up scroll."
      ],
      fantasy: [
        "On Riley's thirteenth birthday, their reflection in the mirror winked back at them. Not the usual trick of the light or tired imagination - their reflection actually had a mind of its own, and it had been waiting patiently for this moment to finally say hello.",
        "The library's oldest book fell off the shelf and landed open at Casey's feet, revealing pages covered in writing that seemed to shift and change as they watched. Words rearranged themselves into a message: 'The magic was inside you all along. Would you like to learn how to use it?'",
        "When the shooting star crashed in the backyard garden, it didn't leave a crater - it left a door. A perfectly ordinary-looking door standing upright in the middle of the vegetable patch, with warm light spilling out from the crack underneath."
      ]
    };
    
    const options = starters[genre as keyof typeof starters] || starters.adventure;
    return options[Math.floor(Math.random() * options.length)];
  }
  
  private static generateFeedback(storyContent: string, genre: string, targetAge: string): AISuggestion[] {
    const wordCount = storyContent.split(' ').length;
    const feedback: AISuggestion[] = [];
    
    // Strengths
    feedback.push({
      id: `feedback_strength_${Date.now()}`,
      type: 'praise',
      content: "Your story has a great sense of adventure that will keep young readers engaged! The pacing moves along nicely.",
      confidence: 0.90
    });
    
    // Areas for improvement
    if (wordCount < 200) {
      feedback.push({
        id: `feedback_length_${Date.now()}`,
        type: 'suggestion',
        content: "Consider expanding your story with more details about the setting and characters. Readers love to visualize the world you're creating!",
        confidence: 0.85
      });
    }
    
    feedback.push({
      id: `feedback_dialogue_${Date.now()}`,
      type: 'suggestion',
      content: "Adding more dialogue could help bring your characters to life and make the story feel more dynamic.",
      confidence: 0.80
    });
    
    feedback.push({
      id: `feedback_sensory_${Date.now()}`,
      type: 'suggestion',
      content: "Try incorporating more sensory details - what do the characters see, hear, smell, or feel? This helps readers feel like they're part of the story.",
      confidence: 0.82
    });
    
    return feedback;
  }
  
  private static generateCustomResponse(prompt: string, storyContent: string, genre: string, targetAge: string): string {
    // This would use actual AI to respond to custom prompts
    // For now, we'll provide a helpful generic response
    return `Based on your request "${prompt}", here's a suggestion that fits your ${genre} story for ${targetAge} year olds: Consider developing this element further by showing rather than telling, and remember to keep the language age-appropriate while maintaining excitement and engagement.`;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Rate limiting
    try {
      await limiter.check(request, 10, session.user.id); // 10 requests per minute per user
    } catch {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
    
    const body: AICollaborationRequest = await request.json();
    
    // Validate request
    if (!body.storyContent && body.type !== 'story_starter') {
      return NextResponse.json({ error: 'Story content is required' }, { status: 400 });
    }
    
    if (!body.type) {
      return NextResponse.json({ error: 'Request type is required' }, { status: 400 });
    }
    
    // Generate AI suggestions
    const suggestions = await AIProvider.generateSuggestions(body);
    
    // Log AI usage for analytics
    console.log(`AI request: ${session.user.id} - ${body.type} - ${suggestions.length} suggestions`);
    
    return NextResponse.json({
      suggestions,
      type: body.type,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('AI collaboration error:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI suggestions' },
      { status: 500 }
    );
  }
}

// Rate suggestion endpoint
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { suggestionId, rating, storyContent } = await request.json();
    
    // In a real app, you'd store this rating in a database
    // to improve AI suggestions over time
    console.log(`AI suggestion rated: ${suggestionId} - ${rating} by ${session.user.id}`);
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Rating error:', error);
    return NextResponse.json(
      { error: 'Failed to rate suggestion' },
      { status: 500 }
    );
  }
}