import mongoose, { Schema, Document, Model } from 'mongoose';
import { StoryElements, StoryStatus, StoryStage, AIResponseType } from '@/types';

// Story interface extending mongoose Document
export interface IStory extends Document {
  _id: string;
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
  aiSessions: Array<{
    sessionNumber: number;
    childInput: string;
    childWordCount: number;
    aiResponse: string;
    aiResponseType: AIResponseType;
    timestamp: Date;
    grammarScore?: number;
    creativityScore?: number;
    coherenceScore?: number;
  }>;
  
  // AI assessment
  aiAssessment?: {
    assessmentDate: Date;
    grammarScore: number;
    creativityScore: number;
    overallScore: number;
    feedback: string;
    suggestions: string[];
    strengths: string[];
    improvements: string[];
    readingLevel: string;
    vocabularyLevel: number;
    sentenceComplexity: number;
    hasBeginning: boolean;
    hasMiddle: boolean;
    hasEnd: boolean;
    themeIntegration: number;
    characterDevelopment: number;
    plotProgression: number;
  };
  
  // Mentor assessment
  mentorAssessment?: {
    mentorId: string;
    mentorName: string;
    assessmentDate: Date;
    grammarFeedback: number;
    creativityRating: number;
    effortScore: number;
    improvementAreas: string[];
    encouragement: string;
    overallProgress: string;
    nextStepsRecommendation: string;
    skillsImproved: string[];
    skillsToFocus: string[];
    improvementSinceLastStory?: string;
    consistentStrengths?: string[];
  };
  
  // Metadata
  readingTime: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isPublic: boolean;
  tags: string[];
  
  // Export and sharing
  exportHistory: Array<{
    id: string;
    format: 'pdf' | 'word' | 'txt';
    status: 'pending' | 'processing' | 'completed' | 'failed';
    downloadUrl?: string;
    fileSize?: number;
    createdAt: Date;
    expiresAt: Date;
    downloadCount: number;
  }>;
  shareCount: number;
  viewCount: number;
  
  // Analytics
  timeSpentWriting: number;
  sessionsCount: number;
  revisionCount: number;
  
  // Methods
  calculateWordCount(): number;
  calculateReadingTime(): number;
  canBePublished(): boolean;
  addAISession(childInput: string, aiResponse: string, responseType: AIResponseType): void;
  updateProgress(): void;
  generateExport(format: 'pdf' | 'word' | 'txt'): Promise<string>;
  incrementView(): Promise<void>;
  incrementShare(): Promise<void>;
}

