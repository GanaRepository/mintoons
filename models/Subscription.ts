import mongoose, { Schema, Document, Model } from 'mongoose';
import { SubscriptionTier, SubscriptionStatus, BillingInterval } from '@/types';

// Subscription interface extending mongoose Document
export interface ISubscription extends Document {
  _id: string;
  userId: string;
  
  // Stripe integration
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  stripePriceId?: string;
  
  // Subscription details
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  billingInterval: BillingInterval;
  
  // Pricing
  amount: number; // in cents
  currency: string;
  
  // Dates
  startDate: Date;
  endDate?: Date;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  canceledAt?: Date;
  cancelAtPeriodEnd: boolean;
  
  // Trial information
  trialStart?: Date;
  trialEnd?: Date;
  isTrialActive: boolean;
  
  // Usage tracking
  usage: {
    storiesCreated: number;
    storiesThisMonth: number;
    exportsThisMonth: number;
    aiRequestsToday: number;
    aiRequestsThisMonth: number;
    mentorSessionsThisMonth: number;
    storageUsed: number; // in bytes
    totalStoriesCreated: number;
    totalExports: number;
    totalAIRequests: number;
    totalMentorSessions: number;
    monthlyResetDate: Date;
    dailyResetDate: Date;
    lastCalculated: Date;
  };
  
  // Payment information
  paymentMethod?: {
    type: 'card' | 'bank' | 'paypal';
    cardBrand?: string;
    cardLast4?: string;
    cardExpMonth?: number;
    cardExpYear?: number;
    isDefault: boolean;
    isValid: boolean;
  };
  
  lastPaymentDate?: Date;
  nextPaymentDate?: Date;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
  
  // Methods
  getSubscriptionLimits(): SubscriptionLimits;
  canCreateStory(): boolean;
  canExportStory(): boolean;
  canUseAI(): boolean;
  getRemainingLimits(): RemainingLimits;
  resetUsage(): Promise<void>;
  updateUsage(type: string, amount: number): Promise<void>;
  isActive(): boolean;
  isExpired(): boolean;
  daysUntilExpiry(): number;
  cancel(immediate?: boolean): Promise<void>;
  reactivate(): Promise<void>;
}

interface SubscriptionLimits {
  maxStories: number;
  maxStoryLength: number;
  maxStoriesPerDay: number;
  maxStoriesPerMonth: number;
  maxExportsPerMonth: number;
  maxFileSize: number;
  exportFormats: string[];
  maxAIRequestsPerDay: number;
  maxAIRequestsPerMonth: number;
  aiModelsAccess: string[];
  canAccessMentorFeedback: boolean;
  maxMentorSessions: number;
  prioritySupport: boolean;
  canAccessAdvancedEditor: boolean;
  canUseCustomTemplates: boolean;
  canCreatePublicStories: boolean;
  canAccessAnalytics: boolean;
  maxStorageSpace: number;
  retentionPeriod: number;
}

interface RemainingLimits {
  storiesRemaining: number;
  storiesThisMonthRemaining: number;
  exportsThisMonthRemaining: number;
  aiRequestsTodayRemaining: number;
  aiRequestsThisMonthRemaining: number;
  mentorSessionsThisMonthRemaining: number;
  storageSpaceRemaining: number;
}

// Usage tracking subdocument schema
const UsageSchema = new Schema({
  storiesCreated: { type: Number, default: 0, min: 0 },
  storiesThisMonth: { type: Number, default: 0, min: 0 },
  exportsThisMonth: { type: Number, default: 0, min: 0 },
  aiRequestsToday: { type: Number, default: 0, min: 0 },
  aiRequestsThisMonth: { type: Number, default: 0, min: 0 },
  mentorSessionsThisMonth: { type: Number, default: 0, min: 0 },
  storageUsed: { type: Number, default: 0, min: 0 },
  totalStoriesCreated: { type: Number, default: 0, min: 0 },
  totalExports: { type: Number, default: 0, min: 0 },
  totalAIRequests: { type: Number, default: 0, min: 0 },
  totalMentorSessions: { type: Number, default: 0, min: 0 },
  monthlyResetDate: { type: Date, default: Date.now },
  dailyResetDate: { type: Date, default: Date.now },
  lastCalculated: { type: Date, default: Date.now },
}, { _id: false });

