'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  PlusCircle,
  BookOpen,
  TrendingUp,
  Award,
  Clock,
  Star,
  Users,
  MessageCircle,
  Target,
  Calendar,
  Zap,
  Heart
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, StoryCard, MetricCard } from '@/app/components/ui/card';
import { showToast } from '@/app/components/ui/toast';

interface DashboardStats {
  totalStories: number;
  publishedStories: number;
  averageScore: number;
  writingStreak: number;
  commentsReceived: number;
  wordsWritten: number;
  nextGoal: string;
  recentAchievements: string[];
}

interface RecentStory {
  id: string;
  title: string;
  status: 'draft' | 'published' | 'reviewed';
  createdAt: string;
  score?: number;
  excerpt: string;
}

export default function DashboardClient() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentStories, setRecentStories] = useState<RecentStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch user stats
      const [storiesResponse, statsResponse] = await Promise.all([
        fetch('/api/stories?limit=6&sortBy=createdAt&sortOrder=desc'),
        fetch('/api/user/stats'),
      ]);

      if (storiesResponse.ok) {
        const storiesResult = await storiesResponse.json();
        setRecentStories(storiesResult.data.stories);
      }

      if (statsResponse.ok) {
        const statsResult = await statsResponse.json();
        setStats(statsResult.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      showToast.error('Error', 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getMotivationalMessage = () => {
    const messages = [
      "Ready to create something amazing today? 🌟",
      "Your imagination is your superpower! ✨",
      "Every great writer started with a single word 📝",
      "What story will you bring to life today? 🎨",
      "The world needs your unique stories! 🌍",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your creative dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Welcome Header */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl p-8 text-white">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    {getGreeting()}, {session?.user?.name?.split(' ')[0]}! 👋
                  </h1>
                  <p className="text-blue-100 text-lg mb-4 md:mb-0">
                    {getMotivationalMessage()}
                  </p>
                </div>
                <Link href="/create-stories">
                  <Button variant="secondary" size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                    <PlusCircle className="h-5 w-5 mr-2" />
                    Create New Story
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard
                title="Stories Written"
                value={stats?.totalStories || 0}
                icon={<BookOpen className="h-6 w-6 text-blue-600" />}
                changeType="positive"
              />
              <MetricCard
                title="Average Score"
                value={stats?.averageScore ? `${stats.averageScore}/100` : 'N/A'}
                icon={<Star className="h-6 w-6 text-yellow-600" />}
                changeType="positive"
              />
              <MetricCard
                title="Writing Streak"
                value={`${stats?.writingStreak || 0} days`}
                icon={<Zap className="h-6 w-6 text-orange-600" />}
                changeType="positive"
              />
              <MetricCard
                title="Comments"
                value={stats?.commentsReceived || 0}
                icon={<MessageCircle className="h-6 w-6 text-green-600" />}
                changeType="positive"
              />
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Stories */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Recent Stories
                  </CardTitle>
                  <Link href="/my-stories">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {recentStories.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {recentStories.map((story, index) => (
                        <motion.div
                          key={story.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <StoryCard
                            title={story.title}
                            excerpt={story.excerpt}
                            status={story.status}
                            score={story.score}
                            createdAt={new Date(story.createdAt)}
                            onClick={() => window.location.href = `/my-stories/${story.id}`}
                          />
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No stories yet
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Start your writing journey by creating your first story!
                      </p>
                      <Link href="/create-stories">
                        <Button variant="gradient">
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Create Your First Story
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Right Sidebar */}
            <motion.div variants={itemVariants} className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/create-stories">
                    <Button variant="gradient" className="w-full justify-start">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Create New Story
                    </Button>
                  </Link>
                  <Link href="/my-stories">
                    <Button variant="outline" className="w-full justify-start">
                      <BookOpen className="h-4 w-4 mr-2" />
                      View My Stories
                    </Button>
                  </Link>
                  <Link href="/progress">
                    <Button variant="outline" className="w-full justify-start">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Check Progress
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Writing Goal */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Current Goal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-2">
                      {stats?.nextGoal || 'Write your first story!'}
                    </div>
                    <p className="text-gray-600 text-sm mb-4">
                      Keep writing to unlock new achievements and improve your skills!
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((stats?.totalStories || 0) * 20, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {stats?.totalStories || 0} of 5 stories completed
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Achievements */}
              {stats?.recentAchievements && stats.recentAchievements.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Award className="h-5 w-5 mr-2" />
                      Recent Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats.recentAchievements.map((achievement, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3 p-2 bg-yellow-50 rounded-lg"
                        >
                          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                            <Award className="h-4 w-4 text-yellow-600" />
                          </div>
                          <div>
                            <p className="font-medium text-yellow-900 text-sm">
                              {achievement}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Writing Tip */}
              <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-green-800">
                    <Heart className="h-5 w-5 mr-2" />
                    Daily Writing Tip
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-green-700 text-sm">
                    💡 Try writing for just 10 minutes today. Even small writing sessions can spark big ideas and keep your creativity flowing!
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Activity Feed */}
          <motion.div variants={itemVariants} className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentStories.slice(0, 3).map((story, index) => (
                    <div key={story.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {story.status === 'published' ? 'Published' : 'Created'} "{story.title}"
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(story.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {story.score && (
                        <div className="text-right">
                          <div className="text-sm font-medium text-green-600">
                            Score: {story.score}/100
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {recentStories.length === 0 && (
                    <div className="text-center py-6 text-gray-500">
                      <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No recent activity. Start writing to see your progress here!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}