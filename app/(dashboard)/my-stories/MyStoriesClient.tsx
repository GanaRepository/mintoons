'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  PlusCircle,
  Search,
  Filter,
  Download,
  Trash2,
  Edit,
  Eye,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
  Grid,
  List
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, StoryCard } from '@/app/components/ui/card';
import { ConfirmModal, InfoModal } from '@/app/components/ui/modal';
import { showToast } from '@/app/components/ui/toast';

interface Story {
  id: string;
  title: string;
  excerpt: string;
  status: 'draft' | 'published' | 'reviewed';
  createdAt: string;
  updatedAt: string;
  wordCount: number;
  score?: number;
  elements: {
    genre: string;
    setting: string;
    character: string;
    mood: string;
    conflict: string;
    theme: string;
  };
  assessment?: {
    grammarScore: number;
    creativityScore: number;
    overallScore: number;
    feedback: string;
  };
}

export default function MyStoriesClient() {
  const router = useRouter();
  const [stories, setStories] = useState<Story[]>([]);
  const [filteredStories, setFilteredStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchStories();
  }, []);

  useEffect(() => {
    filterStories();
  }, [stories, searchQuery, statusFilter]);

  const fetchStories = async () => {
    try {
      const response = await fetch('/api/stories?sortBy=updatedAt&sortOrder=desc');
      if (!response.ok) {
        throw new Error('Failed to fetch stories');
      }
      
      const result = await response.json();
      setStories(result.data.stories);
    } catch (error) {
      console.error('Failed to fetch stories:', error);
      showToast.error('Error', 'Failed to load your stories');
    } finally {
      setIsLoading(false);
    }
  };

  const filterStories = () => {
    let filtered = stories;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(story =>
        story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(story => story.status === statusFilter);
    }

    setFilteredStories(filtered);
  };

  const handleDeleteStory = async () => {
    if (!selectedStory) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/stories/${selectedStory.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete story');
      }

      setStories(prev => prev.filter(story => story.id !== selectedStory.id));
      showToast.success('Deleted! 🗑️', 'Your story has been deleted');
      setShowDeleteModal(false);
      setSelectedStory(null);
    } catch (error) {
      console.error('Failed to delete story:', error);
      showToast.error('Delete Failed', 'Unable to delete story. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportStory = async (story: Story) => {
    try {
      const response = await fetch(`/api/export/pdf/${story.id}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to export story');
      }

      const result = await response.json();
      
      // Download the generated PDF
      window.open(`/api/files/${result.data.fileId}`, '_blank');
      showToast.success('Exported! 📄', 'Your story has been exported as PDF');
    } catch (error) {
      console.error('Failed to export story:', error);
      showToast.error('Export Failed', 'Unable to export story. Please try again.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'reviewed':
        return <Star className="h-4 w-4 text-blue-600" />;
      case 'draft':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
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
          <p className="text-gray-600">Loading your stories...</p>
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
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  My Stories 📚
                </h1>
                <p className="text-gray-600">
                  {stories.length > 0 
                    ? `You have ${stories.length} ${stories.length === 1 ? 'story' : 'stories'} in your collection`
                    : 'Start your writing journey by creating your first story'
                  }
                </p>
              </div>
              <Button
                onClick={() => router.push('/create-stories')}
                variant="gradient"
                size="lg"
                leftIcon={<PlusCircle className="h-5 w-5" />}
              >
                New Story
              </Button>
            </div>
          </motion.div>

          {/* Filters and Search */}
          <motion.div variants={itemVariants} className="mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-4 flex-1">
                    {/* Search */}
                    <div className="flex-1 max-w-md">
                      <Input
                        placeholder="Search your stories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        leftIcon={<Search className="h-4 w-4" />}
                      />
                    </div>

                    {/* Status Filter */}
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Stories</option>
                      <option value="draft">Drafts</option>
                      <option value="published">Published</option>
                      <option value="reviewed">Reviewed</option>
                    </select>
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stories Grid/List */}
          <motion.div variants={itemVariants}>
            {filteredStories.length > 0 ? (
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }>
                <AnimatePresence>
                  {filteredStories.map((story, index) => (
                    <motion.div
                      key={story.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {viewMode === 'grid' ? (
                        <StoryCard
                          title={story.title}
                          excerpt={story.excerpt}
                          status={story.status}
                          score={story.score}
                          createdAt={new Date(story.createdAt)}
                          onClick={() => router.push(`/my-stories/${story.id}`)}
                        />
                      ) : (
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                                    {story.title}
                                  </h3>
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1 ${getStatusColor(story.status)}`}>
                                    {getStatusIcon(story.status)}
                                    <span className="capitalize">{story.status}</span>
                                  </span>
                                </div>
                                <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                                  {story.excerpt}
                                </p>
                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                  <span>{story.wordCount} words</span>
                                  <span>{new Date(story.updatedAt).toLocaleDateString()}</span>
                                  {story.score && (
                                    <span className="flex items-center space-x-1">
                                      <Star className="h-3 w-3 text-yellow-500" />
                                      <span>{story.score}/100</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2 ml-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/my-stories/${story.id}`);
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleExportStory(story);
                                  }}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                                {story.status === 'draft' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedStory(story);
                                      setShowDeleteModal(true);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {searchQuery || statusFilter !== 'all' ? 'No stories found' : 'No stories yet'}
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    {searchQuery || statusFilter !== 'all' 
                      ? 'Try adjusting your search or filter to find more stories.'
                      : 'Ready to start your writing adventure? Create your first story and let your imagination soar!'
                    }
                  </p>
                  {(!searchQuery && statusFilter === 'all') && (
                    <Button
                      onClick={() => router.push('/create-stories')}
                      variant="gradient"
                      size="lg"
                      leftIcon={<PlusCircle className="h-5 w-5" />}
                    >
                      Create Your First Story
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </motion.div>
        </motion.div>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          open={showDeleteModal}
          onOpenChange={setShowDeleteModal}
          title="Delete Story"
          description={`Are you sure you want to delete "${selectedStory?.title}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="destructive"
          onConfirm={handleDeleteStory}
          loading={isDeleting}
        />

        {/* Story Details Modal */}
        {selectedStory && (
          <InfoModal
            open={showDetailsModal}
            onOpenChange={setShowDetailsModal}
            title={selectedStory.title}
            size="lg"
          >
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Story Elements</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {Object.entries(selectedStory.elements).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-600 capitalize">{key}:</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedStory.assessment && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Assessment Scores</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Grammar:</span>
                      <span className="font-medium">{selectedStory.assessment.grammarScore}/100</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Creativity:</span>
                      <span className="font-medium">{selectedStory.assessment.creativityScore}/100</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Overall:</span>
                      <span className="font-medium">{selectedStory.assessment.overallScore}/100</span>
                    </div>
                  </div>
                  
                  {selectedStory.assessment.feedback && (
                    <div className="mt-4">
                      <h5 className="font-medium text-gray-900 mb-2">Feedback</h5>
                      <p className="text-sm text-gray-600 italic">
                        "{selectedStory.assessment.feedback}"
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={() => router.push(`/my-stories/${selectedStory.id}`)}
                  variant="gradient"
                  className="flex-1"
                >
                  View Story
                </Button>
                <Button
                  onClick={() => handleExportStory(selectedStory)}
                  variant="outline"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </InfoModal>
        )}
      </div>
    </div>
  );
}