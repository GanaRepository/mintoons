'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Users, BookOpen, MessageCircle, Star, TrendingUp, Clock, 
  Award, Eye, Heart, Calendar, Filter, Search, MoreVertical,
  ChevronRight, Bell, CheckCircle, AlertCircle
} from 'lucide-react';

interface MentorStats {
  totalStudents: number;
  activeStudents: number;
  storiesReviewed: number;
  feedbackGiven: number;
  averageRating: number;
  thisWeekActivity: {
    storiesReviewed: number;
    feedbackGiven: number;
    studentsHelped: number;
  };
}

interface StudentStory {
  _id: string;
  title: string;
  author: {
    _id: string;
    name: string;
    avatar?: string;
    ageGroup: string;
  };
  genre: string;
  status: 'draft' | 'published' | 'needs_review';
  createdAt: string;
  updatedAt: string;
  wordCount: number;
  feedbackRequested: boolean;
  lastFeedback?: {
    date: string;
    type: 'praise' | 'suggestion' | 'question';
  };
  priority: 'high' | 'medium' | 'low';
}

interface RecentActivity {
  _id: string;
  type: 'story_submitted' | 'feedback_given' | 'story_published' | 'achievement_earned';
  student: {
    name: string;
    avatar?: string;
  };
  story?: {
    title: string;
  };
  timestamp: string;
  details: string;
}

export default function MentorDashboardClient() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<MentorStats | null>(null);
  const [pendingStories, setPendingStories] = useState<StudentStory[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'urgent' | 'new' | 'reviewed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMentorData();
  }, []);

  const fetchMentorData = async () => {
    try {
      const [statsRes, storiesRes, activityRes] = await Promise.all([
        fetch('/api/mentor/stats'),
        fetch('/api/mentor/pending-stories'),
        fetch('/api/mentor/activity')
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }

      if (storiesRes.ok) {
        const storiesData = await storiesRes.json();
        setPendingStories(storiesData.stories);
      }

      if (activityRes.ok) {
        const activityData = await activityRes.json();
        setRecentActivity(activityData.activities);
      }
    } catch (error) {
      console.error('Error fetching mentor data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStories = pendingStories.filter(story => {
    if (searchTerm && !story.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !story.author.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    switch (filter) {
      case 'urgent':
        return story.priority === 'high' || story.feedbackRequested;
      case 'new':
        return !story.lastFeedback;
      case 'reviewed':
        return !!story.lastFeedback;
      default:
        return true;
    }
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'needs_review': return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'published': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'story_submitted': return <BookOpen className="w-5 h-5 text-blue-500" />;
      case 'feedback_given': return <MessageCircle className="w-5 h-5 text-green-500" />;
      case 'story_published': return <Star className="w-5 h-5 text-yellow-500" />;
      case 'achievement_earned': return <Award className="w-5 h-5 text-purple-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {session?.user?.name}! 👨‍🏫
        </h1>
        <p className="opacity-90">
          You have {pendingStories.length} stories waiting for your guidance today.
        </p>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Students</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeStudents}</p>
                <p className="text-xs text-gray-500">of {stats.totalStudents} total</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Stories Reviewed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.storiesReviewed}</p>
                <p className="text-xs text-green-600">+{stats.thisWeekActivity.storiesReviewed} this week</p>
              </div>
              <BookOpen className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Feedback Given</p>
                <p className="text-2xl font-bold text-gray-900">{stats.feedbackGiven}</p>
                <p className="text-xs text-purple-600">+{stats.thisWeekActivity.feedbackGiven} this week</p>
              </div>
              <MessageCircle className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
                <div className="flex items-center mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-3 h-3 ${
                        i < Math.floor(stats.averageRating) 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }`} 
                    />
                  ))}
                </div>
              </div>
              <Award className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Stories */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Stories Awaiting Review</h2>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  {filteredStories.length}
                </span>
              </div>

              {/* Filters and Search */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search stories or students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as any)}
                    className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Stories</option>
                    <option value="urgent">Urgent</option>
                    <option value="new">New Submissions</option>
                    <option value="reviewed">Previously Reviewed</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="divide-y">
              {filteredStories.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No stories match your current filter.</p>
                </div>
              ) : (
                filteredStories.map((story) => (
                  <div 
                    key={story._id} 
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => window.open(`/dashboard/story/${story._id}`, '_blank')}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-medium text-gray-900 truncate">{story.title}</h3>
                          {story.feedbackRequested && (
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                              Feedback Requested
                            </span>
                          )}
                          <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(story.priority)}`}>
                            {story.priority}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center space-x-1">
                            {story.author.avatar ? (
                              <img 
                                src={story.author.avatar} 
                                alt={story.author.name}
                                className="w-5 h-5 rounded-full"
                              />
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-gray-300"></div>
                            )}
                            <span>{story.author.name}</span>
                          </div>
                          
                          <span className="text-gray-400">•</span>
                          <span className="capitalize">{story.genre}</span>
                          <span className="text-gray-400">•</span>
                          <span>{story.wordCount} words</span>
                          <span className="text-gray-400">•</span>
                          <span>Age {story.author.ageGroup}</span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(story.status)}
                            <span className="capitalize">{story.status.replace('_', ' ')}</span>
                          </div>
                          
                          <span>Updated {new Date(story.updatedAt).toLocaleDateString()}</span>
                          
                          {story.lastFeedback && (
                            <span className="text-green-600">
                              Last feedback: {new Date(story.lastFeedback.date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No recent activity</p>
                </div>
              ) : (
                recentActivity.map((activity) => (
                  <div key={activity._id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{activity.student.name}</span>{' '}
                        {activity.details}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <Users className="w-6 h-6 text-blue-500" />
            <div className="text-left">
              <p className="font-medium">View All Students</p>
              <p className="text-sm text-gray-600">Manage your mentoring relationships</p>
            </div>
          </button>
          
          <button className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <MessageCircle className="w-6 h-6 text-green-500" />
            <div className="text-left">
              <p className="font-medium">Feedback Templates</p>
              <p className="text-sm text-gray-600">Access pre-written feedback snippets</p>
            </div>
          </button>
          
          <button className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <TrendingUp className="w-6 h-6 text-purple-500" />
            <div className="text-left">
              <p className="font-medium">Progress Reports</p>
              <p className="text-sm text-gray-600">Generate student progress summaries</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}