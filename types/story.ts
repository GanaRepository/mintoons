// Story element types for the 6-element selection system
export interface StoryElements {
    genre: StoryGenre;
    setting: StorySetting;
    character: StoryCharacter;
    mood: StoryMood;
    conflict: StoryConflict;
    theme: StoryTheme;
  }
  
  export type StoryGenre = 
    | 'adventure' 
    | 'fantasy' 
    | 'mystery' 
    | 'sci-fi' 
    | 'comedy' 
    | 'drama' 
    | 'historical' 
    | 'animal-stories' 
    | 'fairy-tale';
  
  export type StorySetting = 
    | 'enchanted-forest'
    | 'magic-castle'
    | 'ocean-depths'
    | 'space-station'
    | 'city'
    | 'village'
    | 'mountains'
    | 'desert'
    | 'underground-cave';
  
  export type StoryCharacter = 
    | 'brave-explorer'
    | 'talking-animal'
    | 'wise-wizard'
    | 'robot-friend'
    | 'dragon'
    | 'princess-prince'
    | 'detective'
    | 'superhero'
    | 'ordinary-kid';
  
  export type StoryMood = 
    | 'exciting'
    | 'funny'
    | 'mysterious'
    | 'scary'
    | 'peaceful'
    | 'adventurous';
  
  export type StoryConflict = 
    | 'lost-treasure'
    | 'rescue-mission'
    | 'mystery-to-solve'
    | 'evil-to-defeat'
    | 'competition'
    | 'discovery';
  
  export type StoryTheme = 
    | 'friendship'
    | 'courage'
    | 'kindness'
    | 'adventure'
    | 'family'
    | 'discovery';
  
  // Story status and progression
  export type StoryStatus = 'draft' | 'in-progress' | 'completed' | 'published' | 'archived';
  export type StoryStage = 1 | 2 | 3 | 4 | 5; // Progressive learning stages
  
  // Main story interface
  export interface Story {
    id: string;
    title: string;
    content: string;
    authorId: string;
    authorName: string;
    authorAge: number;
    
    // Story configuration
    elements: StoryElements;
    stage: StoryStage;
    wordCount: number;
    targetWordCount: number;
    
    // Status and timestamps
    status: StoryStatus;
    createdAt: Date;
    updatedAt: Date;
    publishedAt?: Date;
    completedAt?: Date;
    
    // AI collaboration data
    aiSessions: AIWritingSession[];
    aiAssessment?: AIAssessment;
    
    // Mentor feedback
    mentorComments: Comment[];
    mentorAssessment?: MentorAssessment;
    
    // Metadata
    readingTime: number; // in minutes
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    isPublic: boolean;
    tags: string[];
    
    // Export and sharing
    exportHistory: ExportRecord[];
    shareCount: number;
    viewCount: number;
    
    // Analytics
    timeSpentWriting: number; // in minutes
    sessionsCount: number;
    revisionCount: number;
  }
  
  // AI writing session for collaborative writing
  export interface AIWritingSession {
    id: string;
    storyId: string;
    sessionNumber: number;
    childInput: string;
    childWordCount: number;
    aiResponse: string;
    aiResponseType: AIResponseType;
    timestamp: Date;
    
    // Quality metrics
    grammarScore?: number;
    creativityScore?: number;
    coherenceScore?: number;
  }
  
  export type AIResponseType = 'continue' | 'twist' | 'character' | 'challenge';
  
  // AI assessment after story completion
  export interface AIAssessment {
    storyId: string;
    assessmentDate: Date;
    
    // Core scores (0-100)
    grammarScore: number;
    creativityScore: number;
    overallScore: number;
    
    // Detailed feedback
    feedback: string;
    suggestions: string[];
    strengths: string[];
    improvements: string[];
    
    // Reading level assessment
    readingLevel: string;
    vocabularyLevel: number;
    sentenceComplexity: number;
    
    // Story structure analysis
    hasBeginning: boolean;
    hasMiddle: boolean;
    hasEnd: boolean;
    themeIntegration: number; // 0-100
    characterDevelopment: number; // 0-100
    plotProgression: number; // 0-100
  }
  
  // Mentor assessment and feedback
  export interface MentorAssessment {
    id: string;
    storyId: string;
    mentorId: string;
    mentorName: string;
    assessmentDate: Date;
    
    // Mentor scores
    grammarFeedback: number; // 0-100
    creativityRating: number; // 0-100
    effortScore: number; // 0-100
    
    // Qualitative feedback
    improvementAreas: string[];
    encouragement: string;
    overallProgress: string;
    nextStepsRecommendation: string;
    
    // Learning objectives
    skillsImproved: string[];
    skillsToFocus: string[];
    
    // Comparison with previous work
    improvementSinceLastStory?: string;
    consistentStrengths?: string[];
  }
  
  // Comment system for mentor feedback
  export interface Comment {
    id: string;
    storyId: string;
    commenterId: string;
    commenterName: string;
    commenterRole: 'mentor' | 'admin';
    
    // Comment content
    content: string;
    highlightedText?: string;
    textPosition?: {
      start: number;
      end: number;
    };
    
    // Comment categorization
    commentType: CommentType;
    category: CommentCategory;
    
    // Status and interaction
    isResolved: boolean;
    childResponse?: string;
    emojiReactions: string[];
    
    // Timestamps
    createdAt: Date;
    updatedAt: Date;
    resolvedAt?: Date;
    
    // Threading
    parentCommentId?: string;
    replies: Comment[];
  }
  
  export type CommentType = 'grammar' | 'creativity' | 'suggestion' | 'praise' | 'improvement' | 'question';
  export type CommentCategory = 'structure' | 'vocabulary' | 'character' | 'plot' | 'dialogue' | 'description';
  
  // Story creation workflow
  export interface StoryCreationSession {
    id: string;
    userId: string;
    
    // Current state
    currentStep: CreationStep;
    selectedElements?: Partial<StoryElements>;
    storyDraft?: string;
    currentWordCount: number;
    
    // AI state
    aiOpening?: string;
    aiContext?: string;
    nextPrompt?: string;
    
    // Session metadata
    startedAt: Date;
    lastUpdatedAt: Date;
    isActive: boolean;
    timeSpent: number; // in seconds
    
    // Auto-save data
    autoSaveContent?: string;
    autoSaveTimestamp?: Date;
  }
  
  export type CreationStep = 
    | 'element-selection'
    | 'ai-opening'
    | 'collaborative-writing'
    | 'assessment-review'
    | 'final-review'
    | 'published';
  
  // Story statistics and analytics
  export interface StoryStatistics {
    userId: string;
    totalStories: number;
    publishedStories: number;
    averageWordCount: number;
    averageGrammarScore: number;
    averageCreativityScore: number;
    
    // Time tracking
    totalWritingTime: number; // in minutes
    averageTimePerStory: number; // in minutes
    
    // Progress tracking
    storiesPerStage: Record<StoryStage, number>;
    improvementTrend: number; // percentage improvement
    consistencyRating: number; // how regular the writing habit is
    
    // Engagement metrics
    mentorInteractions: number;
    commentsReceived: number;
    commentsResolved: number;
    
    // Achievement tracking
    achievements: string[];
    currentStreak: number; // days
    longestStreak: number; // days
    
    // Last updated
    lastCalculated: Date;
  }
  
  // Export functionality
  export interface ExportRecord {
    id: string;
    storyId: string;
    userId: string;
    format: 'pdf' | 'word' | 'txt';
    status: 'pending' | 'processing' | 'completed' | 'failed';
    downloadUrl?: string;
    fileSize?: number;
    createdAt: Date;
    expiresAt: Date;
    downloadCount: number;
  }
  
  export interface ExportOptions {
    format: 'pdf' | 'word' | 'txt';
    includeComments: boolean;
    includeCoverPage: boolean;
    includeIllustrations: boolean;
    includeAssessment: boolean;
    template: 'default' | 'classic' | 'modern' | 'playful';
    paperSize?: 'A4' | 'Letter' | 'A5';
    margins?: 'normal' | 'narrow' | 'wide';
  }
  
  // Story search and filtering
  export interface StoryFilters {
    status?: StoryStatus[];
    stage?: StoryStage[];
    genre?: StoryGenre[];
    dateRange?: {
      from: Date;
      to: Date;
    };
    wordCountRange?: {
      min: number;
      max: number;
    };
    authorAge?: {
      min: number;
      max: number;
    };
    hasComments?: boolean;
    isPublished?: boolean;
    mentorId?: string;
  }
  
  export interface StorySearchParams extends StoryFilters {
    query?: string;
    sortBy?: 'createdAt' | 'updatedAt' | 'wordCount' | 'grammarScore' | 'creativityScore';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }
  
  // Story templates and prompts
  export interface StoryTemplate {
    id: string;
    name: string;
    description: string;
    elements: StoryElements;
    openingPrompt: string;
    targetWordCount: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    ageGroup: string;
    isActive: boolean;
    usageCount: number;
    createdAt: Date;
  }
  
  // Collaborative writing prompts
  export interface WritingPrompt {
    id: string;
    text: string;
    type: AIResponseType;
    context: string;
    targetWordCount: number;
    difficulty: number; // 1-10
    createdAt: Date;
    usageCount: number;
    effectiveness: number; // 0-1 based on user engagement
  }