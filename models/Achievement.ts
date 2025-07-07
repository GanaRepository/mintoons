import mongoose, { Schema, Document, Model } from 'mongoose';

// Achievement interface extending mongoose Document
export interface IAchievement extends Document {
  _id: string;
  name: string;
  description: string;
  icon: string;
  category: 'writing' | 'creativity' | 'consistency' | 'improvement' | 'social' | 'milestone';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  
  // Criteria for unlocking
  criteria: {
    storiesCompleted?: number;
    grammarScore?: number;
    creativityScore?: number;
    consecutiveDays?: number;
    improvementRate?: number;
    mentorPraise?: number;
    wordsWritten?: number;
    genresExplored?: number;
    commentsReceived?: number;
    sharesReceived?: number;
    customCondition?: string;
  };
  
  // Rewards
  rewards: {
    experiencePoints: number;
    title?: string;
    badge: string;
    unlocks?: string[];
    specialFeatures?: string[];
  };
  
  // Status and metadata
  isActive: boolean;
  isVisible: boolean;
  sortOrder: number;
  
  // Statistics
  totalUnlocked: number;
  unlockRate: number; // percentage of eligible users who have unlocked
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  checkCriteria(userStats: any): boolean;
  getProgressPercentage(userStats: any): number;
  canBeUnlocked(userStats: any): boolean;
}

// User Achievement interface (linking users to achievements)
export interface IUserAchievement extends Document {
  _id: string;
  userId: string;
  achievementId: string;
  
  // Unlock details
  unlockedAt: Date;
  progress: number; // 0-100
  isCompleted: boolean;
  
  // Context when unlocked
  triggerStoryId?: string;
  triggerEvent?: string;
  statsWhenUnlocked?: any;
  
