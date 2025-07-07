'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, Filter, Eye, MessageCircle, Star, Calendar, User, 
  BookOpen, Clock, Award, TrendingUp, MoreVertical, ChevronDown,
  FileText, Heart, ThumbsUp, AlertCircle, CheckCircle
} from 'lucide-react';

interface Student {
  _id: string;
  name: string;
  avatar?: string;
  ageGroup: string;
  joinedAt: string;
  stats: {
    storiesCount: number;
    publishedCount: number;
    totalViews: number;
    totalLikes: number;
    averageRating: number;
  };
  lastActive: string;
  progressLevel: number;
  achievements: number;
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
  publishedAt?: string;
  wordCount: number;
  readingTime: number;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  feedbackRequested: boolean;
  mentorFeedback?: {
    rating: number;
    type: 'praise' | 'suggestion' | 'question';
    lastFeedbackAt: string;
  };
  tags: string[];
  excerpt: string;
}

export default function StudentStoriesClient() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [stories, setStories] = useState<StudentStory[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [view, setView] = useState<'students' | 'stories'>('stories');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'pending' | 'reviewed' | 'published'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular' | 'needs_attention'>('newest');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      fetchStudentStories(selectedStudent);
    } else {
      fetchAllStories();
    }
  }, [selectedStudent, filterBy, sortBy]);

  const fetchData = async () => {
    try {
      const studentsRes = await fetch('/api/mentor/students');
      if (studentsRes.ok) {
        const studentsData = await studentsRes.json();
        setStudents(studentsData.students);
      }
      
      await fetchAllStories();
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllStories = async () => {
    try {
      const response = await fetch(`/api/mentor/stories?filter=${filterBy}&sort=${sortBy}`);
      if (response.ok) {
        const data = await response.json();
        setStories(data.stories);
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
    }
  };

  const fetchStudentStories = async (studentId: string) => {
    try {
      const response = await fetch(`/api/mentor/students/${studentId}/stories?filter=${filterBy}&sort=${sortBy}`);
      if (response.ok) {
        const data = await response.json();
        setStories(data.stories);
      }
    } catch (error) {
      console.error('Error fetching student stories:', error);
    }
  };

  const filteredStories = stories.filter(story => {
    if (searchTerm) {
      return story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
             story.author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             story.genre.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  const filteredStudents = students.filter(student => {
    if (searchTerm) {
      return student.name.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'needs_review': return 'bg-orange-100 text-orange-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return <CheckCircle className="w-4 h-4" />;
      case 'needs_review': return <AlertCircle className="w-4 h-4" />;
      case 'draft': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getProgressColor = (level: number) => {
    if (level >= 80) return 'bg-green-500';
    if (level >= 60) return 'bg-yellow-500';
    if (level >= 40) return 'bg-orange-500';
    return 'bg-red-500';
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Stories</h1>
          <p className="text-gray-600 mt-1">
            Monitor and provide feedback on your students' creative writing journey
          </p>
        </div>

        {/* View Toggle */}
        <div className="mt-4 md:mt-0">
          <div className="inline-flex rounded-lg border p-1">
            <button
              onClick={() => setView('stories')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                view === 'stories' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BookOpen className="w-4 h-4 inline mr-2" />
              Stories
            </button>
            <button
              onClick={() => setView('students')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                view === 'students' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <User className="w-4 h-4 inline mr-2" />
              Students
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={view === 'stories' ? "Search stories, authors, or genres..." : "Search students..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {view === 'stories' && (
            <>
              {/* Student Filter */}
              <select
                value={selectedStudent || ''}
                onChange={(e) => setSelectedStudent(e.target.value || null)}
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Students</option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.name}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as any)}
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Stories</option>
                <option value="pending">Needs Review</option>
                <option value="reviewed">Reviewed</option>
                <option value="published">Published</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="popular">Most Popular</option>
                <option value="needs_attention">Needs Attention</option>
              </select>
            </>
          )}
        </div>
      </div>

      {view === 'stories' ? (
        /* Stories View */
        <div className="bg-white rounded-lg border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {selectedStudent 
                  ? `Stories by ${students.find(s => s._id === selectedStudent)?.name}`
                  : 'All Student Stories'
                }
              </h2>
              <span className="text-sm text-gray-600">
                {filteredStories.length} stories
              </span>
            </div>
          </div>

          <div className="divide-y">
            {filteredStories.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No stories found</h3>
                <p>Try adjusting your filters or search terms.</p>
              </div>
            ) : (
              filteredStories.map((story) => (
                <div 
                  key={story._id} 
                  className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => router.push(`/dashboard/story/${story._id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Story Header */}
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {story.title}
                        </h3>
                        
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(story.status)}`}>
                          {getStatusIcon(story.status)}
                          <span className="ml-1 capitalize">{story.status.replace('_', ' ')}</span>
                        </span>

                        {story.feedbackRequested && (
                          <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                            Feedback Requested
                          </span>
                        )}
                      </div>

                      {/* Author Info */}
                      <div className="flex items-center space-x-2 mb-3">
                        {story.author.avatar ? (
                          <img 
                            src={story.author.avatar} 
                            alt={story.author.name}
                            className="w-6 h-6 rounded-full"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                        )}
                        <span className="font-medium text-gray-700">{story.author.name}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-600">Age {story.author.ageGroup}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-600 capitalize">{story.genre}</span>
                      </div>

                      {/* Story Excerpt */}
                      <p className="text-gray-600 mb-3 line-clamp-2">{story.excerpt}</p>

                      {/* Story Stats */}
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <FileText className="w-4 h-4" />
                          <span>{story.wordCount} words</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{story.readingTime} min read</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{story.viewsCount}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Heart className="w-4 h-4" />
                          <span>{story.likesCount}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="w-4 h-4" />
                          <span>{story.commentsCount}</span>
                        </div>

                        {story.mentorFeedback && (
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span>{story.mentorFeedback.rating}/5</span>
                          </div>
                        )}
                      </div>

                      {/* Tags */}
                      {story.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {story.tags.slice(0, 3).map((tag) => (
                            <span 
                              key={tag}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                          {story.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              +{story.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Menu */}
                    <div className="ml-4">
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {/* Bottom Meta */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Created {new Date(story.createdAt).toLocaleDateString()}</span>
                      {story.publishedAt && (
                        <span>Published {new Date(story.publishedAt).toLocaleDateString()}</span>
                      )}
                      {story.mentorFeedback && (
                        <span>Last feedback {new Date(story.mentorFeedback.lastFeedbackAt).toLocaleDateString()}</span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/story/${story._id}#comments`);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Provide Feedback
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* Students View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              <User className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No students found</h3>
              <p>Try adjusting your search terms.</p>
            </div>
          ) : (
            filteredStudents.map((student) => (
              <div key={student._id} className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
                {/* Student Header */}
                <div className="flex items-center space-x-3 mb-4">
                  {student.avatar ? (
                    <img 
                      src={student.avatar} 
                      alt={student.name}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-600" />
                    </div>
                  )}
                  
                  <div>
                    <h3 className="font-medium text-gray-900">{student.name}</h3>
                    <p className="text-sm text-gray-600">Age {student.ageGroup}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Writing Progress</span>
                    <span className="text-xs text-gray-600">{student.progressLevel}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getProgressColor(student.progressLevel)}`}
                      style={{ width: `${student.progressLevel}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{student.stats.storiesCount}</div>
                    <div className="text-xs text-gray-600">Stories</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{student.stats.publishedCount}</div>
                    <div className="text-xs text-gray-600">Published</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">{student.stats.totalViews}</div>
                    <div className="text-xs text-gray-600">Views</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-lg font-bold text-yellow-600">{student.achievements}</div>
                    <div className="text-xs text-gray-600">Achievements</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setSelectedStudent(student._id);
                      setView('stories');
                    }}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Stories
                  </button>
                  
                  <div className="flex space-x-2">
                    <button className="flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                      Send Message
                    </button>
                    <button className="flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                      Progress Report
                    </button>
                  </div>
                </div>

                {/* Last Active */}
                <div className="mt-4 pt-4 border-t text-xs text-gray-500 text-center">
                  Last active {new Date(student.lastActive).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}