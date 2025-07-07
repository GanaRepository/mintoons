'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Eye,
  Flag,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  MessageCircle,
  BookOpen,
  User,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  MoreVertical,
  Shield,
  Ban,
} from 'lucide-react';

interface FlaggedContent {
  _id: string;
  type: 'story' | 'comment';
  content: {
    _id: string;
    title?: string; // For stories
    content: string;
    author: {
      _id: string;
      name: string;
      avatar?: string;
      role: string;
    };
    createdAt: string;
  };
  flags: Array<{
    _id: string;
    reporter: {
      _id: string;
      name: string;
    };
    reason: 'inappropriate' | 'spam' | 'harassment' | 'violence' | 'other';
    description: string;
    reportedAt: string;
  }>;
  status: 'pending' | 'approved' | 'rejected' | 'escalated';
  reviewedBy?: {
    _id: string;
    name: string;
  };
  reviewedAt?: string;
  moderationNotes?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  autoFlagged: boolean;
  aiConfidence?: number;
}

interface ModerationStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  escalated: number;
  autoFlagged: number;
  todayReviewed: number;
  averageReviewTime: number;
}

export default function ContentModerationClient() {
  const [flaggedContent, setFlaggedContent] = useState<FlaggedContent[]>([]);
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [severityFilter, setSeverityFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'severity'>(
    'newest'
  );
  const [selectedContent, setSelectedContent] = useState<FlaggedContent | null>(
    null
  );
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [reviewAction, setReviewAction] = useState<
    'approve' | 'reject' | 'escalate' | null
  >(null);
  const [moderationNotes, setModerationNotes] = useState('');

  useEffect(() => {
    fetchFlaggedContent();
    fetchModerationStats();
  }, [statusFilter, typeFilter, severityFilter, sortBy]);

  const fetchFlaggedContent = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        type: typeFilter,
        severity: severityFilter,
        sort: sortBy,
        search: searchTerm,
      });

      const response = await fetch(`/api/admin/moderation/content?${params}`);
      if (response.ok) {
        const data = await response.json();
        setFlaggedContent(data.content);
      }
    } catch (error) {
      console.error('Error fetching flagged content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchModerationStats = async () => {
    try {
      const response = await fetch('/api/admin/moderation/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching moderation stats:', error);
    }
  };

  const handleReview = async (
    contentId: string,
    action: 'approve' | 'reject' | 'escalate',
    notes?: string
  ) => {
    try {
      const response = await fetch('/api/admin/moderation/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId,
          action,
          notes,
        }),
      });

      if (response.ok) {
        // Refresh the list
        fetchFlaggedContent();
        fetchModerationStats();
        setShowDetailModal(false);
        setSelectedContent(null);
        setModerationNotes('');
        setReviewAction(null);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to review content');
      }
    } catch (error) {
      console.error('Error reviewing content:', error);
      alert('Failed to review content');
    }
  };

  const handleBulkAction = async (
    contentIds: string[],
    action: 'approve' | 'reject'
  ) => {
    if (
      !confirm(`Are you sure you want to ${action} ${contentIds.length} items?`)
    ) {
      return;
    }

    try {
      const response = await fetch('/api/admin/moderation/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentIds,
          action,
        }),
      });

      if (response.ok) {
        fetchFlaggedContent();
        fetchModerationStats();
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
      alert('Failed to perform bulk action');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'escalated':
        return <AlertTriangle className="w-4 h-4 text-purple-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getReasonIcon = (reason: string) => {
    switch (reason) {
      case 'inappropriate':
        return '🚫';
      case 'spam':
        return '📧';
      case 'harassment':
        return '😡';
      case 'violence':
        return '⚠️';
      default:
        return '❓';
    }
  };

  const filteredContent = flaggedContent.filter((item) => {
    if (searchTerm) {
      return (
        item.content.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.author.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (item.content.title &&
          item.content.title.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Content Moderation
          </h1>
          <p className="text-gray-600 mt-1">
            Review and moderate flagged content
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Shield className="w-4 h-4 inline mr-2" />
            Moderation Settings
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <div className="bg-white p-4 rounded-lg border text-center">
            <div className="text-2xl font-bold text-gray-900">
              {stats.total}
            </div>
            <div className="text-sm text-gray-600">Total Reports</div>
          </div>

          <div className="bg-white p-4 rounded-lg border text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pending}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>

          <div className="bg-white p-4 rounded-lg border text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.approved}
            </div>
            <div className="text-sm text-gray-600">Approved</div>
          </div>

          <div className="bg-white p-4 rounded-lg border text-center">
            <div className="text-2xl font-bold text-red-600">
              {stats.rejected}
            </div>
            <div className="text-sm text-gray-600">Rejected</div>
          </div>

          <div className="bg-white p-4 rounded-lg border text-center">
            <div className="text-2xl font-bold text-purple-600">
              {stats.escalated}
            </div>
            <div className="text-sm text-gray-600">Escalated</div>
          </div>

          <div className="bg-white p-4 rounded-lg border text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.autoFlagged}
            </div>
            <div className="text-sm text-gray-600">AI Flagged</div>
          </div>

          <div className="bg-white p-4 rounded-lg border text-center">
            <div className="text-2xl font-bold text-emerald-600">
              {stats.todayReviewed}
            </div>
            <div className="text-sm text-gray-600">Today</div>
          </div>

          <div className="bg-white p-4 rounded-lg border text-center">
            <div className="text-2xl font-bold text-orange-600">
              {stats.averageReviewTime}
            </div>
            <div className="text-sm text-gray-600">Avg Time (min)</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search content or authors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="escalated">Escalated</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Types</option>
            <option value="story">Stories</option>
            <option value="comment">Comments</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Severity</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="severity">By Severity</option>
          </select>
        </div>
      </div>

      {/* Content List */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">
            Flagged Content ({filteredContent.length})
          </h2>
        </div>

        <div className="divide-y">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : filteredContent.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Flag className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No flagged content</h3>
              <p>No content matches your current filters.</p>
            </div>
          ) : (
            filteredContent.map((item) => (
              <div key={item._id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center space-x-3 mb-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(item.severity)}`}
                      >
                        {item.severity.toUpperCase()}
                      </span>

                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {getStatusIcon(item.status)}
                        <span className="ml-1 capitalize">{item.status}</span>
                      </span>

                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                        {item.type === 'story' ? (
                          <BookOpen className="w-3 h-3 mr-1" />
                        ) : (
                          <MessageCircle className="w-3 h-3 mr-1" />
                        )}
                        {item.type}
                      </span>

                      {item.autoFlagged && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          🤖 AI Flagged
                          {item.aiConfidence && (
                            <span className="ml-1">
                              ({Math.round(item.aiConfidence * 100)}%)
                            </span>
                          )}
                        </span>
                      )}

                      <span className="text-xs text-gray-500">
                        {item.flags.length} report
                        {item.flags.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Content Preview */}
                    <div className="mb-3">
                      {item.content.title && (
                        <h3 className="font-medium text-gray-900 mb-1">
                          {item.content.title}
                        </h3>
                      )}
                      <p className="text-gray-700 line-clamp-3">
                        {item.content.content.length > 200
                          ? `${item.content.content.substring(0, 200)}...`
                          : item.content.content}
                      </p>
                    </div>

                    {/* Author Info */}
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200">
                        {item.content.author.avatar ? (
                          <img
                            src={item.content.author.avatar}
                            alt={item.content.author.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-500" />
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {item.content.author.name}
                      </span>
                      <span className="text-sm text-gray-500 capitalize">
                        ({item.content.author.role})
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(item.content.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Flags Summary */}
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Flag className="w-4 h-4 text-red-500" />
                        <span>Reported for:</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {[...new Set(item.flags.map((f) => f.reason))].map(
                          (reason) => (
                            <span
                              key={reason}
                              className="inline-flex items-center space-x-1"
                            >
                              <span>{getReasonIcon(reason)}</span>
                              <span className="capitalize">{reason}</span>
                            </span>
                          )
                        )}
                      </div>
                    </div>

                    {/* Review Info */}
                    {item.reviewedBy && (
                      <div className="mt-2 text-xs text-gray-500">
                        Reviewed by {item.reviewedBy.name} on{' '}
                        {new Date(item.reviewedAt!).toLocaleDateString()}
                        {item.moderationNotes && (
                          <div className="mt-1 text-gray-700">
                            Note: {item.moderationNotes}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedContent(item);
                        setShowDetailModal(true);
                      }}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {item.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleReview(item._id, 'approve')}
                          className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg"
                          title="Approve"
                        >
                          <ThumbsUp className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleReview(item._id, 'reject')}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                          title="Reject"
                        >
                          <ThumbsDown className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleReview(item._id, 'escalate')}
                          className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg"
                          title="Escalate"
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Content Review</h3>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedContent(null);
                    setModerationNotes('');
                    setReviewAction(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Content Details */}
                <div>
                  <h4 className="font-medium mb-3">Content Details</h4>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(selectedContent.severity)}`}
                      >
                        {selectedContent.severity.toUpperCase()}
                      </span>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                        {selectedContent.type}
                      </span>
                    </div>

                    {selectedContent.content.title && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Title
                        </label>
                        <p className="text-gray-900">
                          {selectedContent.content.title}
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Content
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg max-h-40 overflow-y-auto">
                        <p className="text-gray-900 whitespace-pre-wrap">
                          {selectedContent.content.content}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Author
                      </label>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                          {selectedContent.content.author.avatar ? (
                            <img
                              src={selectedContent.content.author.avatar}
                              alt={selectedContent.content.author.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <User className="w-4 h-4 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {selectedContent.content.author.name}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">
                            {selectedContent.content.author.role}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reports */}
                <div>
                  <h4 className="font-medium mb-3">
                    Reports ({selectedContent.flags.length})
                  </h4>

                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {selectedContent.flags.map((flag) => (
                      <div key={flag._id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">
                            {flag.reporter.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(flag.reportedAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2 mb-2">
                          <span>{getReasonIcon(flag.reason)}</span>
                          <span className="text-sm capitalize font-medium">
                            {flag.reason}
                          </span>
                        </div>

                        <p className="text-sm text-gray-700">
                          {flag.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Review Actions */}
              {selectedContent.status === 'pending' && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-medium mb-3">Moderation Action</h4>

                  <div className="space-y-4">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setReviewAction('approve')}
                        className={`px-4 py-2 rounded-lg border ${
                          reviewAction === 'approve'
                            ? 'bg-green-50 border-green-500 text-green-700'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <ThumbsUp className="w-4 h-4 inline mr-2" />
                        Approve
                      </button>

                      <button
                        onClick={() => setReviewAction('reject')}
                        className={`px-4 py-2 rounded-lg border ${
                          reviewAction === 'reject'
                            ? 'bg-red-50 border-red-500 text-red-700'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <ThumbsDown className="w-4 h-4 inline mr-2" />
                        Reject
                      </button>

                      <button
                        onClick={() => setReviewAction('escalate')}
                        className={`px-4 py-2 rounded-lg border ${
                          reviewAction === 'escalate'
                            ? 'bg-purple-50 border-purple-500 text-purple-700'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <AlertTriangle className="w-4 h-4 inline mr-2" />
                        Escalate
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Moderation Notes (Optional)
                      </label>
                      <textarea
                        value={moderationNotes}
                        onChange={(e) => setModerationNotes(e.target.value)}
                        placeholder="Add notes about your decision..."
                        className="w-full p-3 border rounded-lg resize-none"
                        rows={3}
                      />
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          if (reviewAction) {
                            handleReview(
                              selectedContent._id,
                              reviewAction,
                              moderationNotes || undefined
                            );
                          }
                        }}
                        disabled={!reviewAction}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        Submit Review
                      </button>

                      <button
                        onClick={() => {
                          setShowDetailModal(false);
                          setSelectedContent(null);
                          setModerationNotes('');
                          setReviewAction(null);
                        }}
                        className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