  // Display settings
  isDisplayed: boolean;
  displayedAt?: Date;
  isFavorited: boolean;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// Achievement criteria subdocument schema
const CriteriaSchema = new Schema({
  storiesCompleted: {
    type: Number,
    min: 0,
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
  consecutiveDays: {
    type: Number,
    min: 0,
  },
  improvementRate: {
    type: Number,
    min: 0,
  },
  mentorPraise: {
    type: Number,
    min: 0,
  },
  wordsWritten: {
    type: Number,
    min: 0,
  },
  genresExplored: {
    type: Number,
    min: 0,
  },
  commentsReceived: {
    type: Number,
    min: 0,
  },
  sharesReceived: {
    type: Number,
    min: 0,
  },
  customCondition: {
    type: String,
    trim: true,
  },
}, { _id: false });

// Achievement rewards subdocument schema
const RewardsSchema = new Schema({
  experiencePoints: {
    type: Number,
    required: true,
    min: 0,
    default: 10,
  },
  title: {
    type: String,
    trim: true,
    maxlength: [50, 'Title cannot be longer than 50 characters'],
  },
  badge: {
    type: String,
    required: true,
    trim: true,
  },
  unlocks: [{
    type: String,
    trim: true,
  }],
  specialFeatures: [{
    type: String,
    trim: true,
  }],
}, { _id: false });

// Achievement schema definition
const AchievementSchema = new Schema<IAchievement>({
  name: {
    type: String,
    required: [true, 'Achievement name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Name cannot be longer than 100 characters'],
    minlength: [3, 'Name must be at least 3 characters'],
  },
  
  description: {
    type: String,
    required: [true, 'Achievement description is required'],
    trim: true,
    maxlength: [500, 'Description cannot be longer than 500 characters'],
  },
  
  icon: {
    type: String,
    required: [true, 'Achievement icon is required'],
    trim: true,
  },
  
  category: {
    type: String,
    enum: ['writing', 'creativity', 'consistency', 'improvement', 'social', 'milestone'],
    required: true,
    index: true,
  },
  
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary'],
    required: true,
    default: 'common',
    index: true,
  },
  
  criteria: {
    type: CriteriaSchema,
    required: true,
  },
  
  rewards: {
    type: RewardsSchema,
    required: true,
  },
  
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  
  isVisible: {
    type: Boolean,
    default: true,
    index: true,
  },
  
  sortOrder: {
    type: Number,
    default: 0,
    index: true,
  },
  
  totalUnlocked: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  unlockRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// User Achievement schema
const UserAchievementSchema = new Schema<IUserAchievement>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  
  achievementId: {
    type: Schema.Types.ObjectId,
    ref: 'Achievement',
    required: true,
    index: true,
  },
  
  unlockedAt: {
    type: Date,
    required: true,
    default: Date.now,
    index: true,
  },
  
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  
  isCompleted: {
    type: Boolean,
    default: false,
    index: true,
  },
  
  triggerStoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Story',
  },
  
  triggerEvent: {
    type: String,
    trim: true,
  },
  
  statsWhenUnlocked: {
    type: Schema.Types.Mixed,
  },
  
  isDisplayed: {
    type: Boolean,
    default: false,
    index: true,
  },
  
  displayedAt: {
    type: Date,
  },
  
  isFavorited: {
    type: Boolean,
    default: false,
    index: true,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for performance
AchievementSchema.index({ category: 1, isActive: 1 });
AchievementSchema.index({ rarity: 1, isActive: 1 });
AchievementSchema.index({ sortOrder: 1, isActive: 1 });
AchievementSchema.index({ totalUnlocked: -1 });

UserAchievementSchema.index({ userId: 1, unlockedAt: -1 });
UserAchievementSchema.index({ userId: 1, isCompleted: 1 });
UserAchievementSchema.index({ achievementId: 1, unlockedAt: -1 });
UserAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });

// Virtual properties
AchievementSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

AchievementSchema.virtual('difficultyScore').get(function() {
  const rarityScores = { common: 1, rare: 2, epic: 3, legendary: 4 };
  return rarityScores[this.rarity] || 1;
});

UserAchievementSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

UserAchievementSchema.virtual('isNew').get(function() {
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  return this.unlockedAt > threeDaysAgo;
});

// Instance methods for Achievement
AchievementSchema.methods.checkCriteria = function(userStats: any): boolean {
  const criteria = this.criteria;
  
  // Check each criterion
  if (criteria.storiesCompleted && userStats.storiesCreated < criteria.storiesCompleted) {
    return false;
  }
  
  if (criteria.grammarScore && userStats.averageGrammarScore < criteria.grammarScore) {
    return false;
  }
  
  if (criteria.creativityScore && userStats.averageCreativityScore < criteria.creativityScore) {
    return false;
  }
  
  if (criteria.consecutiveDays && userStats.currentWritingStreak < criteria.consecutiveDays) {
    return false;
  }
  
  if (criteria.improvementRate && userStats.improvementRate < criteria.improvementRate) {
    return false;
  }
  
  if (criteria.mentorPraise && userStats.mentorInteractions < criteria.mentorPraise) {
    return false;
  }
  
  if (criteria.wordsWritten && userStats.totalWordCount < criteria.wordsWritten) {
    return false;
  }
  
  if (criteria.genresExplored && userStats.genresExplored < criteria.genresExplored) {
    return false;
  }
  
  if (criteria.commentsReceived && userStats.commentsReceived < criteria.commentsReceived) {
    return false;
  }
  
  if (criteria.sharesReceived && userStats.sharesReceived < criteria.sharesReceived) {
    return false;
  }
  
  // Custom condition would need to be evaluated based on specific logic
  if (criteria.customCondition) {
    // Implementation depends on how custom conditions are structured
    return this.evaluateCustomCondition(criteria.customCondition, userStats);
  }
  
  return true;
};

AchievementSchema.methods.getProgressPercentage = function(userStats: any): number {
  const criteria = this.criteria;
  let totalCriteria = 0;
  let metCriteria = 0;
  
  Object.keys(criteria.toObject()).forEach(key => {
    if (criteria[key] !== undefined && key !== 'customCondition') {
      totalCriteria++;
      const userValue = userStats[this.mapCriteriaToUserStats(key)] || 0;
      const requiredValue = criteria[key];
      
      if (userValue >= requiredValue) {
        metCriteria++;
      }
    }
  });
  
  return totalCriteria > 0 ? Math.round((metCriteria / totalCriteria) * 100) : 0;
};

AchievementSchema.methods.canBeUnlocked = function(userStats: any): boolean {
  return this.isActive && this.checkCriteria(userStats);
};

AchievementSchema.methods.mapCriteriaToUserStats = function(criteriaKey: string): string {
  const mapping: Record<string, string> = {
    storiesCompleted: 'storiesCreated',
    grammarScore: 'averageGrammarScore',
    creativityScore: 'averageCreativityScore',
    consecutiveDays: 'currentWritingStreak',
    mentorPraise: 'mentorInteractions',
    wordsWritten: 'totalWordCount',
    commentsReceived: 'commentsReceived',
    sharesReceived: 'sharesReceived',
  };
  
  return mapping[criteriaKey] || criteriaKey;
};

AchievementSchema.methods.evaluateCustomCondition = function(condition: string, userStats: any): boolean {
  // This would implement custom condition evaluation
  // For now, return false as placeholder
  return false;
};

// Static methods for Achievement
AchievementSchema.statics.getActiveAchievements = function() {
  return this.find({ isActive: true, isVisible: true }).sort({ sortOrder: 1, category: 1 });
};

AchievementSchema.statics.getByCategory = function(category: string) {
  return this.find({ category, isActive: true, isVisible: true }).sort({ sortOrder: 1 });
};

AchievementSchema.statics.getByRarity = function(rarity: string) {
  return this.find({ rarity, isActive: true, isVisible: true }).sort({ sortOrder: 1 });
};

AchievementSchema.statics.checkUserAchievements = async function(userId: string, userStats: any) {
  const achievements = await this.find({ isActive: true });
  const userAchievements = await UserAchievement.find({ userId });
  const unlockedIds = userAchievements.map(ua => ua.achievementId.toString());
  
  const newAchievements = [];
  
  for (const achievement of achievements) {
    if (!unlockedIds.includes(achievement._id.toString()) && achievement.canBeUnlocked(userStats)) {
      newAchievements.push(achievement);
    }
  }
  
  return newAchievements;
};

// Static methods for UserAchievement
UserAchievementSchema.statics.findByUser = function(userId: string) {
  return this.find({ userId })
    .populate('achievementId')
    .sort({ unlockedAt: -1 });
};

UserAchievementSchema.statics.findCompletedByUser = function(userId: string) {
  return this.find({ userId, isCompleted: true })
    .populate('achievementId')
    .sort({ unlockedAt: -1 });
};

UserAchievementSchema.statics.findRecentByUser = function(userId: string, days: number = 7) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return this.find({ userId, unlockedAt: { $gte: since } })
    .populate('achievementId')
    .sort({ unlockedAt: -1 });
};

