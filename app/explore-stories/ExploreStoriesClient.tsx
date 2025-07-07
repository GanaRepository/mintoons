'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Star, 
  Heart, 
  BookOpen, 
  Clock, 
  User,
  Eye,
  ThumbsUp,
  Award,
  Sparkles,
  TrendingUp,
  Calendar,
  Tag
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Story {
  _id: string;
  title: string;
  content: string;
  genre: string;
  setting: string;
  mood: string;
  author: {
    username: string;
    age?: number;
    avatar?: string;
  };
  createdAt: string;
  likes: number;
  views: number;
  isLiked: boolean;
  isFeatured: boolean;
  readingTime: number;
  tags: string[];
}

export default function ExploreStoriesClient() {
  const [stories, setStories] = useState<Story[]>([]);
  const [filteredStories, setFilteredStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedMood, setSelectedMood] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  const genres = [
    'all', 'adventure', 'fantasy', 'mystery', 'comedy', 'sci-fi', 'friendship'
  ];

  const moods = [
    'all', 'exciting', 'magical', 'funny', 'mysterious', 'heartwarming', 'dramatic'
  ];

  useEffect(() => {
    fetchStories();
  }, []);

  useEffect(() => {
    filterAndSortStories();
  }, [stories, searchTerm, selectedGenre, selectedMood, sortBy]);

  const fetchStories = async () => {
    try {
      const response = await fetch('/api/stories/explore');
      if (response.ok) {
        const data = await response.json();
        setStories(data.stories);
      }
    } catch (error) {
      toast.error('Failed to load stories');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortStories = () => {
    let filtered = stories.filter(story => {
      const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           story.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           story.author.username.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesGenre = selectedGenre === 'all' || story.genre === selectedGenre;
      const matchesMood = selectedMood === 'all' || story.mood === selectedMood;
      
      return matchesSearch && matchesGenre && matchesMood;
    });

    // Sort stories
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'popular':
          return (b.likes + b.views) - (a.likes + a.views);
        case 'trending':
          // Stories with recent activity and high engagement
          const aScore = b.likes * 2 + b.views;
          const bScore = a.likes * 2 + a.views;
          return bScore - aScore;
        default:
          return 0;
      }
    });

    // Prioritize featured stories
    const featured = filtered.filter(story => story.isFeatured);
    const regular = filtered.filter(story => !story.isFeatured);
    
    setFilteredStories([...featured, ...regular]);
  };

  const handleLike = async (storyId: string) => {
    try {
      const response = await fetch(`/api/stories/${storyId}/like`, {
        method: 'POST',
      });
      
      if (response.ok) {
        setStories(prevStories =>
          prevStories.map(story =>
            story._id === storyId
              ? { 
                  ...story, 
                  likes: story.isLiked ? story.likes - 1 : story.likes + 1,
                  isLiked: !story.isLiked 
                }
              : story
          )
        );
      }
    } catch (error) {
      toast.error('Failed to like story');
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading amazing stories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Explore Amazing Stories
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover creative stories written by young authors with AI collaboration. 
              Get inspired and find your next favorite tale!
            </p>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-8"
          >
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search stories, authors, or topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </button>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Genre
                  </label>
                  <select
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {genres.map(genre => (
                      <option key={genre} value={genre}>
                        {genre === 'all' ? 'All Genres' : genre.charAt(0).toUpperCase() + genre.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mood
                  </label>
                  <select
                    value={selectedMood}
                    onChange={(e) => setSelectedMood(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {moods.map(mood => (
                      <option key={mood} value={mood}>
                        {mood === 'all' ? 'All Moods' : mood.charAt(0).toUpperCase() + mood.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="popular">Most Popular</option>
                    <option value="trending">Trending</option>
                  </select>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Stories Grid */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {filteredStories.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No stories found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filters to find more stories.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredStories.map((story, index) => (
                <motion.div
                  key={story._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Story Header */}
                  <div className="p-6">
                    {story.isFeatured && (
                      <div className="flex items-center mb-3">
                        <Award className="w-4 h-4 text-yellow-500 mr-2" />
                        <span className="text-sm font-medium text-yellow-600">Featured</span>
                      </div>
                    )}
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                      {story.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {story.content.slice(0, 150)}...
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {story.genre}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                        {story.mood}
                      </span>
                    </div>

                    {/* Author Info */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {story.author.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {story.author.username}
                          </p>
                          <p className="text-xs text-gray-500">
                            {story.author.age && `Age ${story.author.age} • `}
                            {getTimeAgo(story.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {story.readingTime} min read
                        </p>
                      </div>
                    </div>

                    {/* Stats and Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          {story.views}
                        </div>
                        <div className="flex items-center">
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          {story.likes}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleLike(story._id)}
                          className={`p-2 rounded-full transition-colors ${
                            story.isLiked 
                              ? 'text-red-500 bg-red-50' 
                              : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                          }`}
                        >
                          <Heart className={`w-5 h-5 ${story.isLiked ? 'fill-current' : ''}`} />
                        </button>
                        
                        <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors">
                          Read Story
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}