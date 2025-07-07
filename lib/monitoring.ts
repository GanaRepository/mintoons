import { connectToDatabase } from '@/utils/db';
import mongoose from 'mongoose';

// Analytics event schema
const AnalyticsEventSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: true,
    index: true,
  },
  category: {
    type: String,
    required: true,
    index: true,
  },
  action: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: false,
  },
  value: {
    type: Number,
    required: false,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    index: true,
  },
  sessionId: {
    type: String,
    required: false,
    index: true,
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    referrer: String,
    page: String,
    country: String,
    region: String,
    device: String,
    browser: String,
    os: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// User activity schema for detailed tracking
const UserActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  date: {
    type: Date,
    required: true,
    index: true,
  },
  sessions: {
    count: { type: Number, default: 0 },
    totalDuration: { type: Number, default: 0 }, // in seconds
    averageDuration: { type: Number, default: 0 },
  },
  pageViews: {
    total: { type: Number, default: 0 },
    unique: { type: Number, default: 0 },
    pages: [{
      path: String,
      views: Number,
      timeSpent: Number,
    }],
  },
  stories: {
    created: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    wordsWritten: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
  },
  interactions: {
    commentsReceived: { type: Number, default: 0 },
    commentsReplied: { type: Number, default: 0 },
    achievementsUnlocked: { type: Number, default: 0 },
    filesExported: { type: Number, default: 0 },
  },
});

// Platform metrics schema
const PlatformMetricsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true,
    index: true,
  },
  users: {
    total: { type: Number, default: 0 },
    new: { type: Number, default: 0 },
    active: { type: Number, default: 0 },
    returning: { type: Number, default: 0 },
    byAge: [{
      ageGroup: String, // '2-5', '6-8', '9-12', '13-15', '16-18'
      count: Number,
    }],
    byRole: [{
      role: String,
      count: Number,
    }],
  },
  stories: {
    total: { type: Number, default: 0 },
    created: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    averageLength: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    byGenre: [{
      genre: String,
      count: Number,
    }],
  },
  ai: {
    requestsTotal: { type: Number, default: 0 },
    costTotal: { type: Number, default: 0 },
    averageCostPerRequest: { type: Number, default: 0 },
    byProvider: [{
      provider: String,
      requests: Number,
      cost: Number,
    }],
  },
  engagement: {
    averageSessionDuration: { type: Number, default: 0 },
    bounceRate: { type: Number, default: 0 },
    pagesPerSession: { type: Number, default: 0 },
    mentorComments: { type: Number, default: 0 },
    fileExports: { type: Number, default: 0 },
  },
  revenue: {
    total: { type: Number, default: 0 },
    subscriptions: {
      basic: { type: Number, default: 0 },
      premium: { type: Number, default: 0 },
      pro: { type: Number, default: 0 },
    },
    newSubscriptions: { type: Number, default: 0 },
    churn: { type: Number, default: 0 },
  },
});

const AnalyticsEvent = mongoose.models.AnalyticsEvent || mongoose.model('AnalyticsEvent', AnalyticsEventSchema);
const UserActivity = mongoose.models.UserActivity || mongoose.model('UserActivity', UserActivitySchema);
const PlatformMetrics = mongoose.models.PlatformMetrics || mongoose.model('PlatformMetrics', PlatformMetricsSchema);

