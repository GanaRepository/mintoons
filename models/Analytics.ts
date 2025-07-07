// models/Analytics.ts - Analytics Data Schema
import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalyticsEvent extends Document {
  eventType: string;
  category: 'user' | 'story' | 'ai' | 'mentor' | 'system' | 'subscription' | 'engagement';
  userId?: mongoose.Types.ObjectId;
  sessionId?: string;
  
  // Event details
  action: string;
  label?: string;
  value?: number;
  
  // Context data
  metadata: Record<string, any>;
  userAgent?: string;
  ipAddress?: string;
  referrer?: string;
  
  // Timing
  timestamp: Date;
  duration?: number;
  
  // Location context
  page?: string;
  storyId?: mongoose.Types.ObjectId;
  
  // User context
  userRole?: 'child' | 'mentor' | 'admin';
  userAge?: number;
  
  // Device/Browser info
  deviceType?: 'desktop' | 'tablet' | 'mobile';
  browserInfo?: {
    name: string;
    version: string;
    os: string;
  };
  
  // Performance metrics
  performance?: {
    loadTime: number;
    renderTime: number;
    apiResponseTime: number;
  };
  
  // A/B Testing
  experiments?: Array<{
    name: string;
    variant: string;
  }>;
  
  // Revenue tracking
  revenue?: {
    amount: number;
    currency: string;
    transactionId?: string;
  };
}

const AnalyticsEventSchema = new Schema<IAnalyticsEvent>({
  eventType: {
    type: String,
    required: true,
    index: true,
  },
  category: {
    type: String,
    enum: ['user', 'story', 'ai', 'mentor', 'system', 'subscription', 'engagement'],
    required: true,
    index: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  sessionId: {
    type: String,
    index: true,
  },
  action: {
    type: String,
    required: true,
    index: true,
  },
  label: String,
  value: Number,
  metadata: {
    type: Schema.Types.Mixed,
    default: {},
  },
  userAgent: String,
  ipAddress: String,
  referrer: String,
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  duration: Number,
  page: String,
  storyId: {
    type: Schema.Types.ObjectId,
    ref: 'Story',
  },
  userRole: {
    type: String,
    enum: ['child', 'mentor', 'admin'],
  },
  userAge: Number,
  deviceType: {
    type: String,
    enum: ['desktop', 'tablet', 'mobile'],
  },
  browserInfo: {
    name: String,
    version: String,
    os: String,
  },
  performance: {
    loadTime: Number,
    renderTime: Number,
    apiResponseTime: Number,
  },
  experiments: [{
    name: String,
    variant: String,
  }],
  revenue: {
    amount: Number,
    currency: String,
    transactionId: String,
  },
}, {
  timestamps: true,
});

// Indexes for analytics queries
AnalyticsEventSchema.index({ timestamp: -1 });
AnalyticsEventSchema.index({ eventType: 1, timestamp: -1 });
AnalyticsEventSchema.index({ category: 1, timestamp: -1 });
AnalyticsEventSchema.index({ userId: 1, timestamp: -1 });
AnalyticsEventSchema.index({ storyId: 1, timestamp: -1 });
AnalyticsEventSchema.index({ userRole: 1, timestamp: -1 });

// Compound indexes for common queries
AnalyticsEventSchema.index({ category: 1, eventType: 1, timestamp: -1 });
AnalyticsEventSchema.index({ userId: 1, category: 1, timestamp: -1 });

// TTL index to automatically delete old analytics data (optional)
AnalyticsEventSchema.index({ timestamp: 1 }, { expireAfterSeconds: 31536000 }); // 1 year

// Analytics aggregation schema for pre-computed metrics
export interface IAnalyticsAggregate extends Document {
  type: 'daily' | 'weekly' | 'monthly';
  date: Date;
  category: string;
  metrics: {
    totalEvents: number;
    uniqueUsers: number;
    averageSessionDuration: number;
    bounceRate: number;
    conversionRate: number;
    revenue: number;
  };
  breakdowns: {
    byEventType: Record<string, number>;
    byUserRole: Record<string, number>;
    byDeviceType: Record<string, number>;
    byPage: Record<string, number>;
  };
  createdAt: Date;
  updatedAt: Date;
}

const AnalyticsAggregateSchema = new Schema<IAnalyticsAggregate>({
  type: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  metrics: {
    totalEvents: { type: Number, default: 0 },
    uniqueUsers: { type: Number, default: 0 },
    averageSessionDuration: { type: Number, default: 0 },
    bounceRate: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
  },
  breakdowns: {
    byEventType: { type: Schema.Types.Mixed, default: {} },
    byUserRole: { type: Schema.Types.Mixed, default: {} },
    byDeviceType: { type: Schema.Types.Mixed, default: {} },
    byPage: { type: Schema.Types.Mixed, default: {} },
  },
}, {
  timestamps: true,
});

// Compound unique index for aggregates
AnalyticsAggregateSchema.index({ type: 1, date: 1, category: 1 }, { unique: true });

export const AnalyticsEvent = mongoose.models.AnalyticsEvent || mongoose.model<IAnalyticsEvent>('AnalyticsEvent', AnalyticsEventSchema);
export const AnalyticsAggregate = mongoose.models.AnalyticsAggregate || mongoose.model<IAnalyticsAggregate>('AnalyticsAggregate', AnalyticsAggregateSchema);

export default AnalyticsEvent;