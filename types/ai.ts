// AI Provider types
export type AIProvider = 'openai' | 'anthropic' | 'google';

export interface AIProviderConfig {
  name: AIProvider;
  displayName: string;
  models: AIModel[];
  isActive: boolean;
  priority: number; // 1-10, higher = preferred
  costPerToken: number;
  maxTokens: number;
  rateLimitPerMinute: number;
  features: AIProviderFeatures;
}

export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
  displayName: string;
  description: string;
  
  // Performance characteristics
  costPerToken: number;
  maxTokens: number;
  contextWindow: number;
  
  // Capabilities
  supportsStoryGeneration: boolean;
  supportsAssessment: boolean;
  supportsIllustration: boolean;
  ageAppropriate: boolean;
  
  // Quality metrics
  creativityRating: number; // 1-10
  grammarAccuracy: number; // 1-10
  responseSpeed: number; // 1-10
  consistency: number; // 1-10
  
  isActive: boolean;
  lastUpdated: Date;
}

export interface AIProviderFeatures {
  storyGeneration: boolean;
  storyAssessment: boolean;
  imageGeneration: boolean;
  contentModeration: boolean;
  grammarCheck: boolean;
  creativityAnalysis: boolean;
  ageFilterinag: boolean;
}

// AI Provider credentials (stored securely in MongoDB)
export interface AIProviderCredentials {
  id: string;
  provider: AIProvider;
  apiKey: string; // encrypted
  organizationId?: string;
  projectId?: string;
  region?: string;
  
  // Usage tracking
  requestsCount: number;
  tokensUsed: number;
  totalCost: number;
  lastUsed: Date;
  
  // Status
  isActive: boolean;
  lastValidated: Date;
  validationStatus: 'valid' | 'invalid' | 'expired' | 'rate_limited';
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // admin user ID
}

// AI Request and Response types
export interface AIRequest {
  id: string;
  userId: string;
  storyId?: string;
  
  // Request details
  provider: AIProvider;
  model: string;
  type: AIRequestType;
  prompt: string;
  context?: string;
  
  // Parameters
  maxTokens: number;
  temperature: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  
  // Age-based filtering
  ageGroup: string;
  contentFilter: ContentFilterLevel;
  
  // Timestamps
  requestedAt: Date;
  completedAt?: Date;
  
  // Response
  response?: AIResponse;
  error?: string;
  
  // Cost tracking
  tokensUsed: number;
  cost: number;
}

export type AIRequestType = 
  | 'story_opening'
  | 'story_continuation'
  | 'story_assessment'
  | 'story_illustration'
  | 'grammar_check'
  | 'creativity_feedback'
  | 'content_moderation';

export interface AIResponse {
  id: string;
  requestId: string;
  
  // Response content
  content: string;
  alternativeResponses?: string[];
  
  // Metadata
  tokensUsed: number;
  processingTime: number; // milliseconds
  confidence: number; // 0-1
  
  // Quality metrics
  appropriateness: number; // 0-1
  creativity: number; // 0-1
  coherence: number; // 0-1
  
  // Safety checks
  contentWarnings: string[];
  safetyScore: number; // 0-1
  
  // Provider-specific data
  providerMetadata?: Record<string, any>;
  
  // Timestamps
  generatedAt: Date;
}

export type ContentFilterLevel = 'minimal' | 'moderate' | 'strict';

// Story generation specific types
export interface StoryGenerationRequest {
  elements: {
    genre: string;
    setting: string;
    character: string;
    mood: string;
    conflict: string;
    theme: string;
  };
  targetWordCount: number;
  ageGroup: string;
  childAge: number;
  writingLevel: number; // 1-10
  previousStories?: string[]; // for context
}

export interface StoryGenerationResponse {
  opening: string;
  suggestedContinuations: StoryContinuation[];
  characterDescriptions: Record<string, string>;
  settingDescription: string;
  plotOutline: string[];
  estimatedWordCount: number;
  difficulty: number; // 1-10
}

export interface StoryContinuation {
  type: 'continue' | 'twist' | 'character' | 'challenge';
  text: string;
  prompt: string;
  probability: number; // 0-1, likelihood this continuation fits
  creativity: number; // 1-10
  difficulty: number; // 1-10
}

// Story assessment types
export interface StoryAssessmentRequest {
  storyText: string;
  authorAge: number;
  targetGrade?: string;
  elements: {
    genre: string;
    theme: string;
  };
  previousAssessments?: StoryAssessment[];
}

export interface StoryAssessment {
  overall: AssessmentScore;
  grammar: GrammarAssessment;
  creativity: CreativityAssessment;
  structure: StructureAssessment;
  vocabulary: VocabularyAssessment;
  
  // Feedback
  overallFeedback: string;
  specificFeedback: SpecificFeedback[];
  improvements: ImprovementSuggestion[];
  strengths: string[];
  
  // Metrics
  readingLevel: string;
  wordCount: number;
  sentenceCount: number;
  averageWordsPerSentence: number;
  
  // Comparison
  ageGroupComparison: string;
  improvementFromPrevious?: number; // percentage
  
  // Assessment metadata
  assessedAt: Date;
  assessorModel: string;
  confidence: number; // 0-1
}

export interface AssessmentScore {
  score: number; // 0-100
  grade: string; // A+, A, B+, etc.
  percentile: number; // compared to age group
  description: string;
}

