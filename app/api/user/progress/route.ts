import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import User from '@/models/User';
import Story from '@/models/Story';
import Achievement from '@/models/Achievement';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const userId = session.user.id;

    // Get user data
    const user = await User.findById(userId)
      .populate('gamification.achievements', 'name description icon category')
      .select('-password');

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Get user's stories
    const stories = await Story.find({ userId })
      .sort({ createdAt: -1 })
      .select('title wordCount aiAssessment createdAt status');

    // Calculate progress metrics
    const totalStories = stories.length;
    const publishedStories = stories.filter(s => s.status === 'published').length;
    const totalWords = stories.reduce((sum, story) => sum + story.wordCount, 0);
    
    // Calculate average scores
    const storiesWithAssessment = stories.filter(s => s.aiAssessment);
    const averageGrammarScore = storiesWithAssessment.length > 0
      ? storiesWithAssessment.reduce((sum, story) => sum + story.aiAssessment.grammarScore, 0) / storiesWithAssessment.length
      : 0;
    const averageCreativityScore = storiesWithAssessment.length > 0
      ? storiesWithAssessment.reduce((sum, story) => sum + story.aiAssessment.creativityScore, 0) / storiesWithAssessment.length
      : 0;
    const averageOverallScore = storiesWithAssessment.length > 0
      ? storiesWithAssessment.reduce((sum, story) => sum + story.aiAssessment.overallScore, 0) / storiesWithAssessment.length
      : 0;

    // Calculate writing streak
    const sortedStories = stories
      .filter(s => s.status === 'published')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    if (sortedStories.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Check current streak
      for (let i = 0; i < sortedStories.length; i++) {
        const storyDate = new Date(sortedStories[i].createdAt);
        storyDate.setHours(0, 0, 0, 0);
        
        const expectedDate = new Date(today);
        expectedDate.setDate(today.getDate() - i);
        
        if (storyDate.getTime() === expectedDate.getTime()) {
          currentStreak++;
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          if (i === 0) {
            // No story today, check if there was one yesterday
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            
            if (storyDate.getTime() === yesterday.getTime()) {
              currentStreak = 1;
              tempStreak = 1;
            }
          }
          break;
        }
      }
    }

    // Get monthly progress (last 6 months)
    const monthlyProgress = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
      
      const nextMonth = new Date(date);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      
      const monthStories = stories.filter(story => {
        const storyDate = new Date(story.createdAt);
        return storyDate >= date && storyDate < nextMonth;
      });
      
      monthlyProgress.push({
        month: date.toISOString().slice(0, 7), // YYYY-MM format
        monthName: date.toLocaleDateString('en-US', { month: 'short' }),
        stories: monthStories.length,
        words: monthStories.reduce((sum, story) => sum + story.wordCount, 0),
        averageScore: monthStories.length > 0
          ? monthStories
              .filter(s => s.aiAssessment)
              .reduce((sum, story) => sum + story.aiAssessment.overallScore, 0) / 
            Math.max(monthStories.filter(s => s.aiAssessment).length, 1)
          : 0
      });
    }

    // Get genre distribution
    const genreDistribution = stories.reduce((acc: { [key: string]: number }, story) => {
      const genre = story.elements?.genre || 'unknown';
      acc[genre] = (acc[genre] || 0) + 1;
      return acc;
    }, {});

    // Calculate level progress
    const currentLevel = user.gamification.level;
    const currentXP = user.gamification.xp;
    const xpForCurrentLevel = (currentLevel - 1) * 100;
    const xpForNextLevel = currentLevel * 100;
    const xpProgress = currentXP - xpForCurrentLevel;
    const xpNeeded = xpForNextLevel - currentXP;

    // Get recent achievements
    const allAchievements = await Achievement.find()
      .sort({ createdAt: -1 })
      .limit(20);

    const unlockedAchievements = user.gamification.achievements;
    const availableAchievements = allAchievements.filter(
      achievement => !unlockedAchievements.some(
        unlocked => unlocked._id.toString() === achievement._id.toString()
      )
    );

    const progressData = {
      overview: {
        totalStories,
        publishedStories,
        totalWords,
        currentLevel,
        currentXP,
        xpProgress,
        xpNeeded,
        currentStreak,
        longestStreak
      },
      scores: {
        grammar: Math.round(averageGrammarScore),
        creativity: Math.round(averageCreativityScore),
        overall: Math.round(averageOverallScore)
      },
      monthlyProgress,
      genreDistribution,
      achievements: {
        unlocked: unlockedAchievements,
        available: availableAchievements.slice(0, 5), // Show next 5 available
        total: allAchievements.length,
        unlockedCount: unlockedAchievements.length
      },
      recentStories: stories.slice(0, 5), // Last 5 stories
      goals: {
        storiesThisMonth: monthlyProgress[monthlyProgress.length - 1]?.stories || 0,
        wordsThisMonth: monthlyProgress[monthlyProgress.length - 1]?.words || 0,
        targetStoriesThisMonth: 4, // Goal: 4 stories per month
        targetWordsThisMonth: 2000 // Goal: 2000 words per month
      }
    };

    return NextResponse.json({
      success: true,
      data: progressData
    });

  } catch (error) {
    console.error('Get progress error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch progress data' },
      { status: 500 }
    );
  }
}