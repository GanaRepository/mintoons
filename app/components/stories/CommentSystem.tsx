'use client';

import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, Heart, Reply, MoreVertical, Edit, Trash, Flag } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface Comment {
  _id: string;
  author: {
    _id: string;
    name: string;
    avatar?: string;
    role: 'student' | 'mentor' | 'admin';
  };
  content: string;
  createdAt: string;
  updatedAt?: string;
  likes: string[];
  replies: Comment[];
  isEdited: boolean;
  isHighlighted?: boolean;
  mentorFeedback?: {
    type: 'praise' | 'suggestion' | 'question';
    category: 'plot' | 'character' | 'writing_style' | 'grammar';
  };
}

interface CommentSystemProps {
  storyId: string;
  isAuthor?: boolean;
  allowComments?: boolean;
  mentorMode?: boolean;
}

export default function CommentSystem({
  storyId,
  isAuthor = false,
  allowComments = true,
  mentorMode = false
}: CommentSystemProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'praise' | 'suggestion' | 'question'>('praise');
  const [feedbackCategory, setFeedbackCategory] = useState<'plot' | 'character' | 'writing_style' | 'grammar'>('plot');
  
  useEffect(() => {
    fetchComments();
  }, [storyId]);
  
  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/stories/${storyId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };
  
  const submitComment = async () => {
    if (!newComment.trim() || !session) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/stories/${storyId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment,
          mentorFeedback: mentorMode ? {
            type: feedbackType,
            category: feedbackCategory
          } : undefined
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setComments(prev => [data.comment, ...prev]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const submitReply = async (parentId: string) => {
    if (!replyContent.trim() || !session) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/stories/${storyId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: replyContent,
          parentId,
          mentorFeedback: mentorMode ? {
            type: feedbackType,
            category: feedbackCategory
          } : undefined
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setComments(prev => prev.map(comment => 
          comment._id === parentId 
            ? { ...comment, replies: [data.comment, ...comment.replies] }
            : comment
        ));
        setReplyContent('');
        setReplyingTo(null);
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const editComment = async (commentId: string) => {
    if (!editContent.trim()) return;
    
    try {
      const response = await fetch(`/api/stories/${storyId}/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent })
      });
      
      if (response.ok) {
        const data = await response.json();
        setComments(prev => prev.map(comment => 
          comment._id === commentId ? data.comment : comment
        ));
        setEditingComment(null);
        setEditContent('');
      }
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };
  
  const deleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      const response = await fetch(`/api/stories/${storyId}/comments/${commentId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setComments(prev => prev.filter(comment => comment._id !== commentId));
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };
  
  const toggleLike = async (commentId: string) => {
    if (!session) return;
    
    try {
      const response = await fetch(`/api/stories/${storyId}/comments/${commentId}/like`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        setComments(prev => prev.map(comment => 
          comment._id === commentId 
            ? { ...comment, likes: data.likes }
            : comment
        ));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };
  
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'mentor': return 'text-purple-600';
      case 'admin': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };
  
  const getFeedbackIcon = (type: string) => {
    switch (type) {
      case 'praise': return '👏';
      case 'suggestion': return '💡';
      case 'question': return '❓';
      default: return '';
    }
  };

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => {
    const isOwner = session?.user?.id === comment.author._id;
    const canEdit = isOwner || session?.user?.role === 'admin';
    
    return (
      <div className={`${isReply ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''} mb-4`}>
        <div className={`p-4 rounded-lg border ${
          comment.isHighlighted ? 'bg-yellow-50 border-yellow-200' : 'bg-white'
        } ${comment.mentorFeedback ? 'border-l-4 border-l-purple-500' : ''}`}>
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                {comment.author.avatar ? (
                  <img 
                    src={comment.author.avatar} 
                    alt={comment.author.name}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-600">
                    {comment.author.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              
              <div>
                <div className="flex items-center space-x-2">
                  <span className={`font-medium ${getRoleColor(comment.author.role)}`}>
                    {comment.author.name}
                  </span>
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded-full capitalize">
                    {comment.author.role}
                  </span>
                  {comment.mentorFeedback && (
                    <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                      {getFeedbackIcon(comment.mentorFeedback.type)} {comment.mentorFeedback.type}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {formatDate(comment.createdAt)}
                  {comment.isEdited && <span className="ml-1">(edited)</span>}
                </div>
              </div>
            </div>
            
            {canEdit && (
              <div className="relative">
                <button className="p-1 hover:bg-gray-100 rounded">
                  <MoreVertical className="w-4 h-4" />
                </button>
                {/* Dropdown menu would go here */}
              </div>
            )}
          </div>
          
          {/* Content */}
          {editingComment === comment._id ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 border rounded resize-none"
                rows={3}
              />
              <div className="flex space-x-2">
                <button
                  onClick={() => editComment(comment._id)}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingComment(null);
                    setEditContent('');
                  }}
                  className="px-3 py-1 border text-sm rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700 mb-3">{comment.content}</p>
          )}
          
          {/* Actions */}
          <div className="flex items-center space-x-4 text-sm">
            <button
              onClick={() => toggleLike(comment._id)}
              className={`flex items-center space-x-1 hover:text-red-500 ${
                comment.likes.includes(session?.user?.id || '') ? 'text-red-500' : 'text-gray-500'
              }`}
            >
              <Heart className="w-4 h-4" />
              <span>{comment.likes.length}</span>
            </button>
            
            {!isReply && (
              <button
                onClick={() => setReplyingTo(comment._id)}
                className="flex items-center space-x-1 text-gray-500 hover:text-blue-500"
              >
                <Reply className="w-4 h-4" />
                <span>Reply</span>
              </button>
            )}
            
            {canEdit && (
              <>
                <button
                  onClick={() => {
                    setEditingComment(comment._id);
                    setEditContent(comment.content);
                  }}
                  className="flex items-center space-x-1 text-gray-500 hover:text-blue-500"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                
                <button
                  onClick={() => deleteComment(comment._id)}
                  className="flex items-center space-x-1 text-gray-500 hover:text-red-500"
                >
                  <Trash className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </>
            )}
            
            <button className="flex items-center space-x-1 text-gray-500 hover:text-yellow-500">
              <Flag className="w-4 h-4" />
              <span>Report</span>
            </button>
          </div>
          
          {/* Reply Form */}
          {replyingTo === comment._id && (
            <div className="mt-4 p-3 bg-gray-50 rounded">
              {mentorMode && (
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <select
                    value={feedbackType}
                    onChange={(e) => setFeedbackType(e.target.value as any)}
                    className="p-1 border rounded text-sm"
                  >
                    <option value="praise">Praise</option>
                    <option value="suggestion">Suggestion</option>
                    <option value="question">Question</option>
                  </select>
                  <select
                    value={feedbackCategory}
                    onChange={(e) => setFeedbackCategory(e.target.value as any)}
                    className="p-1 border rounded text-sm"
                  >
                    <option value="plot">Plot</option>
                    <option value="character">Character</option>
                    <option value="writing_style">Writing Style</option>
                    <option value="grammar">Grammar</option>
                  </select>
                </div>
              )}
              
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="w-full p-2 border rounded resize-none"
                rows={2}
              />
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={() => submitReply(comment._id)}
                  disabled={!replyContent.trim() || isLoading}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  Reply
                </button>
                <button
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyContent('');
                  }}
                  className="px-3 py-1 border text-sm rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            {comment.replies.map((reply) => (
              <CommentItem key={reply._id} comment={reply} isReply={true} />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (!allowComments) {
    return (
      <div className="text-center py-8 text-gray-500">
        <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>Comments are disabled for this story.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      {session && (
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="font-semibold mb-3 flex items-center">
            <MessageCircle className="w-5 h-5 mr-2" />
            {mentorMode ? 'Provide Feedback' : 'Add a Comment'}
          </h3>
          
          {mentorMode && (
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-sm font-medium mb-1">Feedback Type</label>
                <select
                  value={feedbackType}
                  onChange={(e) => setFeedbackType(e.target.value as any)}
                  className="w-full p-2 border rounded"
                >
                  <option value="praise">👏 Praise</option>
                  <option value="suggestion">💡 Suggestion</option>
                  <option value="question">❓ Question</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={feedbackCategory}
                  onChange={(e) => setFeedbackCategory(e.target.value as any)}
                  className="w-full p-2 border rounded"
                >
                  <option value="plot">Plot Development</option>
                  <option value="character">Character Development</option>
                  <option value="writing_style">Writing Style</option>
                  <option value="grammar">Grammar & Structure</option>
                </select>
              </div>
            </div>
          )}
          
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={mentorMode ? "Provide constructive feedback..." : "Share your thoughts..."}
            className="w-full p-3 border rounded-lg resize-none"
            rows={3}
          />
          
          <div className="flex justify-between items-center mt-3">
            <div className="text-sm text-gray-500">
              {newComment.length}/500 characters
            </div>
            
            <button
              onClick={submitComment}
              disabled={!newComment.trim() || isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{mentorMode ? 'Send Feedback' : 'Comment'}</span>
            </button>
          </div>
        </div>
      )}
      
      {/* Comments List */}
      <div>
        <h3 className="font-semibold mb-4">
          Comments ({comments.length})
        </h3>
        
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem key={comment._id} comment={comment} />
          ))
        )}
      </div>
    </div>
  );
}