UserAchievementSchema.statics.getUserProgress = async function(userId: string) {
  const pipeline = [
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: 'achievements',
        localField: 'achievementId',
        foreignField: '_id',
        as: 'achievement'
      }
    },
    { $unwind: '$achievement' },
    {
      $group: {
        _id: '$achievement.category',
        total: { $sum: 1 },
        completed: { $sum: { $cond: ['$isCompleted', 1, 0] } },
        totalXP: { $sum: '$achievement.rewards.experiencePoints' },
        achievements: { $push: '$$ROOT' }
      }
    }
  ];
  
  return this.aggregate(pipeline);
};

UserAchievementSchema.statics.getLeaderboard = async function(limit: number = 10) {
  const pipeline = [
    {
      $lookup: {
        from: 'achievements',
        localField: 'achievementId',
        foreignField: '_id',
        as: 'achievement'
      }
    },
    { $unwind: '$achievement' },
    {
      $group: {
        _id: '$userId',
        totalXP: { $sum: '$achievement.rewards.experiencePoints' },
        achievementCount: { $sum: 1 },
        rareAchievements: {
          $sum: {
            $cond: [
              { $in: ['$achievement.rarity', ['rare', 'epic', 'legendary']] },
              1,
              0
            ]
          }
        }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $project: {
        userName: '$user.name',
        totalXP: 1,
        achievementCount: 1,
        rareAchievements: 1,
      }
    },
    { $sort: { totalXP: -1 } },
    { $limit: limit }
  ];
  
  return this.aggregate(pipeline);
};

// Create and export the models
const Achievement: Model<IAchievement> = mongoose.models.Achievement || mongoose.model<IAchievement>('Achievement', AchievementSchema);
const UserAchievement: Model<IUserAchievement> = mongoose.models.UserAchievement || mongoose.model<IUserAchievement>('UserAchievement', UserAchievementSchema);

export default Achievement;
export { UserAchievement };