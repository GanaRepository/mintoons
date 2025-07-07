'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  Heart, MessageCircle, Share2, BookmarkPlus, Edit, Trash2, 
  Download, Eye, Clock, User, Calendar, Tag, Globe, Lock, 
  Users, Play, Pause, Volume2, VolumeX 
} from 'lucide-react';
import CommentSystem from '../../../components/stories/CommentSystem';

interface Story {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    name: string;
    avatar?: string;
    role: string;
  };
  genre: string;
  targetAge: string;
  tags: string[];
  visibility: 'public' | 'private' | 'mentors_only';
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  likes: string[];
  commentsCount: number;
  viewsCount: number;
  readingTime: number;
  wordCount: number;
  allowComments: boolean;
  coverImage?: string;
}

interface StoryViewClientProps {
  storyId: string;
}

export default function StoryViewClient({ storyId }: StoryViewClientProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [story, setStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [fontSize, setFontSize] = useState(16);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);

  useEffect(() => {
    fetchStory();
    trackView();
    
    // Initialize speech synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSpeechSynthesis(window.speechSynthesis);
    }
  }, [storyId]);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const maxHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min((scrolled / maxHeight) * 100, 100);
      setReadingProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchStory = async () => {
    try {
      const response = await fetch(`/api/stories/${storyId}`);
      if (response.ok) {
        const data = await response.json();
        setStory(data.story);
        setIsLiked(data.story.likes.includes(session?.user?.id));
        setLikesCount(data.story.likes.length);
      } else if (response.status === 404) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error fetching story:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const trackView = async () => {
    try {
      await fetch(`/api/stories/${storyId}/view`, { method: 'POST' });
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/stories/${storyId}/like`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.liked);
        setLikesCount(data.likesCount);
      }
    } catch (error) {
      console.error('Error liking story:', error);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: story?.title,
      text: `Check out this amazing story: ${story?.title}`,
      url: window.location.href
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error('Error sharing:', error);
        fallbackShare();
      }
    } else {
      fallbackShare();
    }
  };

  const fallbackShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Story link copied to clipboard!');
  };

  const handleExport = async (format: 'pdf' | 'word') => {
    try {
      const response = await fetch(`/api/export/${format}/${storyId}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${story?.title}.${format === 'word' ? 'docx' : 'pdf'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting story:', error);
      alert('Failed to export story. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this story? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/stories/${storyId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        router.push('/dashboard/my-stories');
      }
    } catch (error) {
      console.error('Error deleting story:', error);
      alert('Failed to delete story. Please try again.');
    }
  };

  const toggleTextToSpeech = () => {
    if (!speechSynthesis || !story) return;

    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(story.content);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public': return <Globe className="w-4 h-4" />;
      case 'private': return <Lock className="w-4 h-4" />;
      case 'mentors_only': return <Users className="w-4 h-4" />;
      default: return <Lock className="w-4 h-4" />;
    }
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'public': return 'text-green-600 bg-green-100';
      case 'private': return 'text-gray-600 bg-gray-100';
      case 'mentors_only': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const isAuthor = session?.user?.id === story?.author._id;
  const canEdit = isAuthor || session?.user?.role === 'admin';

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Story Not Found</h2>
        <p className="text-gray-600 mb-4">The story you're looking for doesn't exist or has been removed.</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div 
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Story Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{story.title}</h1>
            
            {/* Author Info */}
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                  {story.author.avatar ? (
                    <img 
                      src={story.author.avatar} 
                      alt={story.author.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{story.author.name}</p>
                  <p className="text-sm text-gray-600 capitalize">{story.author.role}</p>
                </div>
              </div>
              
              <div className="text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(story.publishedAt || story.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Story Meta */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 capitalize">
                {story.genre}
              </span>
              
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                Ages {story.targetAge}
              </span>
              
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getVisibilityColor(story.visibility)}`}>
                {getVisibilityIcon(story.visibility)}
                <span className="ml-1 capitalize">{story.visibility.replace('_', ' ')}</span>
              </span>

              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{story.readingTime} min read</span>
              </div>

              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <Eye className="w-4 h-4" />
                <span>{story.viewsCount} views</span>
              </div>
            </div>

            {/* Tags */}
            {story.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {story.tags.map((tag) => (
                  <span 
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {canEdit && (
              <>
                <button
                  onClick={() => router.push(`/dashboard/edit-story/${storyId}`)}
                  className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                
                <button
                  onClick={handleDelete}
                  className="flex items-center space-x-1 px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </>
            )}
            
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleExport('pdf')}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                title="Export as PDF"
              >
                <Download className="w-4 h-4" />
              </button>
              
              <button
                onClick={handleShare}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                title="Share story"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Engagement Bar */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isLiked 
                  ? 'bg-red-100 text-red-600' 
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likesCount}</span>
            </button>

            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{story.commentsCount}</span>
            </button>

            <button
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <BookmarkPlus className="w-4 h-4" />
              <span>Save</span>
            </button>
          </div>

          {/* Reading Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleTextToSpeech}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                isSpeaking 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {isSpeaking ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>Listen</span>
                </>
              )}
            </button>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Text Size:</span>
              <button
                onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                className="px-2 py-1 text-sm border rounded hover:bg-gray-50"
              >
                A-
              </button>
              <button
                onClick={() => setFontSize(Math.min(24, fontSize + 2))}
                className="px-2 py-1 text-sm border rounded hover:bg-gray-50"
              >
                A+
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Story Content */}
      <div className="bg-white rounded-lg shadow-sm border p-8 mb-6">
        <div 
          className="prose prose-lg max-w-none"
          style={{ 
            fontSize: `${fontSize}px`,
            lineHeight: '1.8',
            fontFamily: 'Georgia, serif'
          }}
        >
          {story.content.split('\n\n').map((paragraph, index) => (
            <p key={index} className="mb-6 text-gray-700">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Story Footer */}
        <div className="mt-8 pt-6 border-t text-center text-gray-500">
          <p className="text-sm">
            Written by <span className="font-medium text-gray-700">{story.author.name}</span>
          </p>
          <p className="text-xs mt-1">
            {story.wordCount} words • Published {new Date(story.publishedAt || story.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Comments Section */}
      {story.allowComments && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            <CommentSystem 
              storyId={storyId}
              isAuthor={isAuthor}
              allowComments={story.allowComments}
              mentorMode={session?.user?.role === 'mentor'}
            />
          </div>
        </div>
      )}

      {/* Related Stories */}
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">More from {story.author.name}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* This would be populated with related stories */}
          <div className="p-4 border rounded-lg hover:bg-gray-50">
            <p className="text-gray-500 text-center py-8">
              Loading related stories...
            </p>
          </div>
        </div>
      </div>

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <button
          onClick={handleLike}
          className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center ${
            isLiked 
              ? 'bg-red-600 text-white' 
              : 'bg-white text-gray-600 border'
          }`}
        >
          <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
        </button>
      </div>
    </div>
  );
}