// Analytics service class
export class AnalyticsService {
  private static instance: AnalyticsService;

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  // Track events
  async trackEvent(eventData: {
    eventType: string;
    category: string;
    action: string;
    label?: string;
    value?: number;
    userId?: string;
    sessionId?: string;
    metadata?: any;
  }): Promise<void> {
    try {
      await connectToDatabase();

      const event = new AnalyticsEvent({
        ...eventData,
        timestamp: new Date(),
      });

      await event.save();
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  // Track page views
  async trackPageView(data: {
    page: string;
    userId?: string;
    sessionId?: string;
    referrer?: string;
    timeSpent?: number;
    metadata?: any;
  }): Promise<void> {
    await this.trackEvent({
      eventType: 'page_view',
      category: 'navigation',
      action: 'view',
      label: data.page,
      value: data.timeSpent,
      userId: data.userId,
      sessionId: data.sessionId,
      metadata: {
        ...data.metadata,
        page: data.page,
        referrer: data.referrer,
      },
    });
  }

  // Track user interactions
  async trackUserInteraction(data: {
    action: string;
    category: string;
    element?: string;
    userId?: string;
    sessionId?: string;
    metadata?: any;
  }): Promise<void> {
    await this.trackEvent({
      eventType: 'user_interaction',
      category: data.category,
      action: data.action,
      label: data.element,
      userId: data.userId,
      sessionId: data.sessionId,
      metadata: data.metadata,
    });
  }

  // Track story events
  async trackStoryEvent(data: {
    action: 'created' | 'updated' | 'completed' | 'deleted' | 'exported';
    storyId: string;
    userId: string;
    metadata?: any;
  }): Promise<void> {
    await this.trackEvent({
      eventType: 'story',
      category: 'content',
      action: data.action,
      label: data.storyId,
      userId: data.userId,
      metadata: data.metadata,
    });
  }

  // Track AI usage
  async trackAIUsage(data: {
    provider: string;
    action: 'generate' | 'assess';
    cost: number;
    userId: string;
    storyId?: string;
    metadata?: any;
  }): Promise<void> {
    await this.trackEvent({
      eventType: 'ai_usage',
      category: 'ai',
      action: data.action,
      label: data.provider,
      value: data.cost,
      userId: data.userId,
      metadata: {
        ...data.metadata,
        storyId: data.storyId,
        provider: data.provider,
      },
    });
  }

  // Track subscription events
  async trackSubscription(data: {
    action: 'created' | 'updated' | 'cancelled' | 'renewed';
    tier: string;
    amount: number;
    userId: string;
    metadata?: any;
  }): Promise<void> {
    await this.trackEvent({
      eventType: 'subscription',
      category: 'revenue',
      action: data.action,
      label: data.tier,
      value: data.amount,
      userId: data.userId,
      metadata: data.metadata,
    });
  }

  // Get user analytics
  async getUserAnalytics(userId: string, startDate: Date, endDate: Date): Promise<any> {
    try {
      await connectToDatabase();

      const userActivity = await UserActivity.find({
        userId,
        date: { $gte: startDate, $lte: endDate },
      }).sort({ date: 1 });

      const events = await AnalyticsEvent.find({
        userId,
        timestamp: { $gte: startDate, $lte: endDate },
      }).sort({ timestamp: 1 });

      return {
        activity: userActivity,
        events,
        summary: this.calculateUserSummary(userActivity, events),
      };
    } catch (error) {
      console.error('Failed to get user analytics:', error);
      return { activity: [], events: [], summary: {} };
    }
  }

  // Get platform analytics
  async getPlatformAnalytics(startDate: Date, endDate: Date): Promise<any> {
    try {
      await connectToDatabase();

      const metrics = await PlatformMetrics.find({
        date: { $gte: startDate, $lte: endDate },
      }).sort({ date: 1 });

      const summary = await this.calculatePlatformSummary(startDate, endDate);

      return {
        daily: metrics,
        summary,
        trends: this.calculateTrends(metrics),
      };
    } catch (error) {
      console.error('Failed to get platform analytics:', error);
      return { daily: [], summary: {}, trends: {} };
    }
  }

  // Calculate user summary
  private calculateUserSummary(activity: any[], events: any[]): any {
    const summary = {
      totalSessions: 0,
      totalTimeSpent: 0,
      storiesCreated: 0,
      storiesCompleted: 0,
      averageScore: 0,
      achievementsUnlocked: 0,
      commentsReceived: 0,
      mostActiveDay: null,
      favoriteGenre: null,
    };

    activity.forEach(day => {
      summary.totalSessions += day.sessions.count;
      summary.totalTimeSpent += day.sessions.totalDuration;
      summary.storiesCreated += day.stories.created;
      summary.storiesCompleted += day.stories.completed;
      summary.commentsReceived += day.interactions.commentsReceived;
      summary.achievementsUnlocked += day.interactions.achievementsUnlocked;
    });

    // Calculate average score
    const completedStories = activity.filter(day => day.stories.completed > 0);
    if (completedStories.length > 0) {
      summary.averageScore = completedStories.reduce((sum, day) => sum + day.stories.averageScore, 0) / completedStories.length;
    }

    // Find most active day
    const mostActiveDay = activity.reduce((max, day) => 
      day.sessions.totalDuration > (max?.sessions.totalDuration || 0) ? day : max, null);
    summary.mostActiveDay = mostActiveDay?.date;

    // Find favorite genre
    const genreCounts: Record<string, number> = {};
    events.filter(e => e.eventType === 'story' && e.action === 'created').forEach(event => {
      const genre = event.metadata?.genre;
      if (genre) {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      }
    });
    summary.favoriteGenre = Object.keys(genreCounts).reduce((a, b) => genreCounts[a] > genreCounts[b] ? a : b, null);

    return summary;
  }

  // Calculate platform summary
  private async calculatePlatformSummary(startDate: Date, endDate: Date): Promise<any> {
    try {
      const pipeline = [
        {
          $match: {
            timestamp: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: null,
            totalEvents: { $sum: 1 },
            uniqueUsers: { $addToSet: '$userId' },
            storyEvents: {
              $sum: { $cond: [{ $eq: ['$eventType', 'story'] }, 1, 0] }
            },
            aiEvents: {
              $sum: { $cond: [{ $eq: ['$eventType', 'ai_usage'] }, 1, 0] }
            },
            totalAICost: {
              $sum: { $cond: [{ $eq: ['$eventType', 'ai_usage'] }, '$value', 0] }
            },
          }
        }
      ];

      const [summary] = await AnalyticsEvent.aggregate(pipeline);
      
      if (summary) {
        summary.uniqueUsers = summary.uniqueUsers.filter((id: any) => id !== null).length;
      }

      return summary || {
        totalEvents: 0,
        uniqueUsers: 0,
        storyEvents: 0,
        aiEvents: 0,
        totalAICost: 0,
      };
    } catch (error) {
      console.error('Failed to calculate platform summary:', error);
      return {};
    }
  }

  // Calculate trends
  private calculateTrends(metrics: any[]): any {
    if (metrics.length < 2) return {};

    const latest = metrics[metrics.length - 1];
    const previous = metrics[metrics.length - 2];

    return {
      users: {
        total: this.calculatePercentageChange(previous.users.total, latest.users.total),
        active: this.calculatePercentageChange(previous.users.active, latest.users.active),
        new: this.calculatePercentageChange(previous.users.new, latest.users.new),
      },
      stories: {
        created: this.calculatePercentageChange(previous.stories.created, latest.stories.created),
        completed: this.calculatePercentageChange(previous.stories.completed, latest.stories.completed),
      },
      ai: {
        requests: this.calculatePercentageChange(previous.ai.requestsTotal, latest.ai.requestsTotal),
        cost: this.calculatePercentageChange(previous.ai.costTotal, latest.ai.costTotal),
      },
      revenue: {
        total: this.calculatePercentageChange(previous.revenue.total, latest.revenue.total),
      },
    };
  }

  private calculatePercentageChange(oldValue: number, newValue: number): number {
    if (oldValue === 0) return newValue > 0 ? 100 : 0;
    return ((newValue - oldValue) / oldValue) * 100;
  }

  // Update daily user activity
  async updateUserActivity(userId: string, activity: {
    sessionDuration?: number;
    pageViews?: string[];
    storyCreated?: boolean;
    storyCompleted?: boolean;
    wordsWritten?: number;
    storyScore?: number;
    commentReceived?: boolean;
    commentReplied?: boolean;
    achievementUnlocked?: boolean;
    fileExported?: boolean;
  }): Promise<void> {
    try {
      await connectToDatabase();

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const userActivity = await UserActivity.findOneAndUpdate(
        { userId, date: today },
        {
          $inc: {
            'sessions.count': 1,
            'sessions.totalDuration': activity.sessionDuration || 0,
            'pageViews.total': activity.pageViews?.length || 0,
            'stories.created': activity.storyCreated ? 1 : 0,
            'stories.completed': activity.storyCompleted ? 1 : 0,
            'stories.wordsWritten': activity.wordsWritten || 0,
            'interactions.commentsReceived': activity.commentReceived ? 1 : 0,
            'interactions.commentsReplied': activity.commentReplied ? 1 : 0,
            'interactions.achievementsUnlocked': activity.achievementUnlocked ? 1 : 0,
            'interactions.filesExported': activity.fileExported ? 1 : 0,
          },
        },
        { upsert: true, new: true }
      );

      // Update average session duration
      if (userActivity.sessions.count > 0) {
        userActivity.sessions.averageDuration = userActivity.sessions.totalDuration / userActivity.sessions.count;
      }

      // Update average story score
      if (activity.storyCompleted && activity.storyScore) {
        const currentAvg = userActivity.stories.averageScore || 0;
        const completedCount = userActivity.stories.completed;
        userActivity.stories.averageScore = ((currentAvg * (completedCount - 1)) + activity.storyScore) / completedCount;
      }

      await userActivity.save();
    } catch (error) {
      console.error('Failed to update user activity:', error);
    }
  }

  // Update daily platform metrics
  async updatePlatformMetrics(): Promise<void> {
    try {
      await connectToDatabase();

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Calculate metrics for today
      const [userMetrics, storyMetrics, aiMetrics, engagementMetrics] = await Promise.all([
        this.calculateUserMetrics(today),
        this.calculateStoryMetrics(today),
        this.calculateAIMetrics(today),
        this.calculateEngagementMetrics(today),
      ]);

      await PlatformMetrics.findOneAndUpdate(
        { date: today },
        {
          users: userMetrics,
          stories: storyMetrics,
          ai: aiMetrics,
          engagement: engagementMetrics,
        },
        { upsert: true }
      );
    } catch (error) {
      console.error('Failed to update platform metrics:', error);
    }
  }

  private async calculateUserMetrics(date: Date): Promise<any> {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const User = mongoose.models.User;
    if (!User) return {};

    const [totalUsers, newUsers, activeUsers] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ createdAt: { $gte: date, $lt: nextDay } }),
      User.countDocuments({ lastLoginAt: { $gte: date, $lt: nextDay } }),
    ]);

    const usersByAge = await User.aggregate([
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $and: [{ $gte: ['$age', 2] }, { $lte: ['$age', 5] }] }, then: '2-5' },
                { case: { $and: [{ $gte: ['$age', 6] }, { $lte: ['$age', 8] }] }, then: '6-8' },
                { case: { $and: [{ $gte: ['$age', 9] }, { $lte: ['$age', 12] }] }, then: '9-12' },
                { case: { $and: [{ $gte: ['$age', 13] }, { $lte: ['$age', 15] }] }, then: '13-15' },
                { case: { $and: [{ $gte: ['$age', 16] }, { $lte: ['$age', 18] }] }, then: '16-18' },
              ],
              default: 'unknown'
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    return {
      total: totalUsers,
      new: newUsers,
      active: activeUsers,
      returning: activeUsers - newUsers,
      byAge: usersByAge.map(group => ({ ageGroup: group._id, count: group.count })),
      byRole: usersByRole.map(group => ({ role: group._id, count: group.count })),
    };
  }

  private async calculateStoryMetrics(date: Date): Promise<any> {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const Story = mongoose.models.Story;
    if (!Story) return {};

    const [totalStories, createdToday, completedToday] = await Promise.all([
      Story.countDocuments({}),
      Story.countDocuments({ createdAt: { $gte: date, $lt: nextDay } }),
      Story.countDocuments({ 
        completedAt: { $gte: date, $lt: nextDay },
        status: 'completed'
      }),
    ]);

    const avgLengthResult = await Story.aggregate([
      { $match: { createdAt: { $gte: date, $lt: nextDay } } },
      { $group: { _id: null, avgLength: { $avg: { $size: { $split: ['$content', ' '] } } } } }
    ]);

    const avgScoreResult = await Story.aggregate([
      { 
        $match: { 
          completedAt: { $gte: date, $lt: nextDay },
          'assessment.overallScore': { $exists: true }
        }
      },
      { $group: { _id: null, avgScore: { $avg: '$assessment.overallScore' } } }
    ]);

    const storysByGenre = await Story.aggregate([
      { $match: { createdAt: { $gte: date, $lt: nextDay } } },
      { $group: { _id: '$elements.genre', count: { $sum: 1 } } }
    ]);

    return {
      total: totalStories,
      created: createdToday,
      completed: completedToday,
      averageLength: avgLengthResult[0]?.avgLength || 0,
      averageScore: avgScoreResult[0]?.avgScore || 0,
      byGenre: storysByGenre.map(group => ({ genre: group._id, count: group.count })),
    };
  }

  private async calculateAIMetrics(date: Date): Promise<any> {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const aiEvents = await AnalyticsEvent.find({
      eventType: 'ai_usage',
      timestamp: { $gte: date, $lt: nextDay }
    });

    const totalRequests = aiEvents.length;
    const totalCost = aiEvents.reduce((sum, event) => sum + (event.value || 0), 0);

    const byProvider = aiEvents.reduce((acc: any, event) => {
      const provider = event.label || 'unknown';
      if (!acc[provider]) {
        acc[provider] = { requests: 0, cost: 0 };
      }
      acc[provider].requests++;
      acc[provider].cost += event.value || 0;
      return acc;
    }, {});

    return {
      requestsTotal: totalRequests,
      costTotal: totalCost,
      averageCostPerRequest: totalRequests > 0 ? totalCost / totalRequests : 0,
      byProvider: Object.entries(byProvider).map(([provider, data]: [string, any]) => ({
        provider,
        requests: data.requests,
        cost: data.cost,
      })),
    };
  }

  private async calculateEngagementMetrics(date: Date): Promise<any> {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const sessionEvents = await AnalyticsEvent.find({
      eventType: 'session',
      timestamp: { $gte: date, $lt: nextDay }
    });

    const pageViewEvents = await AnalyticsEvent.find({
      eventType: 'page_view',
      timestamp: { $gte: date, $lt: nextDay }
    });

    const averageSessionDuration = sessionEvents.length > 0 
      ? sessionEvents.reduce((sum, event) => sum + (event.value || 0), 0) / sessionEvents.length
      : 0;

    const uniqueSessions = new Set(sessionEvents.map(e => e.sessionId)).size;
    const bounces = sessionEvents.filter(e => e.metadata?.pageCount === 1).length;
    const bounceRate = uniqueSessions > 0 ? (bounces / uniqueSessions) * 100 : 0;

    const pagesPerSession = uniqueSessions > 0 ? pageViewEvents.length / uniqueSessions : 0;

    return {
      averageSessionDuration,
      bounceRate,
      pagesPerSession,
      mentorComments: 0, // Would be calculated from comment events
      fileExports: 0,   // Would be calculated from export events
    };
  }

  // Get real-time analytics
  async getRealTimeAnalytics(): Promise<any> {
    try {
      await connectToDatabase();

      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      const [activeUsers, recentEvents, onlineUsers] = await Promise.all([
        AnalyticsEvent.distinct('userId', {
          timestamp: { $gte: oneHourAgo }
        }),
        AnalyticsEvent.find({
          timestamp: { $gte: oneHourAgo }
        }).sort({ timestamp: -1 }).limit(50),
        this.getOnlineUsers(),
      ]);

      return {
        activeUsers: activeUsers.filter(id => id !== null).length,
        onlineUsers,
        recentEvents,
        timestamp: now,
      };
    } catch (error) {
      console.error('Failed to get real-time analytics:', error);
      return {
        activeUsers: 0,
        onlineUsers: 0,
        recentEvents: [],
        timestamp: new Date(),
      };
    }
  }

  private async getOnlineUsers(): Promise<number> {
    // In a real implementation, this would check active sessions
    // For now, return a placeholder
    return 0;
  }

  // Export analytics data
  async exportAnalytics(startDate: Date, endDate: Date, format: 'json' | 'csv'): Promise<any> {
    try {
      await connectToDatabase();

      const events = await AnalyticsEvent.find({
        timestamp: { $gte: startDate, $lte: endDate }
      }).sort({ timestamp: 1 });

      const metrics = await PlatformMetrics.find({
        date: { $gte: startDate, $lte: endDate }
      }).sort({ date: 1 });

      if (format === 'csv') {
        return this.convertToCSV({ events, metrics });
      }

      return { events, metrics };
    } catch (error) {
      console.error('Failed to export analytics:', error);
      return null;
    }
  }

  private convertToCSV(data: any): string {
    // Simplified CSV conversion - in production, use a proper CSV library
    const { events, metrics } = data;
    
    let csv = 'Type,Date,Category,Action,Label,Value,UserId\n';
    
    events.forEach((event: any) => {
      csv += `Event,${event.timestamp},${event.category},${event.action},${event.label || ''},${event.value || ''},${event.userId || ''}\n`;
    });

    metrics.forEach((metric: any) => {
      csv += `Metric,${metric.date},Platform,Daily,Users,${metric.users.total},\n`;
      csv += `Metric,${metric.date},Platform,Daily,Stories,${metric.stories.total},\n`;
      csv += `Metric,${metric.date},Platform,Daily,Revenue,${metric.revenue.total},\n`;
    });

    return csv;
  }

  // Cleanup old analytics data
  async cleanupOldData(retentionDays = 365): Promise<void> {
    try {
      await connectToDatabase();

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const [eventsDeleted, activityDeleted, metricsDeleted] = await Promise.all([
        AnalyticsEvent.deleteMany({ timestamp: { $lt: cutoffDate } }),
        UserActivity.deleteMany({ date: { $lt: cutoffDate } }),
        PlatformMetrics.deleteMany({ date: { $lt: cutoffDate } }),
      ]);

      console.log(`Cleaned up analytics data: ${eventsDeleted.deletedCount} events, ${activityDeleted.deletedCount} activities, ${metricsDeleted.deletedCount} metrics`);
    } catch (error) {
      console.error('Failed to cleanup old analytics data:', error);
    }
  }
}

