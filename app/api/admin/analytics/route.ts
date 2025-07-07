import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectDB } from '@/utils/db';
import User from '@/models/User';
import Story from '@/models/Story';
import Comment from '@/models/Comment';
import Notification from '@/models/Notification';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '30d'; // 7d, 30d, 90d, 1y
    const metric = searchParams.get('metric'); // specific metric to get

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (timeframe) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // If specific metric requested, return only that
    if (metric) {
      const data = await getSpecificMetric(metric, startDate, now);
      return NextResponse.json(data);
    }

    // Get comprehensive analytics
    const analytics = await Promise.all([
      getUserAnalytics(startDate, now),
      getStoryAnalytics(startDate, now),
      getEngagementAnalytics(startDate, now),
      getContentAnalytics(),
      getPerformanceMetrics(startDate, now),
      getGrowthMetrics(startDate, now)
    ]);

    const [userMetrics, storyMetrics, engagementMetrics, contentMetrics, performanceMetrics, growthMetrics] = analytics;

    return NextResponse.json({
      timeframe,
      generatedAt: now.toISOString(),
      overview: {
        totalUsers: userMetrics.total,
        totalStories: storyMetrics.total,
        totalComments: engagementMetrics.totalComments,
        activeUsers: userMetrics.active,
        publishedStories: storyMetrics.published,
        avgEngagement: engagementMetrics.averageEngagement
      },
      users: userMetrics,
      stories: storyMetrics,
      engagement: engagementMetrics,
      content: contentMetrics,
      performance: performanceMetrics,
      growth: growthMetrics
    });

  } catch (error) {
    console.error('Admin analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

async function getUserAnalytics(startDate: Date, endDate: Date) {
  // Total users
  const totalUsers = await User.countDocuments();
  
  // New users in period
  const newUsers = await User.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate }
  });

  // Active users (users who created stories or comments in period)
  const activeUserIds = await Story.distinct('author', {
    createdAt: { $gte: startDate, $lte: endDate }
  });
  const activeCommentUserIds = await Comment.distinct('author', {
    createdAt: { $gte: startDate, $lte: endDate }
  });
  const uniqueActiveUsers = new Set([...activeUserIds, ...activeCommentUserIds]);

  // User distribution by role
  const usersByRole = await User.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } },
    { $project: { role: '$_id', count: 1, _id: 0 } }
  ]);

  // User distribution by age group
  const usersByAge = await User.aggregate([
    { $group: { _id: '$ageGroup', count: { $sum: 1 } } },
    { $project: { ageGroup: '$_id', count: 1, _id: 0 } }
  ]);

  // Daily new user registration trend
  const dailyRegistrations = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        date: {
          $dateFromParts: {
            year: '$_id.year',
            month: '$_id.month',
            day: '$_id.day'
          }
        },
        count: 1,
        _id: 0
      }
    },
    { $sort: { date: 1 } }
  ]);

  return {
    total: totalUsers,
    new: newUsers,
    active: uniqueActiveUsers.size,
    byRole: usersByRole,
    byAge: usersByAge,
    registrationTrend: dailyRegistrations
  };
}

