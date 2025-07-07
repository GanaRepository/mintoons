'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Award,
  Target,
  Calendar,
  BookOpen,
  Star,
  Zap,
  Trophy,
  Clock,
  Edit,
  BarChart3,
  PieChart,
  Activity,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Minus,
  Crown,
  Flame,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, StatCard } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { ProgressBar } from '@/app/components/ui/progress-bar';
import { useToast } from '@/app/components/ui/toast';

interface ProgressData {
  overallStats: {
    storiesCompleted: number;
    averageGrammarScore: number;
    averageCreativityScore: number;
    writingStreak: number;
    totalWords: number;
    level: number;
    xp: number;
    nextLevelXP: number;
  };
  weeklyProgress: {
    week: string;
    stories: number;
    grammar: number;
    creativity: number;
    words: number;
  }[];
  achievements: {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlockedAt: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
  }[];
  goals: {
    id: string;
    title: string;
    description: string;
    target: number;
    current: number;
    deadline: string;
    reward: string;
  }[];
  streakData: {
    currentStreak: number;
    longestStreak: number;
    streakCalendar: { date: string; hasStory: boolean }[];
  };
}

export default function ProgressClient() {
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'overview' | 'achievements' | 'goals' | 'analytics'>('overview');
  const { showToast } = useToast();

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/progress');
      
      if (!response.ok) {
        throw new Error('Failed to fetch progress data');
      }

      const data = await response.json();
      setProgressData(data.progress);
    } catch (error) {
      console.error('Error fetching progress:', error);
      showToast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load progress data',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetStreak = async () => {
    try {
      const response = await fetch('/api/user/reset-streak', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to reset streak');
      }

      showToast({
        variant: 'success',
        title: 'Streak Reset',
        description: 'Your writing streak has been reset. Time for a fresh start!',
      });

      fetchProgressData();
    } catch (error) {
      console.error('Error resetting streak:', error);
      showToast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to reset streak',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-white rounded-xl h-32 shadow-sm"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!progressData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6 flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="p-8">
            <BookOpen className="w-16 h-16 mx-auto text-purple-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Progress Yet</h2>
            <p className="text-gray-600 mb-6">
              Start writing your first story to see your progress!
            </p>
            <Button asChild>
              <a href="/create-stories">
                <PlusCircle className="w-4 h-4 mr-2" />
                Create First Story
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { overallStats, achievements, goals, streakData, weeklyProgress } = progressData;

  const getChangeIcon = (current: number, previous: number) => {
    if (current > previous) return <ArrowUp className="w-4 h-4 text-green-500" />;
    if (current < previous) return <ArrowDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-gradient-to-r from-yellow-400 to-orange-500';
      case 'epic': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'rare': return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500';
    }
  };

  const levelProgress = (overallStats.xp / overallStats.nextLevelXP) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Progress</h1>
              <p className="text-gray-600">Track your writing journey and celebrate achievements!</p>
            </div>
            
            {/* Level Badge */}
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <div className="bg-white rounded-full p-4 shadow-lg border">
                <div className="flex items-center space-x-3">
                  <Crown className="w-6 h-6 text-yellow-500" />
                  <div>
                    <div className="text-sm font-medium text-gray-600">Level</div>
                    <div className="text-2xl font-bold text-gray-900">{overallStats.level}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-600">XP</div>
                    <div className="text-lg font-bold text-purple-600">
                      {overallStats.xp}/{overallStats.nextLevelXP}
                    </div>
                  </div>
                </div>
                <ProgressBar 
                  value={levelProgress} 
                  className="mt-2 h-2"
                  color="bg-gradient-to-r from-purple-500 to-pink-500"
                />
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-2 border-b border-gray-200">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'achievements', label: 'Achievements', icon: Award },
              { id: 'goals', label: 'Goals', icon: Target },
              { id: 'analytics', label: 'Analytics', icon: PieChart },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedView(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
                  selectedView === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Overview Tab */}
        {selectedView === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Stories Completed"
                value={overallStats.storiesCompleted}
                icon={BookOpen}
                change={5}
                changeType="positive"
                description="Total stories written"
              />
              <StatCard
                title="Grammar Score"
                value={`${overallStats.averageGrammarScore}%`}
                icon={Edit}
                change={3}
                changeType="positive"
                description="Average grammar rating"
              />
              <StatCard
                title="Creativity Score"
                value={`${overallStats.averageCreativityScore}%`}
                icon={Sparkles}
                change={2}
                changeType="positive"
                description="Average creativity rating"
              />
              <StatCard
                title="Writing Streak"
                value={`${overallStats.writingStreak} days`}
                icon={Flame}
                change={1}
                changeType="positive"
                description="Current streak"
                action={
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetStreak}
                    className="text-orange-600 hover:text-orange-700"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Reset
                  </Button>
                }
              />
            </div>

            {/* Recent Achievements & Writing Calendar */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Recent Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <span>Recent Achievements</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {achievements.slice(0, 3).map((achievement) => (
                      <motion.div
                        key={achievement.id}
                        className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getRarityColor(achievement.rarity)}`}>
                          <span className="text-white text-lg">{achievement.icon}</span>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{achievement.name}</div>
                          <div className="text-sm text-gray-600">{achievement.description}</div>
                        </div>
                        <Badge variant={achievement.rarity === 'legendary' ? 'warning' : 'secondary'}>
                          {achievement.rarity}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4" onClick={() => setSelectedView('achievements')}>
                    View All Achievements
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              {/* Writing Calendar */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-green-500" />
                    <span>Writing Calendar</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                      <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                        {day}
                      </div>
                    ))}
                    {streakData.streakCalendar.slice(0, 35).map((day, index) => (
                      <motion.div
                        key={index}
                        className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium cursor-pointer ${
                          day.hasStory
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                        title={day.hasStory ? `Wrote a story on ${day.date}` : `No story on ${day.date}`}
                      >
                        {new Date(day.date).getDate()}
                      </motion.div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <span className="text-gray-600">Story written</span>
                    </div>
                    <div className="text-gray-500">
                      Longest streak: {streakData.longestStreak} days
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Active Goals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  <span>Active Goals</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {goals.slice(0, 4).map((goal) => {
                    const progress = (goal.current / goal.target) * 100;
                    const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    
                    return (
                      <motion.div
                        key={goal.id}
                        className="p-4 bg-gray-50 rounded-lg"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-gray-900">{goal.title}</div>
                          <Badge variant={progress >= 100 ? 'success' : daysLeft <= 3 ? 'destructive' : 'secondary'}>
                            {daysLeft}d left
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 mb-3">{goal.description}</div>
                        <ProgressBar value={progress} className="mb-2" />
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            {goal.current}/{goal.target}
                          </span>
                          <span className="text-purple-600 font-medium">🎁 {goal.reward}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                <Button variant="outline" className="w-full mt-4" onClick={() => setSelectedView('goals')}>
                  View All Goals
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Achievements Tab */}
        {selectedView === 'achievements' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span>All Achievements</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.map((achievement) => (
                    <motion.div
                      key={achievement.id}
                      className="p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-purple-300 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getRarityColor(achievement.rarity)}`}>
                          <span className="text-white text-xl">{achievement.icon}</span>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{achievement.name}</div>
                          <Badge variant={achievement.rarity === 'legendary' ? 'warning' : 'secondary'}>
                            {achievement.rarity}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">{achievement.description}</div>
                      <div className="text-xs text-gray-500">
                        Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Goals Tab */}
        {selectedView === 'goals' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  <span>All Goals</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {goals.map((goal) => {
                    const progress = (goal.current / goal.target) * 100;
                    const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    
                    return (
                      <motion.div
                        key={goal.id}
                        className="p-6 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors"
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="text-lg font-medium text-gray-900">{goal.title}</div>
                            <div className="text-gray-600">{goal.description}</div>
                          </div>
                          <div className="text-right">
                            <Badge variant={progress >= 100 ? 'success' : daysLeft <= 3 ? 'destructive' : 'secondary'}>
                              {daysLeft} days left
                            </Badge>
                            <div className="text-sm text-gray-500 mt-1">
                              Reward: {goal.reward}
                            </div>
                          </div>
                        </div>
                        <ProgressBar value={progress} className="mb-3" />
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Progress: {goal.current}/{goal.target}
                          </span>
                          <span className="text-sm font-medium text-blue-600">
                            {Math.round(progress)}% complete
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Analytics Tab */}
        {selectedView === 'analytics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weekly Progress Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-purple-500" />
                    <span>Weekly Progress</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {weeklyProgress.map((week, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-gray-900">{week.week}</div>
                          <div className="text-sm text-gray-600">{week.stories} stories</div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-gray-600">Grammar</div>
                            <div className="font-medium text-green-600">{week.grammar}%</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Creativity</div>
                            <div className="font-medium text-purple-600">{week.creativity}%</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Words</div>
                            <div className="font-medium text-blue-600">{week.words}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Writing Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="w-5 h-5 text-green-500" />
                    <span>Writing Statistics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">
                        {overallStats.totalWords.toLocaleString()}
                      </div>
                      <div className="text-gray-600">Total Words Written</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {Math.round(overallStats.totalWords / overallStats.storiesCompleted)}
                        </div>
                        <div className="text-sm text-green-700">Avg Words/Story</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {Math.round((overallStats.averageGrammarScore + overallStats.averageCreativityScore) / 2)}%
                        </div>
                        <div className="text-sm text-purple-700">Overall Score</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">Score Breakdown</div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Grammar</span>
                          <div className="flex items-center space-x-2">
                            <ProgressBar value={overallStats.averageGrammarScore} className="w-20 h-2" />
                            <span className="text-sm font-medium">{overallStats.averageGrammarScore}%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Creativity</span>
                          <div className="flex items-center space-x-2">
                            <ProgressBar value={overallStats.averageCreativityScore} className="w-20 h-2" color="bg-purple-500" />
                            <span className="text-sm font-medium">{overallStats.averageCreativityScore}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}