// Payment method subdocument schema
const PaymentMethodSchema = new Schema({
  type: {
    type: String,
    enum: ['card', 'bank', 'paypal'],
    required: true,
  },
  cardBrand: String,
  cardLast4: String,
  cardExpMonth: {
    type: Number,
    min: 1,
    max: 12,
  },
  cardExpYear: {
    type: Number,
    min: new Date().getFullYear(),
  },
  isDefault: { type: Boolean, default: true },
  isValid: { type: Boolean, default: true },
}, { _id: false });

// Subscription schema definition
const SubscriptionSchema = new Schema<ISubscription>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },
  
  stripeSubscriptionId: {
    type: String,
    trim: true,
    index: true,
  },
  
  stripeCustomerId: {
    type: String,
    trim: true,
    index: true,
  },
  
  stripePriceId: {
    type: String,
    trim: true,
  },
  
  tier: {
    type: String,
    enum: ['free', 'basic', 'premium', 'pro'],
    required: true,
    default: 'free',
    index: true,
  },
  
  status: {
    type: String,
    enum: ['active', 'canceled', 'past_due', 'unpaid', 'paused', 'incomplete'],
    required: true,
    default: 'active',
    index: true,
  },
  
  billingInterval: {
    type: String,
    enum: ['month', 'year'],
    default: 'month',
  },
  
  amount: {
    type: Number,
    required: true,
    min: 0,
    default: 0, // Free tier
  },
  
  currency: {
    type: String,
    required: true,
    default: 'usd',
    uppercase: true,
    minlength: 3,
    maxlength: 3,
  },
  
  startDate: {
    type: Date,
    required: true,
    default: Date.now,
    index: true,
  },
  
  endDate: {
    type: Date,
    index: true,
  },
  
  currentPeriodStart: {
    type: Date,
    required: true,
    default: Date.now,
  },
  
  currentPeriodEnd: {
    type: Date,
    required: true,
    default: function() {
      const start = this.currentPeriodStart || new Date();
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      return end;
    },
    index: true,
  },
  
  canceledAt: {
    type: Date,
    index: true,
  },
  
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false,
  },
  
  trialStart: {
    type: Date,
  },
  
  trialEnd: {
    type: Date,
    index: true,
  },
  
  isTrialActive: {
    type: Boolean,
    default: false,
    index: true,
  },
  
  usage: {
    type: UsageSchema,
    default: () => ({}),
  },
  
  paymentMethod: PaymentMethodSchema,
  
  lastPaymentDate: {
    type: Date,
    index: true,
  },
  
  nextPaymentDate: {
    type: Date,
    index: true,
  },
  
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot be longer than 500 characters'],
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for performance
SubscriptionSchema.index({ userId: 1 }, { unique: true });
SubscriptionSchema.index({ tier: 1, status: 1 });
SubscriptionSchema.index({ status: 1, currentPeriodEnd: 1 });
SubscriptionSchema.index({ stripeSubscriptionId: 1 });
SubscriptionSchema.index({ stripeCustomerId: 1 });
SubscriptionSchema.index({ currentPeriodEnd: 1 });
SubscriptionSchema.index({ createdAt: -1 });

// Virtual properties
SubscriptionSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

SubscriptionSchema.virtual('isActiveSubscription').get(function() {
  return this.status === 'active' && !this.isExpired();
});

SubscriptionSchema.virtual('isPaid').get(function() {
  return this.tier !== 'free' && this.amount > 0;
});

SubscriptionSchema.virtual('daysInCurrentPeriod').get(function() {
  const start = new Date(this.currentPeriodStart);
  const end = new Date(this.currentPeriodEnd);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
});

