'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Star,
  Eye,
  MessageSquare,
  Calendar,
  User,
  Heart,
  Download,
  Share2,
  MoreVertical,
  Edit,
  Trash2
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';

interface StoryCardProps {
  story: {
    _id: string;
    title: string;
    content: string;
    wordCount: number;
    status: 'draft' | 'published' | 'archived';
    elements: {
      genre: string;
      setting: string;
      character: string;
      mood: string;
      conflict: string;
      theme: string;
    };
    views: number;
    likes: number;
    commentCount: number;
    aiAssessment?: {
      grammarScore: number;
      creativityScore: number;
      overallScore: number;
    };
    userId: {
      _id: string;
      name: string;
      age?: number;
      role: string;
    };
    createdAt: string;
    updatedAt: string;
    isLiked?: boolean;
  };
  showActions?: boolean;
  onLike?: (storyId: string) => void;
  onShare?: (storyId: string) => void;
  onExport?: (storyId: string, format: 'pdf' | 'word') => void;
  onDelete?: (storyId: string) => void;
  variant?: 'default' | 'compact' | 'featured';
  className?: string;
}

export default function StoryCard({
  story,
  showActions = false,
  onLike,
  onShare,
  onExport,
  onDelete,
  variant = 'default',
  className = ''
}: StoryCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLiking || !onLike) return;
    
    setIsLiking(true);
    try {
      await onLike(story._id);
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onShare) {
      onShare(story._id);
    } else {
      // Default share behavior
      if (navigator.share) {
        try {
          await navigator.share({
            title: story.title,
            text: `Check out this amazing story: "${story.title}" by ${story.userId.name}`,
            url: `${window.location.origin}/story/${story._id}`
          });
        } catch (error) {
          // User cancelled sharing
        }
      } else {
        // Fallback to clipboard
        const url = `${window.location.origin}/story/${story._id}`;
        await navigator.clipboard.writeText(url);
        // You might want to show a toast here
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      ...(new Date(dateString).getFullYear() !== new Date().getFullYear() && { year: 'numeric' })
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'archived':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getGenreEmoji = (genre: string) => {
    const emojiMap: { [key: string]: string } = {
      adventure: '🗺️',
      fantasy: '🏰',
      mystery: '🔍',
      'sci-fi': '🚀',
      comedy: '😄',
      drama: '🎭',
      historical: '📜',
      'animal-stories': '🐾',
      'fairy-tale': '🧚'
    };
    return emojiMap[genre] || '📖';
  };

  const getAverageScore = () => {
    if (!story.aiAssessment) return null;
    return Math.round(
      (story.aiAssessment.grammarScore + 
       story.aiAssessment.creativityScore + 
       story.aiAssessment.overallScore) / 3
    );
  };

  const cardContent = (
    <motion.div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 ${className}`}
      whileHover={{ y: -2 }}
      layout
    >
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-lg">{getGenreEmoji(story.elements.genre)}</span>
              <span className={`px-2 py-1 text-xs rounded-full font-medium border ${getStatusColor(story.status)}`}>
                {story.status}
              </span>
              {story.aiAssessment && (
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 text-yellow-500" />
                  <span className="text-xs font-medium text-gray-600">
                    {getAverageScore()}%
                  </span>
                </div>
              )}
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-1">
              {story.title}
            </h3>
            
            <div className="flex items-center text-sm text-gray-500 mb-3">
              <User className="w-3 h-3 mr-1" />
              <span className="mr-3">{story.userId.name}</span>
              {story.userId.age && (
                <span className="mr-3">Age {story.userId.age}</span>
              )}
              <Calendar className="w-3 h-3 mr-1" />
              <span>{formatDate(story.createdAt)}</span>
            </div>
          </div>

          {showActions && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Handle edit
                      setShowMenu(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Edit className="w-4 h-4 mr-3" />
                    Edit Story
                  </button>
                  
                  {onExport && (
                    <>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onExport(story._id, 'pdf');
                          setShowMenu(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Download className="w-4 h-4 mr-3" />
                        Export PDF
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onExport(story._id, 'word');
                          setShowMenu(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Download className="w-4 h-4 mr-3" />
                        Export Word
                      </button>
                    </>
                  )}
                  
                  {onDelete && (
                    <>
                      <hr className="my-1" />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onDelete(story._id);
                          setShowMenu(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-3" />
                        Delete Story
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content Preview */}
        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
          {story.content.substring(0, 150)}...
        </p>

        {/* Story Elements */}
        <div className="flex flex-wrap gap-1 mb-4">
          {Object.entries(story.elements).slice(0, 3).map(([key, value]) => (
            <span
              key={key}
              className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full capitalize"
            >
              {value.replace('-', ' ')}
            </span>
          ))}
          {Object.keys(story.elements).length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{Object.keys(story.elements).length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">{story.wordCount}</div>
            <div className="text-xs text-gray-500">Words</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">{Math.ceil(story.wordCount / 200)}</div>
            <div className="text-xs text-gray-500">Min Read</div>
          </div>
        </div>

        {/* Engagement Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <Eye className="w-3 h-3 mr-1" />
              {story.views}
            </span>
            <span className="flex items-center">
              <Heart className={`w-3 h-3 mr-1 ${story.isLiked ? 'text-red-500 fill-current' : ''}`} />
              {story.likes}
            </span>
            <span className="flex items-center">
              <MessageSquare className="w-3 h-3 mr-1" />
              {story.commentCount}
            </span>
          </div>
        </div>

        {/* AI Assessment Bars */}
        {story.aiAssessment && (
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Grammar</span>
              <span className="font-medium">{story.aiAssessment.grammarScore}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div 
                className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                style={{ width: `${story.aiAssessment.grammarScore}%` }}
              ></div>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Creativity</span>
              <span className="font-medium">{story.aiAssessment.creativityScore}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div 
                className="bg-purple-600 h-1 rounded-full transition-all duration-300"
                style={{ width: `${story.aiAssessment.creativityScore}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="flex-1">
            <BookOpen className="w-4 h-4 mr-2" />
            Read Story
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={isLiking}
            className={`${story.isLiked ? 'text-red-600 bg-red-50 hover:bg-red-100' : ''}`}
          >
            <Heart className={`w-4 h-4 ${story.isLiked ? 'fill-current' : ''}`} />
          </Button>
          
          <Button variant="ghost" size="sm" onClick={handleShare}>
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowMenu(false)}
        />
      )}
    </motion.div>
  );

  return story.status === 'published' ? (
    <Link href={`/story/${story._id}`} className="block">
      {cardContent}
    </Link>
  ) : (
    cardContent
  );
}