// AI Session subdocument schema
const AISessionSchema = new Schema({
  sessionNumber: {
    type: Number,
    required: true,
  },
  childInput: {
    type: String,
    required: true,
    trim: true,
    maxlength: [1000, 'Child input cannot exceed 1000 characters'],
  },
  childWordCount: {
    type: Number,
    required: true,
    min: 0,
  },
  aiResponse: {
    type: String,
    required: true,
    trim: true,
    maxlength: [500, 'AI response cannot exceed 500 characters'],
  },
  aiResponseType: {
    type: String,
    enum: ['continue', 'twist', 'character', 'challenge'],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  grammarScore: {
    type: Number,
    min: 0,
    max: 100,
  },
  creativityScore: {
    type: Number,
    min: 0,
    max: 100,
  },
  coherenceScore: {
    type: Number,
    min: 0,
    max: 100,
  },
}, { _id: true });

// Export history subdocument schema
const ExportHistorySchema = new Schema({
  format: {
    type: String,
    enum: ['pdf', 'word', 'txt'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  },
  downloadUrl: String,
  fileSize: Number,
  downloadCount: {
    type: Number,
    default: 0,
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  },
}, {
  timestamps: true,
  _id: true,
});

// Story schema definition
const StorySchema = new Schema<IStory>({
  title: {
    type: String,
    required: [true, 'Story title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be longer than 200 characters'],
    minlength: [3, 'Title must be at least 3 characters'],
  },
  
  content: {
    type: String,
    required: [true, 'Story content is required'],
    trim: true,
    maxlength: [10000, 'Story content cannot exceed 10,000 characters'],
    minlength: [50, 'Story must be at least 50 characters'],
  },
  
  authorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  
  authorName: {
    type: String,
    required: true,
    trim: true,
  },
  
  authorAge: {
    type: Number,
    required: true,
    min: 2,
    max: 18,
  },
  
  // Story elements (6-element selection system)
  elements: {
    genre: {
      type: String,
      enum: ['adventure', 'fantasy', 'mystery', 'sci-fi', 'comedy', 'drama', 'historical', 'animal-stories', 'fairy-tale'],
      required: true,
    },
    setting: {
      type: String,
      enum: ['enchanted-forest', 'magic-castle', 'ocean-depths', 'space-station', 'city', 'village', 'mountains', 'desert', 'underground-cave'],
      required: true,
    },
    character: {
      type: String,
      enum: ['brave-explorer', 'talking-animal', 'wise-wizard', 'robot-friend', 'dragon', 'princess-prince', 'detective', 'superhero', 'ordinary-kid'],
      required: true,
    },
    mood: {
      type: String,
      enum: ['exciting', 'funny', 'mysterious', 'scary', 'peaceful', 'adventurous'],
      required: true,
    },
    conflict: {
      type: String,
      enum: ['lost-treasure', 'rescue-mission', 'mystery-to-solve', 'evil-to-defeat', 'competition', 'discovery'],
      required: true,
    },
    theme: {
      type: String,
      enum: ['friendship', 'courage', 'kindness', 'adventure', 'family', 'discovery'],
      required: true,
    },
  },
  
  stage: {
    type: Number,
    enum: [1, 2, 3, 4, 5],
    required: true,
    default: 1,
    index: true,
  },
  
  wordCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  targetWordCount: {
    type: Number,
    required: true,
    min: 300,
    max: 2000,
  },
  
  status: {
    type: String,
    enum: ['draft', 'in-progress', 'completed', 'published', 'archived'],
    default: 'draft',
    index: true,
  },
  
  publishedAt: {
    type: Date,
    index: true,
  },
  
  completedAt: {
    type: Date,
    index: true,
  },
  
  // AI collaboration sessions
  aiSessions: [AISessionSchema],
  
  // AI assessment
  aiAssessment: {
    assessmentDate: Date,
    grammarScore: { type: Number, min: 0, max: 100 },
    creativityScore: { type: Number, min: 0, max: 100 },
    overallScore: { type: Number, min: 0, max: 100 },
    feedback: { type: String, maxlength: 1000 },
    suggestions: [{ type: String, maxlength: 200 }],
    strengths: [{ type: String, maxlength: 200 }],
    improvements: [{ type: String, maxlength: 200 }],
    readingLevel: String,
    vocabularyLevel: { type: Number, min: 1, max: 12 },
    sentenceComplexity: { type: Number, min: 1, max: 10 },
    hasBeginning: Boolean,
    hasMiddle: Boolean,
    hasEnd: Boolean,
    themeIntegration: { type: Number, min: 0, max: 100 },
    characterDevelopment: { type: Number, min: 0, max: 100 },
    plotProgression: { type: Number, min: 0, max: 100 },
  },
  
  // Mentor assessment
  mentorAssessment: {
    mentorId: { type: Schema.Types.ObjectId, ref: 'User' },
    mentorName: String,
    assessmentDate: Date,
    grammarFeedback: { type: Number, min: 0, max: 100 },
    creativityRating: { type: Number, min: 0, max: 100 },
    effortScore: { type: Number, min: 0, max: 100 },
    improvementAreas: [String],
    encouragement: { type: String, maxlength: 500 },
    overallProgress: { type: String, maxlength: 500 },
    nextStepsRecommendation: { type: String, maxlength: 500 },
    skillsImproved: [String],
    skillsToFocus: [String],
    improvementSinceLastStory: String,
    consistentStrengths: [String],
  },
  
  readingTime: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
  },
  
  isPublic: {
    type: Boolean,
    default: false,
    index: true,
  },
  
  tags: [{
    type: String,
    trim: true,
    maxlength: 50,
  }],
  
  exportHistory: [ExportHistorySchema],
  
  shareCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  viewCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  timeSpentWriting: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  sessionsCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  revisionCount: {
    type: Number,
    default: 0,
    min: 0,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for performance
StorySchema.index({ authorId: 1, status: 1 });
StorySchema.index({ status: 1, publishedAt: -1 });
StorySchema.index({ authorId: 1, createdAt: -1 });
StorySchema.index({ stage: 1, status: 1 });
StorySchema.index({ 'elements.genre': 1, isPublic: 1 });
StorySchema.index({ isPublic: 1, publishedAt: -1 });
StorySchema.index({ authorAge: 1, 'elements.genre': 1 });
StorySchema.index({ createdAt: -1 });
StorySchema.index({ wordCount: 1, stage: 1 });

// Virtual properties
StorySchema.virtual('id').get(function() {
  return this._id.toHexString();
});

StorySchema.virtual('isCompleted').get(function() {
  return this.status === 'completed' || this.status === 'published';
});

StorySchema.virtual('isInProgress').get(function() {
  return this.status === 'in-progress' || this.status === 'draft';
});

StorySchema.virtual('progressPercentage').get(function() {
  if (this.targetWordCount === 0) return 0;
  return Math.min(100, Math.round((this.wordCount / this.targetWordCount) * 100));
});

StorySchema.virtual('averageAIScore').get(function() {
  if (!this.aiAssessment) return 0;
  const { grammarScore = 0, creativityScore = 0, overallScore = 0 } = this.aiAssessment;
  return Math.round((grammarScore + creativityScore + overallScore) / 3);
});

// Pre-save middleware
StorySchema.pre('save', function(next) {
  // Update word count
  this.wordCount = this.calculateWordCount();
  
  // Update reading time
  this.readingTime = this.calculateReadingTime();
  
  // Set published timestamp
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  // Set completed timestamp
  if ((this.status === 'completed' || this.status === 'published') && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  // Auto-generate title if empty
  if (!this.title || this.title === 'Untitled Story') {
    this.title = this.generateAutoTitle();
  }
  
  next();
});

// Instance methods
StorySchema.methods.calculateWordCount = function(): number {
  if (!this.content) return 0;
  
  // Remove extra whitespace and count words
  const words = this.content.trim().split(/\s+/).filter(word => word.length > 0);
  return words.length;
};

StorySchema.methods.calculateReadingTime = function(): number {
  // Average reading speed: 200 words per minute for children
  const wordsPerMinute = 200;
  return Math.ceil(this.wordCount / wordsPerMinute);
};

StorySchema.methods.canBePublished = function(): boolean {
  return this.status === 'completed' && 
         this.wordCount >= this.targetWordCount * 0.8 && // At least 80% of target
         this.aiAssessment?.overallScore && 
         this.aiAssessment.overallScore >= 60; // Minimum quality score
};

StorySchema.methods.addAISession = function(childInput: string, aiResponse: string, responseType: AIResponseType): void {
  const sessionNumber = this.aiSessions.length + 1;
  const childWordCount = childInput.trim().split(/\s+/).filter(word => word.length > 0).length;
  
  this.aiSessions.push({
    sessionNumber,
    childInput,
    childWordCount,
    aiResponse,
    aiResponseType: responseType,
    timestamp: new Date(),
  });
  
  this.sessionsCount = this.aiSessions.length;
  this.markModified('aiSessions');
};

StorySchema.methods.updateProgress = function(): void {
  this.revisionCount += 1;
  
  // Auto-update status based on word count
  if (this.wordCount === 0) {
    this.status = 'draft';
  } else if (this.wordCount < this.targetWordCount) {
    this.status = 'in-progress';
  } else if (this.wordCount >= this.targetWordCount) {
    this.status = 'completed';
  }
};

StorySchema.methods.generateAutoTitle = function(): string {
  const { genre, character, setting } = this.elements;
  
  const titleTemplates = [
    `The ${character.replace('-', ' ')} in the ${setting.replace('-', ' ')}`,
    `${character.replace('-', ' ')}'s ${genre} Adventure`,
    `The ${genre} of the ${setting.replace('-', ' ')}`,
    `${character.replace('-', ' ')} and the ${genre}`,
  ];
  
  const randomTemplate = titleTemplates[Math.floor(Math.random() * titleTemplates.length)];
  
  // Capitalize words
  return randomTemplate.replace(/\b\w/g, l => l.toUpperCase());
};

StorySchema.methods.generateExport = async function(format: 'pdf' | 'word' | 'txt'): Promise<string> {
  // This would integrate with the export system
  const exportId = new mongoose.Types.ObjectId().toString();
  
  this.exportHistory.push({
    id: exportId,
    format,
    status: 'pending',
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    downloadCount: 0,
  });
  
  await this.save();
  
  // Return export ID for tracking
  return exportId;
};

StorySchema.methods.incrementView = async function(): Promise<void> {
  return this.updateOne({ $inc: { viewCount: 1 } });
};

StorySchema.methods.incrementShare = async function(): Promise<void> {
  return this.updateOne({ $inc: { shareCount: 1 } });
};

// Static methods
StorySchema.statics.findByAuthor = function(authorId: string) {
  return this.find({ authorId }).sort({ createdAt: -1 });
};

StorySchema.statics.findPublishedStories = function() {
  return this.find({ status: 'published', isPublic: true }).sort({ publishedAt: -1 });
};

StorySchema.statics.findByGenre = function(genre: string) {
  return this.find({ 'elements.genre': genre, status: 'published', isPublic: true });
};

StorySchema.statics.findByStage = function(stage: number) {
  return this.find({ stage, status: 'published' });
};

StorySchema.statics.getAuthorStats = async function(authorId: string) {
  const pipeline = [
    { $match: { authorId: new mongoose.Types.ObjectId(authorId) } },
    {
      $group: {
        _id: null,
        totalStories: { $sum: 1 },
        publishedStories: { $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] } },
        totalWords: { $sum: '$wordCount' },
        averageScore: { $avg: '$aiAssessment.overallScore' },
        totalViews: { $sum: '$viewCount' },
        totalShares: { $sum: '$shareCount' },
      }
    }
  ];
  
  const result = await this.aggregate(pipeline);
  return result[0] || {};
};

StorySchema.statics.getPlatformStats = async function() {
  const pipeline = [
    {
      $group: {
        _id: null,
        totalStories: { $sum: 1 },
        publishedStories: { $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] } },
        totalWords: { $sum: '$wordCount' },
        averageWordsPerStory: { $avg: '$wordCount' },
        totalViews: { $sum: '$viewCount' },
        totalShares: { $sum: '$shareCount' },
        genreDistribution: {
          $push: '$elements.genre'
        }
      }
    }
  ];
  
  const result = await this.aggregate(pipeline);
  return result[0] || {};
};

// Create and export the model
const Story: Model<IStory> = mongoose.models.Story || mongoose.model<IStory>('Story', StorySchema);

export default Story;