SubscriptionSchema.virtual('daysRemainingInPeriod').get(function() {
  const now = new Date();
  const end = new Date(this.currentPeriodEnd);
  if (end <= now) return 0;
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware
SubscriptionSchema.pre('save', function(next) {
  // Update trial status
  if (this.trialEnd) {
    this.isTrialActive = new Date() <= this.trialEnd;
  }
  
  // Set next payment date
  if (this.status === 'active' && !this.cancelAtPeriodEnd) {
    this.nextPaymentDate = this.currentPeriodEnd;
  }
  
  // Reset usage if period has changed
  if (this.isModified('currentPeriodStart')) {
    this.usage.monthlyResetDate = this.currentPeriodStart;
    this.usage.storiesThisMonth = 0;
    this.usage.exportsThisMonth = 0;
    this.usage.aiRequestsThisMonth = 0;
    this.usage.mentorSessionsThisMonth = 0;
  }
  
  // Reset daily usage if day has changed
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (this.usage.dailyResetDate < today) {
    this.usage.dailyResetDate = today;
    this.usage.aiRequestsToday = 0;
  }
  
  next();
});

// Instance methods
SubscriptionSchema.methods.getSubscriptionLimits = function(): SubscriptionLimits {
  const limits = {
    free: {
      maxStories: 50,
      maxStoryLength: 600, // words
      maxStoriesPerDay: 3,
      maxStoriesPerMonth: 50,
      maxExportsPerMonth: 5,
      maxFileSize: 5 * 1024 * 1024, // 5MB
      exportFormats: ['pdf'],
      maxAIRequestsPerDay: 10,
      maxAIRequestsPerMonth: 100,
      aiModelsAccess: ['gpt-4.1-nano'],
      canAccessMentorFeedback: false,
      maxMentorSessions: 0,
      prioritySupport: false,
      canAccessAdvancedEditor: false,
      canUseCustomTemplates: false,
      canCreatePublicStories: false,
      canAccessAnalytics: false,
      maxStorageSpace: 100 * 1024 * 1024, // 100MB
      retentionPeriod: 30, // days
    },
    basic: {
      maxStories: 100,
      maxStoryLength: 1200,
      maxStoriesPerDay: 5,
      maxStoriesPerMonth: 100,
      maxExportsPerMonth: 20,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      exportFormats: ['pdf', 'word'],
      maxAIRequestsPerDay: 25,
      maxAIRequestsPerMonth: 300,
      aiModelsAccess: ['gpt-4.1-nano', 'claude-haiku-3.5'],
      canAccessMentorFeedback: true,
      maxMentorSessions: 5,
      prioritySupport: false,
      canAccessAdvancedEditor: true,
      canUseCustomTemplates: false,
      canCreatePublicStories: true,
      canAccessAnalytics: true,
      maxStorageSpace: 500 * 1024 * 1024, // 500MB
      retentionPeriod: 365, // 1 year
    },
    premium: {
      maxStories: 200,
      maxStoryLength: 1600,
      maxStoriesPerDay: 10,
      maxStoriesPerMonth: 200,
      maxExportsPerMonth: 50,
      maxFileSize: 25 * 1024 * 1024, // 25MB
      exportFormats: ['pdf', 'word', 'txt'],
      maxAIRequestsPerDay: 50,
      maxAIRequestsPerMonth: 800,
      aiModelsAccess: ['gpt-4.1-nano', 'gpt-4.1-mini', 'claude-haiku-3.5', 'claude-sonnet-4'],
      canAccessMentorFeedback: true,
      maxMentorSessions: 15,
      prioritySupport: true,
      canAccessAdvancedEditor: true,
      canUseCustomTemplates: true,
      canCreatePublicStories: true,
      canAccessAnalytics: true,
      maxStorageSpace: 2 * 1024 * 1024 * 1024, // 2GB
      retentionPeriod: -1, // unlimited
    },
    pro: {
      maxStories: 300,
      maxStoryLength: 2000,
      maxStoriesPerDay: -1, // unlimited
      maxStoriesPerMonth: 300,
      maxExportsPerMonth: -1, // unlimited
      maxFileSize: 50 * 1024 * 1024, // 50MB
      exportFormats: ['pdf', 'word', 'txt'],
      maxAIRequestsPerDay: -1, // unlimited
      maxAIRequestsPerMonth: -1, // unlimited
      aiModelsAccess: ['gpt-4.1', 'gpt-4.1-mini', 'gpt-4.1-nano', 'claude-opus-4', 'claude-sonnet-4', 'claude-haiku-3.5', 'gemini-pro'],
      canAccessMentorFeedback: true,
      maxMentorSessions: -1, // unlimited
      prioritySupport: true,
      canAccessAdvancedEditor: true,
      canUseCustomTemplates: true,
      canCreatePublicStories: true,
      canAccessAnalytics: true,
      maxStorageSpace: 10 * 1024 * 1024 * 1024, // 10GB
      retentionPeriod: -1, // unlimited
    }
  };
  
  return limits[this.tier] || limits.free;
};

SubscriptionSchema.methods.canCreateStory = function(): boolean {
  if (!this.isActive()) return false;
  
  const limits = this.getSubscriptionLimits();
  
  // Check total story limit
  if (limits.maxStories !== -1 && this.usage.totalStoriesCreated >= limits.maxStories) {
    return false;
  }
  
  // Check monthly limit
  if (limits.maxStoriesPerMonth !== -1 && this.usage.storiesThisMonth >= limits.maxStoriesPerMonth) {
    return false;
  }
  
  // Check daily limit
  if (limits.maxStoriesPerDay !== -1) {
    // This would need to track daily usage
    return true; // Simplified for now
  }
  
  return true;
};

SubscriptionSchema.methods.canExportStory = function(): boolean {
  if (!this.isActive()) return false;
  
  const limits = this.getSubscriptionLimits();
  
  // Check monthly export limit
  if (limits.maxExportsPerMonth !== -1 && this.usage.exportsThisMonth >= limits.maxExportsPerMonth) {
    return false;
  }
  
  return true;
};

SubscriptionSchema.methods.canUseAI = function(): boolean {
  if (!this.isActive()) return false;
  
  const limits = this.getSubscriptionLimits();
  
  // Check daily AI request limit
  if (limits.maxAIRequestsPerDay !== -1 && this.usage.aiRequestsToday >= limits.maxAIRequestsPerDay) {
    return false;
  }
  
  // Check monthly AI request limit
  if (limits.maxAIRequestsPerMonth !== -1 && this.usage.aiRequestsThisMonth >= limits.maxAIRequestsPerMonth) {
    return false;
  }
  
  return true;
};

SubscriptionSchema.methods.getRemainingLimits = function(): RemainingLimits {
  const limits = this.getSubscriptionLimits();
  
  return {
    storiesRemaining: limits.maxStories === -1 ? -1 : Math.max(0, limits.maxStories - this.usage.totalStoriesCreated),
    storiesThisMonthRemaining: limits.maxStoriesPerMonth === -1 ? -1 : Math.max(0, limits.maxStoriesPerMonth - this.usage.storiesThisMonth),
    exportsThisMonthRemaining: limits.maxExportsPerMonth === -1 ? -1 : Math.max(0, limits.maxExportsPerMonth - this.usage.exportsThisMonth),
    aiRequestsTodayRemaining: limits.maxAIRequestsPerDay === -1 ? -1 : Math.max(0, limits.maxAIRequestsPerDay - this.usage.aiRequestsToday),
    aiRequestsThisMonthRemaining: limits.maxAIRequestsPerMonth === -1 ? -1 : Math.max(0, limits.maxAIRequestsPerMonth - this.usage.aiRequestsThisMonth),
    mentorSessionsThisMonthRemaining: limits.maxMentorSessions === -1 ? -1 : Math.max(0, limits.maxMentorSessions - this.usage.mentorSessionsThisMonth),
    storageSpaceRemaining: Math.max(0, limits.maxStorageSpace - this.usage.storageUsed),
  };
};

SubscriptionSchema.methods.resetUsage = async function(): Promise<void> {
  const now = new Date();
  const updates: any = {
    'usage.monthlyResetDate': now,
    'usage.dailyResetDate': now,
    'usage.storiesThisMonth': 0,
    'usage.exportsThisMonth': 0,
    'usage.aiRequestsToday': 0,
    'usage.aiRequestsThisMonth': 0,
    'usage.mentorSessionsThisMonth': 0,
    'usage.lastCalculated': now,
  };
  
  return this.updateOne({ $set: updates });
};

SubscriptionSchema.methods.updateUsage = async function(type: string, amount: number = 1): Promise<void> {
  const updates: any = {
    'usage.lastCalculated': new Date(),
  };
  
  switch (type) {
    case 'story_created':
      updates['usage.totalStoriesCreated'] = this.usage.totalStoriesCreated + amount;
      updates['usage.storiesThisMonth'] = this.usage.storiesThisMonth + amount;
      break;
    case 'export_created':
      updates['usage.totalExports'] = this.usage.totalExports + amount;
      updates['usage.exportsThisMonth'] = this.usage.exportsThisMonth + amount;
      break;
    case 'ai_request':
      updates['usage.totalAIRequests'] = this.usage.totalAIRequests + amount;
      updates['usage.aiRequestsToday'] = this.usage.aiRequestsToday + amount;
      updates['usage.aiRequestsThisMonth'] = this.usage.aiRequestsThisMonth + amount;
      break;
    case 'mentor_session':
      updates['usage.totalMentorSessions'] = this.usage.totalMentorSessions + amount;
      updates['usage.mentorSessionsThisMonth'] = this.usage.mentorSessionsThisMonth + amount;
      break;
    case 'storage_used':
      updates['usage.storageUsed'] = Math.max(0, this.usage.storageUsed + amount);
      break;
  }
  
  return this.updateOne({ $set: updates });
};

SubscriptionSchema.methods.isActive = function(): boolean {
  return this.status === 'active' && !this.isExpired();
};

SubscriptionSchema.methods.isExpired = function(): boolean {
  if (!this.endDate) return false;
  return new Date() > this.endDate;
};

SubscriptionSchema.methods.daysUntilExpiry = function(): number {
  if (!this.endDate) return -1;
  const now = new Date();
  const expiry = new Date(this.endDate);
  if (expiry <= now) return 0;
  return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

SubscriptionSchema.methods.cancel = async function(immediate: boolean = false): Promise<void> {
  const updates: any = {
    status: immediate ? 'canceled' : 'active',
    canceledAt: new Date(),
    cancelAtPeriodEnd: !immediate,
  };
  
  if (immediate) {
    updates.endDate = new Date();
  }
  
  return this.updateOne({ $set: updates });
};

SubscriptionSchema.methods.reactivate = async function(): Promise<void> {
  return this.updateOne({
    $set: {
      status: 'active',
      cancelAtPeriodEnd: false,
    },
    $unset: {
      canceledAt: 1,
      endDate: 1,
    }
  });
};

// Static methods
SubscriptionSchema.statics.findByUser = function(userId: string) {
  return this.findOne({ userId });
};

SubscriptionSchema.statics.findActiveSubscriptions = function() {
  return this.find({ status: 'active' });
};

SubscriptionSchema.statics.findByTier = function(tier: SubscriptionTier) {
  return this.find({ tier, status: 'active' });
};

SubscriptionSchema.statics.findExpiringSoon = function(days: number = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    status: 'active',
    currentPeriodEnd: { $lte: futureDate },
    cancelAtPeriodEnd: false,
  });
};

SubscriptionSchema.statics.getSubscriptionStats = async function() {
  const pipeline = [
    {
      $group: {
        _id: null,
        totalSubscriptions: { $sum: 1 },
        activeSubscriptions: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
        canceledSubscriptions: { $sum: { $cond: [{ $eq: ['$status', 'canceled'] }, 1, 0] } },
        subscriptionsByTier: {
          $push: '$tier'
        },
        totalRevenue: { $sum: '$amount' },
        averageAmount: { $avg: '$amount' },
      }
    }
  ];
  
  const result = await this.aggregate(pipeline);
  return result[0] || {};
};

// Create and export the model
const Subscription: Model<ISubscription> = mongoose.models.Subscription || mongoose.model<ISubscription>('Subscription', SubscriptionSchema);

export default Subscription;