// Export singleton instance and helper functions
export const analytics = AnalyticsService.getInstance();

// Helper functions for common tracking
export async function trackPageView(data: {
  page: string;
  userId?: string;
  sessionId?: string;
  referrer?: string;
  timeSpent?: number;
}): Promise<void> {
  await analytics.trackPageView(data);
}

export async function trackStoryCreated(storyId: string, userId: string, metadata?: any): Promise<void> {
  await analytics.trackStoryEvent({
    action: 'created',
    storyId,
    userId,
    metadata,
  });
}

export async function trackStoryCompleted(storyId: string, userId: string, score: number, metadata?: any): Promise<void> {
  await analytics.trackStoryEvent({
    action: 'completed',
    storyId,
    userId,
    metadata: { ...metadata, score },
  });
}

export async function trackAIGeneration(provider: string, cost: number, userId: string, storyId?: string): Promise<void> {
  await analytics.trackAIUsage({
    provider,
    action: 'generate',
    cost,
    userId,
    storyId,
  });
}

export async function trackUserRegistration(userId: string, metadata?: any): Promise<void> {
  await analytics.trackEvent({
    eventType: 'user',
    category: 'auth',
    action: 'register',
    userId,
    metadata,
  });
}

export async function trackSubscriptionCreated(userId: string, tier: string, amount: number): Promise<void> {
  await analytics.trackSubscription({
    action: 'created',
    tier,
    amount,
    userId,
  });
}