export interface GrammarAssessment extends AssessmentScore {
  punctuation: number; // 0-100
  capitalization: number; // 0-100
  spelling: number; // 0-100
  sentenceStructure: number; // 0-100
  subjectVerbAgreement: number; // 0-100
  commonErrors: GrammarError[];
}

export interface CreativityAssessment extends AssessmentScore {
  originality: number; // 0-100
  imagination: number; // 0-100
  characterDevelopment: number; // 0-100
  plotCreativity: number; // 0-100
  languageCreativity: number; // 0-100
  uniqueElements: string[];
}

export interface StructureAssessment extends AssessmentScore {
  hasBeginning: boolean;
  hasMiddle: boolean;
  hasEnd: boolean;
  themeIntegration: number; // 0-100
  plotProgression: number; // 0-100
  coherence: number; // 0-100
  pacing: number; // 0-100
}

export interface VocabularyAssessment extends AssessmentScore {
  vocabularyLevel: number; // grade level
  wordDiversity: number; // 0-100
  descriptiveLanguage: number; // 0-100
  appropriateWords: number; // 0-100
  advancedWords: string[];
  simpleWords: string[];
}

export interface GrammarError {
  type: 'punctuation' | 'spelling' | 'capitalization' | 'structure';
  text: string;
  position: number;
  suggestion: string;
  explanation: string;
  severity: 'low' | 'medium' | 'high';
}

export interface SpecificFeedback {
  category: 'grammar' | 'creativity' | 'structure' | 'vocabulary';
  type: 'praise' | 'suggestion' | 'correction';
  text: string;
  position?: number;
  explanation?: string;
  example?: string;
}

export interface ImprovementSuggestion {
  area: string;
  suggestion: string;
  priority: 'low' | 'medium' | 'high';
  difficulty: number; // 1-10
  examples: string[];
  exercises?: string[];
}

// AI Illustration generation (future feature)
export interface IllustrationRequest {
  storyId: string;
  sceneDescription: string;
  characters: string[];
  setting: string;
  mood: string;
  style: IllustrationStyle;
  childAge: number;
  safetyLevel: ContentFilterLevel;
}

export type IllustrationStyle = 
  | 'cartoon'
  | 'realistic'
  | 'watercolor'
  | 'pencil'
  | 'digital'
  | 'storybook';

export interface IllustrationResponse {
  imageUrl: string;
  thumbnailUrl: string;
  description: string;
  style: IllustrationStyle;
  safetyChecked: boolean;
  generationTime: number; // milliseconds
  cost: number;
  metadata: {
    width: number;
    height: number;
    format: string;
    size: number; // bytes
  };
}

// AI Provider monitoring and analytics
export interface AIProviderMetrics {
  provider: AIProvider;
  date: Date;
  
  // Usage metrics
  requestsCount: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number; // milliseconds
  
  // Cost metrics
  totalTokensUsed: number;
  totalCost: number;
  costPerRequest: number;
  
  // Quality metrics
  averageUserRating: number; // 1-5
  appropriatenessScore: number; // 0-1
  creativityScore: number; // 0-1
  
  // Error tracking
  errorRate: number; // 0-1
  commonErrors: string[];
  
  // Performance comparison
  performanceRank: number; // 1-N among providers
  costEfficiencyRank: number;
  qualityRank: number;
}

// AI Provider switching and fallback
export interface AIProviderStrategy {
  primaryProvider: AIProvider;
  fallbackProviders: AIProvider[];
  switchingRules: SwitchingRule[];
  costOptimization: boolean;
  qualityThreshold: number; // 0-1
  maxRetries: number;
}

export interface SwitchingRule {
  condition: 'error' | 'timeout' | 'cost_limit' | 'quality_below_threshold';
  threshold?: number;
  action: 'switch_provider' | 'retry' | 'fail';
  targetProvider?: AIProvider;
}

// AI Content moderation
export interface ContentModerationRequest {
  text: string;
  userAge: number;
  context: 'story_content' | 'user_input' | 'comment';
  strictness: ContentFilterLevel;
}

export interface ContentModerationResponse {
  isAppropriate: boolean;
  confidenceScore: number; // 0-1
  flaggedContent: FlaggedContent[];
  suggestedAlternatives?: string[];
  ageAppropriate: boolean;
  safetyRating: number; // 0-1
}

export interface FlaggedContent {
  type: 'violence' | 'inappropriate_language' | 'scary_content' | 'adult_themes';
  severity: 'low' | 'medium' | 'high';
  text: string;
  position: number;
  reason: string;
  suggestion?: string;
}

// AI Training and fine-tuning (future feature)
export interface AITrainingData {
  id: string;
  provider: AIProvider;
  type: 'story_examples' | 'assessment_examples' | 'feedback_examples';
  data: TrainingExample[];
  status: 'preparing' | 'training' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
  performance: TrainingPerformance;
}

export interface TrainingExample {
  input: string;
  expectedOutput: string;
  context?: Record<string, any>;
  quality: number; // 1-10
  verified: boolean;
}

export interface TrainingPerformance {
  accuracy: number; // 0-1
  improvementOverBaseline: number; // percentage
  testSetPerformance: number; // 0-1
  deploymentRecommended: boolean;
}