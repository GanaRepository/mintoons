'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, BookOpen, MessageCircle, TrendingUp, AlertTriangle, 
  Shield, Activity, Database, Server, Globe, BarChart3,
  Calendar, Clock, Eye, Heart, Award, Settings
} from 'lucide-react';

interface AdminStats {
  overview: {
    totalUsers: number;
    totalStories: number;
    totalComments: number;
    activeUsers: number;
    publishedStories: number;
    avgEngagement: number;
  };
  users: {
    total: number;
    new: number;
    active: number;
    byRole: Array<{ role: string; count: number }>;
    registrationTrend: Array<{ date: string; count: number }>;
  };
  stories: {
    total: number;
    new: number;
    published: number;
    drafts: number;
    completionRate: number;
    byGenre: Array<{ genre: string; count: number }>;
    creationTrend: Array<{ date: string; count: number }>;
  };
  engagement: {
    totalComments: number;
    totalLikes: number;
    commentToStoryRatio: number;
    mostEngagedStories: Array<{
      title: string;
      author: { name: string };
      engagementScore: number;
    }>;
  };
  performance: {
    systemHealth: {
      uptime: number;
      errorRate: number;
      averageLoadTime: number;
    };
    sessionMetrics: {
      averageSessionDuration: number;
      bounceRate: number;
      pagesPerSession: number;
    };
  };
  growth: {
    users: {
      current: number;
      growthRate: number;
    };
    stories: {
      current: number;
      growthRate: number;
    };
  };
}