async function getStoryAnalytics(startDate: Date, endDate: Date) {
  // Total stories
  const totalStories = await Story.countDocuments();
  
  // New stories in period
  const newStories = await Story.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate }
  });

  // Published stories
  const publishedStories = await Story.countDocuments({
    status: 'published'
  });

  // Stories by genre
  const storiesByGenre = await Story.aggregate([
    { $group: { _id: '$genre', count: { $sum: 1 } } },
    { $project: { genre: '$_id', count: 1, _id: 0 } },
    { $sort: { count: -1 } }
  ]);

  // Stories by target age
  const storiesByAge = await Story.aggregate([
    { $group: { _id: '$targetAge', count: { $sum: 1 } } },
    { $project: { targetAge: '$_id', count: 1, _id: 0 } },
    { $sort: { count: -1 } }
  ]);

  // Story completion rates
  const draftStories = await Story.countDocuments({ status: 'draft' });
  const completionRate = totalStories > 0 ? (publishedStories / totalStories) * 100 : 0;

  // Average story length
  const avgWordCount = await Story.aggregate([
    { $match: { status: 'published' } },
    { $group: { _id: null, avgWords: { $avg: '$wordCount' } } }
  ]);

  // Daily story creation trend
  const dailyStoryCreation = await Story.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        date: {
          $dateFromParts: {
            year: '$_id.year',
            month: '$_id.month',
            day: '$_id.day'
          }
        },
        count: 1,
        _id: 0
      }
    },
    { $sort: { date: 1 } }
  ]);

  return {
    total: totalStories,
    new: newStories,
    published: publishedStories,
    drafts: draftStories,
    completionRate,
    averageWordCount: avgWordCount[0]?.avgWords || 0,
    byGenre: storiesByGenre,
    byAge: storiesByAge,
    creationTrend: dailyStoryCreation
  };
}

async function getEngagementAnalytics(startDate: Date, endDate: Date) {
  // Total comments
  const totalComments = await Comment.countDocuments();
  
  // New comments in period
  const newComments = await Comment.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate }
  });

  // Total likes across all stories
  const likesData = await Story.aggregate([
    { $project: { likesCount: { $size: '$likes' } } },
    { $group: { _id: null, totalLikes: { $sum: '$likesCount' } } }
  ]);
  const totalLikes = likesData[0]?.totalLikes || 0;

  // Comment-to-story ratio
  const commentToStoryRatio = totalStories > 0 ? totalComments / totalStories : 0;

  // Most engaged stories
  const mostEngagedStories = await Story.aggregate([
    {
      $addFields: {
        likesCount: { $size: '$likes' },
        engagementScore: {
          $add: [
            { $size: '$likes' },
            { $multiply: ['$commentsCount', 2] },
            { $divide: ['$viewsCount', 10] }
          ]
        }
      }
    },
    { $sort: { engagementScore: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        as: 'author'
      }
    },
    { $unwind: '$author' },
    {
      $project: {
        title: 1,
        author: { name: 1, role: 1 },
        likesCount: 1,
        commentsCount: 1,
        viewsCount: 1,
        engagementScore: 1,
        createdAt: 1
      }
    }
  ]);

  // Daily engagement trend
  const dailyEngagement = await Comment.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        comments: { $sum: 1 }
      }
    },
    {
      $project: {
        date: {
          $dateFromParts: {
            year: '$_id.year',
            month: '$_id.month',
            day: '$_id.day'
          }
        },
        comments: 1,
        _id: 0
      }
    },
    { $sort: { date: 1 } }
  ]);

  return {
    totalComments,
    newComments,
    totalLikes,
    commentToStoryRatio,
    averageEngagement: (totalLikes + totalComments) / Math.max(totalStories, 1),
    mostEngagedStories,
    engagementTrend: dailyEngagement
  };
}

async function getContentAnalytics() {
  // Popular tags
  const popularTags = await Story.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 20 },
    { $project: { tag: '$_id', count: 1, _id: 0 } }
  ]);

  // Content moderation stats
  const flaggedContent = await Story.countDocuments({ flagged: true });
  const reviewedContent = await Story.countDocuments({ reviewed: true });

  // Reading time distribution
  const readingTimeDistribution = await Story.aggregate([
    { $match: { status: 'published' } },
    {
      $bucket: {
        groupBy: '$readingTime',
        boundaries: [0, 2, 5, 10, 15, 20],
        default: '20+',
        output: { count: { $sum: 1 } }
      }
    }
  ]);

  return {
    popularTags,
    moderation: {
      flagged: flaggedContent,
      reviewed: reviewedContent
    },
    readingTimeDistribution
  };
}

