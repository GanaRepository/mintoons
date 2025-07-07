import mongoose, { Schema, Document, Model } from 'mongoose';
import { CommentType, CommentCategory } from '@/types';

// Comment interface extending mongoose Document
export interface IComment extends Document {
  _id: string;
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
  emojiReactions: Array<{
    userId: string;
    userName: string;
    emoji: string;
    timestamp: Date;
  }>;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  
  // Threading
  parentCommentId?: string;
  replies: string[]; // Array of reply comment IDs
  
  // Moderation
  isHidden: boolean;
  hiddenReason?: string;
  hiddenBy?: string;
  hiddenAt?: Date;
  
  // Analytics
  helpfulCount: number;
  notHelpfulCount: number;
  
  // Methods
  addReaction(userId: string, userName: string, emoji: string): void;
  removeReaction(userId: string, emoji: string): void;
  markAsResolved(resolvedBy: string): Promise<void>;
  markAsUnresolved(): Promise<void>;
  addReply(replyId: string): Promise<void>;
  removeReply(replyId: string): Promise<void>;
  hide(reason: string, hiddenBy: string): Promise<void>;
  unhide(): Promise<void>;
}

// Emoji reaction subdocument schema
const EmojiReactionSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userName: {
    type: String,
    required: true,
    trim: true,
  },
  emoji: {
    type: String,
    required: true,
    enum: ['👍', '❤️', '🌟', '🎉', '💡', '🤔', '👏', '🔥'],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

// Comment schema definition
const CommentSchema = new Schema<IComment>({
  storyId: {
    type: Schema.Types.ObjectId,
    ref: 'Story',
    required: true,
    index: true,
  },
  
  commenterId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  
  commenterName: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Commenter name cannot be longer than 100 characters'],
  },
  
  commenterRole: {
    type: String,
    enum: ['mentor', 'admin'],
    required: true,
    index: true,
  },
  
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot be longer than 1000 characters'],
    minlength: [1, 'Comment must have content'],
  },
  
  highlightedText: {
    type: String,
    trim: true,
    maxlength: [500, 'Highlighted text cannot be longer than 500 characters'],
  },
  
  textPosition: {
    start: {
      type: Number,
      min: 0,
    },
    end: {
      type: Number,
      min: 0,
    },
  },
  
  commentType: {
    type: String,
    enum: ['grammar', 'creativity', 'suggestion', 'praise', 'improvement', 'question'],
    required: true,
    index: true,
  },
  
  category: {
    type: String,
    enum: ['structure', 'vocabulary', 'character', 'plot', 'dialogue', 'description'],
    required: true,
    index: true,
  },
  
  isResolved: {
    type: Boolean,
    default: false,
    index: true,
  },
  
  childResponse: {
    type: String,
    trim: true,
    maxlength: [500, 'Child response cannot be longer than 500 characters'],
  },
  
  emojiReactions: [EmojiReactionSchema],
  
  resolvedAt: {
    type: Date,
    index: true,
  },
  
  parentCommentId: {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    index: true,
  },
  
  replies: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment',
  }],
  
  isHidden: {
    type: Boolean,
    default: false,
    index: true,
  },
  
  hiddenReason: {
    type: String,
    trim: true,
    maxlength: [200, 'Hidden reason cannot be longer than 200 characters'],
  },
  
  hiddenBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  
  hiddenAt: {
    type: Date,
  },
  
  helpfulCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  notHelpfulCount: {
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
CommentSchema.index({ storyId: 1, createdAt: -1 });
CommentSchema.index({ commenterId: 1, createdAt: -1 });
CommentSchema.index({ storyId: 1, isResolved: 1 });
CommentSchema.index({ storyId: 1, commentType: 1 });
CommentSchema.index({ parentCommentId: 1 });
CommentSchema.index({ createdAt: -1 });
CommentSchema.index({ isHidden: 1, createdAt: -1 });

// Compound indexes
CommentSchema.index({ storyId: 1, parentCommentId: 1, createdAt: 1 });
CommentSchema.index({ commenterId: 1, commenterRole: 1, createdAt: -1 });

// Virtual properties
CommentSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

CommentSchema.virtual('isTopLevel').get(function() {
  return !this.parentCommentId;
});

CommentSchema.virtual('hasReplies').get(function() {
  return this.replies && this.replies.length > 0;
});

CommentSchema.virtual('replyCount').get(function() {
  return this.replies ? this.replies.length : 0;
});

CommentSchema.virtual('totalReactions').get(function() {
  return this.emojiReactions ? this.emojiReactions.length : 0;
});

CommentSchema.virtual('helpfulnessRatio').get(function() {
  const total = this.helpfulCount + this.notHelpfulCount;
  return total > 0 ? this.helpfulCount / total : 0;
});

// Validation
CommentSchema.path('textPosition').validate(function(value) {
  if (value && value.start !== undefined && value.end !== undefined) {
    return value.end >= value.start;
  }
  return true;
}, 'Text position end must be greater than or equal to start');

// Pre-save middleware
CommentSchema.pre('save', function(next) {
  // Validate highlighted text matches position if both are provided
  if (this.highlightedText && this.textPosition) {
    // This validation would need the original story content
    // Implementation depends on how you want to handle this
  }
  
  // Auto-categorize based on comment type if not set
  if (!this.category) {
    this.category = this.autoCategorizeBycontent();
  }
  
  next();
});

// Instance methods
CommentSchema.methods.addReaction = function(userId: string, userName: string, emoji: string): void {
  // Remove existing reaction from this user with same emoji
  this.emojiReactions = this.emojiReactions.filter(
    reaction => !(reaction.userId.toString() === userId && reaction.emoji === emoji)
  );
  
  // Add new reaction
  this.emojiReactions.push({
    userId: new mongoose.Types.ObjectId(userId),
    userName,
    emoji,
    timestamp: new Date(),
  });
  
  this.markModified('emojiReactions');
};

CommentSchema.methods.removeReaction = function(userId: string, emoji: string): void {
  this.emojiReactions = this.emojiReactions.filter(
    reaction => !(reaction.userId.toString() === userId && reaction.emoji === emoji)
  );
  
  this.markModified('emojiReactions');
};

CommentSchema.methods.markAsResolved = async function(resolvedBy: string): Promise<void> {
  return this.updateOne({
    $set: {
      isResolved: true,
      resolvedAt: new Date(),
    }
  });
};

CommentSchema.methods.markAsUnresolved = async function(): Promise<void> {
  return this.updateOne({
    $set: {
      isResolved: false,
    },
    $unset: {
      resolvedAt: 1,
    }
  });
};

CommentSchema.methods.addReply = async function(replyId: string): Promise<void> {
  return this.updateOne({
    $addToSet: { replies: replyId }
  });
};

CommentSchema.methods.removeReply = async function(replyId: string): Promise<void> {
  return this.updateOne({
    $pull: { replies: replyId }
  });
};

CommentSchema.methods.hide = async function(reason: string, hiddenBy: string): Promise<void> {
  return this.updateOne({
    $set: {
      isHidden: true,
      hiddenReason: reason,
      hiddenBy: new mongoose.Types.ObjectId(hiddenBy),
      hiddenAt: new Date(),
    }
  });
};

CommentSchema.methods.unhide = async function(): Promise<void> {
  return this.updateOne({
    $set: {
      isHidden: false,
    },
    $unset: {
      hiddenReason: 1,
      hiddenBy: 1,
      hiddenAt: 1,
    }
  });
};

CommentSchema.methods.autoCategorizeBycontent = function(): CommentCategory {
  const content = this.content.toLowerCase();
  
  // Simple keyword-based categorization
  if (content.includes('character') || content.includes('protagonist') || content.includes('hero')) {
    return 'character';
  }
  if (content.includes('plot') || content.includes('story') || content.includes('happens')) {
    return 'plot';
  }
  if (content.includes('dialogue') || content.includes('conversation') || content.includes('speaking')) {
    return 'dialogue';
  }
  if (content.includes('describe') || content.includes('details') || content.includes('picture')) {
    return 'description';
  }
  if (content.includes('word') || content.includes('vocabulary') || content.includes('language')) {
    return 'vocabulary';
  }
  
  return 'structure'; // default
};

// Static methods
CommentSchema.statics.findByStory = function(storyId: string) {
  return this.find({ storyId, isHidden: false })
    .populate('commenterId', 'name role')
    .sort({ createdAt: 1 });
};

CommentSchema.statics.findTopLevelComments = function(storyId: string) {
  return this.find({ 
    storyId, 
    parentCommentId: { $exists: false },
    isHidden: false 
  })
    .populate('commenterId', 'name role')
    .sort({ createdAt: 1 });
};

CommentSchema.statics.findReplies = function(parentCommentId: string) {
  return this.find({ parentCommentId, isHidden: false })
    .populate('commenterId', 'name role')
    .sort({ createdAt: 1 });
};

CommentSchema.statics.findByCommenter = function(commenterId: string) {
  return this.find({ commenterId, isHidden: false })
    .populate('storyId', 'title authorName')
    .sort({ createdAt: -1 });
};

CommentSchema.statics.findUnresolvedByStory = function(storyId: string) {
  return this.find({ 
    storyId, 
    isResolved: false,
    isHidden: false,
    parentCommentId: { $exists: false } // Only top-level comments
  })
    .populate('commenterId', 'name role')
    .sort({ createdAt: -1 });
};

CommentSchema.statics.findByType = function(commentType: CommentType) {
  return this.find({ commentType, isHidden: false })
    .populate('commenterId', 'name role')
    .populate('storyId', 'title authorName')
    .sort({ createdAt: -1 });
};

CommentSchema.statics.getCommentStats = async function(storyId?: string) {
  const matchCondition = storyId ? { storyId: new mongoose.Types.ObjectId(storyId) } : {};
  
  const pipeline = [
    { $match: { ...matchCondition, isHidden: false } },
    {
      $group: {
        _id: null,
        totalComments: { $sum: 1 },
        resolvedComments: { $sum: { $cond: ['$isResolved', 1, 0] } },
        unresolvedComments: { $sum: { $cond: ['$isResolved', 0, 1] } },
        commentsByType: {
          $push: '$commentType'
        },
        commentsByCategory: {
          $push: '$category'
        },
        averageReactions: { $avg: { $size: '$emojiReactions' } },
        totalHelpfulVotes: { $sum: '$helpfulCount' },
        totalNotHelpfulVotes: { $sum: '$notHelpfulCount' },
      }
    }
  ];
  
  const result = await this.aggregate(pipeline);
  return result[0] || {};
};

CommentSchema.statics.getMentorStats = async function(mentorId: string) {
  const pipeline = [
    { 
      $match: { 
        commenterId: new mongoose.Types.ObjectId(mentorId),
        isHidden: false 
      } 
    },
    {
      $group: {
        _id: null,
        totalComments: { $sum: 1 },
        resolvedComments: { $sum: { $cond: ['$isResolved', 1, 0] } },
        averageHelpfulness: { 
          $avg: { 
            $divide: [
              '$helpfulCount', 
              { $add: ['$helpfulCount', '$notHelpfulCount', 1] }
            ] 
          } 
        },
        commentsByType: {
          $push: '$commentType'
        },
        totalReactions: { $sum: { $size: '$emojiReactions' } },
        uniqueStories: { $addToSet: '$storyId' },
      }
    },
    {
      $addFields: {
        uniqueStoriesCount: { $size: '$uniqueStories' }
      }
    }
  ];
  
  const result = await this.aggregate(pipeline);
  return result[0] || {};
};

CommentSchema.statics.getRecentActivity = async function(limit: number = 10) {
  return this.find({ isHidden: false })
    .populate('commenterId', 'name role')
    .populate('storyId', 'title authorName')
    .sort({ createdAt: -1 })
    .limit(limit);
};

CommentSchema.statics.searchComments = async function(query: string, filters: any = {}) {
  const searchConditions = {
    $and: [
      { isHidden: false },
      {
        $or: [
          { content: { $regex: query, $options: 'i' } },
          { highlightedText: { $regex: query, $options: 'i' } },
        ]
      },
      ...Object.entries(filters).map(([key, value]) => ({ [key]: value }))
    ]
  };
  
  return this.find(searchConditions)
    .populate('commenterId', 'name role')
    .populate('storyId', 'title authorName')
    .sort({ createdAt: -1 });
};

// Create and export the model
const Comment: Model<IComment> = mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);

export default Comment;