export default function AdminDashboardClient() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  const [alerts, setAlerts] = useState<Array<{
    id: string;
    type: 'warning' | 'error' | 'info';
    message: string;
    timestamp: string;
  }>>([]);

  useEffect(() => {
    fetchAdminStats();
    fetchSystemAlerts();
  }, [timeframe]);

  const fetchAdminStats = async () => {
    try {
      const response = await fetch(`/api/admin/analytics?timeframe=${timeframe}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSystemAlerts = async () => {
    try {
      const response = await fetch('/api/admin/alerts');
      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts || []);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const getGrowthColor = (rate: number) => {
    if (rate > 0) return 'text-green-600';
    if (rate < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getGrowthIcon = (rate: number) => {
    if (rate > 0) return '↗️';
    if (rate < 0) return '↘️';
    return '→';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-12 h-12 mx-auto text-red-500 mb-4" />
        <p className="text-gray-600">Failed to load admin dashboard. Please try refreshing.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Platform overview and system management</p>
        </div>

        <div className="mt-4 md:mt-0 flex items-center space-x-4">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Settings className="w-4 h-4 inline mr-2" />
            Settings
          </button>
        </div>
      </div>

      {/* System Alerts */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h2 className="font-semibold flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
              System Alerts ({alerts.length})
            </h2>
          </div>
          <div className="divide-y">
            {alerts.slice(0, 3).map((alert) => (
              <div key={alert.id} className="p-4 flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  alert.type === 'error' ? 'bg-red-500' :
                  alert.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{alert.message}</p>
                  <p className="text-xs text-gray-500">{new Date(alert.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.overview.totalUsers.toLocaleString()}</p>
              <p className={`text-xs ${getGrowthColor(stats.growth.users.growthRate)}`}>
                {getGrowthIcon(stats.growth.users.growthRate)} {Math.abs(stats.growth.users.growthRate).toFixed(1)}%
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Stories</p>
              <p className="text-2xl font-bold text-gray-900">{stats.overview.totalStories.toLocaleString()}</p>
              <p className={`text-xs ${getGrowthColor(stats.growth.stories.growthRate)}`}>
                {getGrowthIcon(stats.growth.stories.growthRate)} {Math.abs(stats.growth.stories.growthRate).toFixed(1)}%
              </p>
            </div>
            <BookOpen className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.overview.activeUsers.toLocaleString()}</p>
              <p className="text-xs text-gray-500">
                {((stats.overview.activeUsers / stats.overview.totalUsers) * 100).toFixed(1)}% of total
              </p>
            </div>
            <Activity className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Published Stories</p>
              <p className="text-2xl font-bold text-gray-900">{stats.overview.publishedStories.toLocaleString()}</p>
              <p className="text-xs text-gray-500">
                {((stats.overview.publishedStories / stats.overview.totalStories) * 100).toFixed(1)}% completion rate
              </p>
            </div>
            <Globe className="w-8 h-8 text-indigo-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Comments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.overview.totalComments.toLocaleString()}</p>
              <p className="text-xs text-gray-500">
                {stats.engagement.commentToStoryRatio.toFixed(1)} per story
              </p>
            </div>
            <MessageCircle className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Engagement</p>
              <p className="text-2xl font-bold text-gray-900">{stats.overview.avgEngagement.toFixed(1)}</p>
              <p className="text-xs text-green-600">+2.3% from last period</p>
            </div>
            <TrendingUp className="w-8 h-8 text-pink-500" />
          </div>
        </div>
      </div>

      {/* Charts and Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Analytics */}
        <div className="bg-white rounded-lg border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">User Analytics</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {/* User Distribution by Role */}
              <div>
                <h4 className="font-medium mb-3">User Distribution by Role</h4>
                <div className="space-y-2">
                  {stats.users.byRole.map((role) => (
                    <div key={role.role} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 capitalize">{role.role}s</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${(role.count / stats.users.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8">{role.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Growth */}
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Growth Metrics</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{stats.users.new}</p>
                    <p className="text-xs text-gray-600">New Users</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{stats.users.active}</p>
                    <p className="text-xs text-gray-600">Active Users</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Story Analytics */}
        <div className="bg-white rounded-lg border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">Story Analytics</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {/* Stories by Genre */}
              <div>
                <h4 className="font-medium mb-3">Popular Genres</h4>
                <div className="space-y-2">
                  {stats.stories.byGenre.slice(0, 5).map((genre) => (
                    <div key={genre.genre} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 capitalize">{genre.genre}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${(genre.count / stats.stories.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8">{genre.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Story Status */}
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Story Status</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{stats.stories.published}</p>
                    <p className="text-xs text-gray-600">Published</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600">{stats.stories.drafts}</p>
                    <p className="text-xs text-gray-600">Drafts</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Performance */}
        <div className="bg-white rounded-lg border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">System Performance</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.performance.systemHealth.uptime}%
                  </div>
                  <div className="text-xs text-gray-600">Uptime</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.performance.systemHealth.averageLoadTime}ms
                  </div>
                  <div className="text-xs text-gray-600">Load Time</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {stats.performance.systemHealth.errorRate}%
                  </div>
                  <div className="text-xs text-gray-600">Error Rate</div>
                </div>
              </div>

              {/* Session Metrics */}
              <div className="pt-4 border-t space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg Session Duration</span>
                  <span className="font-medium">{stats.performance.sessionMetrics.averageSessionDuration} min</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Bounce Rate</span>
                  <span className="font-medium">{stats.performance.sessionMetrics.bounceRate}%</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pages per Session</span>
                  <span className="font-medium">{stats.performance.sessionMetrics.pagesPerSession}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Engaged Stories */}
        <div className="bg-white rounded-lg border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">Most Engaged Stories</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {stats.engagement.mostEngagedStories.slice(0, 5).map((story, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-yellow-600">{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{story.title}</p>
                    <p className="text-xs text-gray-500">by {story.author.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-purple-600">{story.engagementScore}</p>
                    <p className="text-xs text-gray-500">score</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <button className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <Users className="w-8 h-8 text-blue-500 mb-2" />
            <span className="text-sm font-medium">Manage Users</span>
          </button>
          
          <button className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <BookOpen className="w-8 h-8 text-green-500 mb-2" />
            <span className="text-sm font-medium">Content Review</span>
          </button>
          
          <button className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <Shield className="w-8 h-8 text-red-500 mb-2" />
            <span className="text-sm font-medium">Moderation</span>
          </button>
          
          <button className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <BarChart3 className="w-8 h-8 text-purple-500 mb-2" />
            <span className="text-sm font-medium">Analytics</span>
          </button>
          
          <button className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <Database className="w-8 h-8 text-orange-500 mb-2" />
            <span className="text-sm font-medium">Database</span>
          </button>
          
          <button className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <Settings className="w-8 h-8 text-gray-500 mb-2" />
            <span className="text-sm font-medium">Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}