async function getPerformanceMetrics(startDate: Date, endDate: Date) {
  // Average response time (simulated - you'd track this in real implementation)
  const avgResponseTime = 250 + Math.random() * 100;

  // System health metrics (simulated)
  const systemHealth = {
    uptime: 99.9,
    errorRate: 0.1,
    averageLoadTime: avgResponseTime
  };

  // User session data (simulated)
  const sessionMetrics = {
    averageSessionDuration: 15.5, // minutes
    bounceRate: 12.3, // percentage
    pagesPerSession: 4.2
  };

  return {
    systemHealth,
    sessionMetrics,
    performance: {
      apiResponseTime: avgResponseTime,
      databaseQueryTime: avgResponseTime * 0.6,
      renderTime: avgResponseTime * 0.4
    }
  };
}

async function getGrowthMetrics(startDate: Date, endDate: Date) {
  // Calculate previous period for comparison
  const periodLength = endDate.getTime() - startDate.getTime();
  const prevStartDate = new Date(startDate.getTime() - periodLength);
  const prevEndDate = startDate;

  // Current period metrics
  const currentUsers = await User.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate }
  });
  const currentStories = await Story.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate }
  });

  // Previous period metrics
  const prevUsers = await User.countDocuments({
    createdAt: { $gte: prevStartDate, $lte: prevEndDate }
  });
  const prevStories = await Story.countDocuments({
    createdAt: { $gte: prevStartDate, $lte: prevEndDate }
  });

  // Calculate growth rates
  const userGrowthRate = prevUsers > 0 ? ((currentUsers - prevUsers) / prevUsers) * 100 : 0;
  const storyGrowthRate = prevStories > 0 ? ((currentStories - prevStories) / prevStories) * 100 : 0;

  return {
    users: {
      current: currentUsers,
      previous: prevUsers,
      growthRate: userGrowthRate
    },
    stories: {
      current: currentStories,
      previous: prevStories,
      growthRate: storyGrowthRate
    },
    trends: {
      userGrowthTrend: userGrowthRate > 0 ? 'up' : userGrowthRate < 0 ? 'down' : 'stable',
      storyGrowthTrend: storyGrowthRate > 0 ? 'up' : storyGrowthRate < 0 ? 'down' : 'stable'
    }
  };
}

async function getSpecificMetric(metric: string, startDate: Date, endDate: Date) {
  switch (metric) {
    case 'user_activity':
      return getUserActivityMetric(startDate, endDate);
    case 'story_performance':
      return getStoryPerformanceMetric(startDate, endDate);
    case 'engagement_rates':
      return getEngagementRatesMetric(startDate, endDate);
    default:
      throw new Error('Unknown metric requested');
  }
}

async function getUserActivityMetric(startDate: Date, endDate: Date) {
  const dailyActiveUsers = await User.aggregate([
    // This would require tracking user activity in a real implementation
    // For now, we'll simulate based on story/comment creation
  ]);

  return { metric: 'user_activity', data: dailyActiveUsers };
}

async function getStoryPerformanceMetric(startDate: Date, endDate: Date) {
  const topPerformingStories = await Story.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: 'published'
      }
    },
    {
      $addFields: {
        likesCount: { $size: '$likes' },
        performanceScore: {
          $add: [
            { $multiply: [{ $size: '$likes' }, 3] },
            { $multiply: ['$commentsCount', 2] },
            { $divide: ['$viewsCount', 5] }
          ]
        }
      }
    },
    { $sort: { performanceScore: -1 } },
    { $limit: 20 }
  ]);

  return { metric: 'story_performance', data: topPerformingStories };
}

async function getEngagementRatesMetric(startDate: Date, endDate: Date) {
  const engagementByGenre = await Story.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: 'published'
      }
    },
    {
      $group: {
        _id: '$genre',
        totalStories: { $sum: 1 },
        totalLikes: { $sum: { $size: '$likes' } },
        totalComments: { $sum: '$commentsCount' },
        totalViews: { $sum: '$viewsCount' }
      }
    },
    {
      $addFields: {
        engagementRate: {
          $divide: [
            { $add: ['$totalLikes', '$totalComments'] },
            '$totalViews'
          ]
        }
      }
    },
    { $sort: { engagementRate: -1 } }
  ]);

  return { metric: 'engagement_rates', data: engagementByGenre };
}