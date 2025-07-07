import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectDB } from '@/utils/db';
import Story from '@/models/Story';
import User from '@/models/User';

interface ExploreFilters {
  genre?: string;
  targetAge?: string;
  tags?: string[];
  sortBy?: 'newest' | 'popular' | 'trending' | 'random';
  searchTerm?: string;
  authorRole?: 'student' | 'mentor' | 'all';
  page?: number;
  limit?: number;
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const filters: ExploreFilters = {
      genre: searchParams.get('genre') || undefined,
      targetAge: searchParams.get('targetAge') || undefined,
      tags: searchParams.get('tags')?.split(',').filter(Boolean) || [],
      sortBy: (searchParams.get('sortBy') as any) || 'newest',
      searchTerm: searchParams.get('search') || undefined,
      authorRole: (searchParams.get('authorRole') as any) || 'all',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '12')
    };

    // Build query for public stories
    const query: any = {
      visibility: 'public',
      status: 'published'
    };

    // Apply filters
    if (filters.genre) {
      query.genre = filters.genre;
    }

    if (filters.targetAge) {
      query.targetAge = filters.targetAge;
    }

    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }

    if (filters.searchTerm) {
      query.$or = [
        { title: { $regex: filters.searchTerm, $options: 'i' } },
        { content: { $regex: filters.searchTerm, $options: 'i' } },
        { tags: { $in: [new RegExp(filters.searchTerm, 'i')] } }
      ];
    }

    // Author role filter
    if (filters.authorRole !== 'all') {
      const authors = await User.find({ role: filters.authorRole }).select('_id');
      query.author = { $in: authors.map(author => author._id) };
    }

    // Build sort criteria
    let sortCriteria: any = {};
    switch (filters.sortBy) {
      case 'popular':
        sortCriteria = { likesCount: -1, viewsCount: -1 };
        break;
      case 'trending':
        // Stories with high engagement in the last 7 days
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        sortCriteria = { 
          'analytics.weeklyViews': -1, 
          'analytics.weeklyLikes': -1,
          updatedAt: -1 
        };
        break;
      case 'random':
        // MongoDB random sampling
        break;
      case 'newest':
      default:
        sortCriteria = { createdAt: -1 };
        break;
    }

    // Calculate pagination
    const skip = (filters.page! - 1) * filters.limit!;

    let stories;
    let totalStories;

    if (filters.sortBy === 'random') {
      // Use aggregation for random sampling
      const pipeline = [
        { $match: query },
        { $sample: { size: filters.limit! } },
        {
          $lookup: {
            from: 'users',
            localField: 'author',
            foreignField: '_id',
            as: 'author',
            pipeline: [
              { $project: { name: 1, avatar: 1, role: 1, username: 1 } }
            ]
          }
        },
        { $unwind: '$author' },
        {
          $project: {
            title: 1,
            content: { $substr: ['$content', 0, 200] }, // First 200 chars as excerpt
            genre: 1,
            targetAge: 1,
            tags: 1,
            author: 1,
            createdAt: 1,
            updatedAt: 1,
            likesCount: { $size: '$likes' },
            viewsCount: 1,
            commentsCount: 1,
            coverImage: 1,
            status: 1,
            readingTime: 1
          }
        }
      ];

      stories = await Story.aggregate(pipeline);
      totalStories = await Story.countDocuments(query);
    } else {
      // Regular query with pagination
      stories = await Story.find(query)
        .populate('author', 'name avatar role username')
        .select('title content genre targetAge tags author createdAt updatedAt likesCount viewsCount commentsCount coverImage status readingTime')
        .sort(sortCriteria)
        .skip(skip)
        .limit(filters.limit!)
        .lean();

      // Add excerpt to content
      stories = stories.map(story => ({
        ...story,
        content: story.content ? story.content.substring(0, 200) + '...' : '',
        likesCount: story.likes?.length || 0
      }));

      totalStories = await Story.countDocuments(query);
    }

    // Get popular tags for filter suggestions
    const popularTags = await Story.aggregate([
      { $match: { visibility: 'public', status: 'published' } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
      { $project: { tag: '$_id', count: 1, _id: 0 } }
    ]);

    // Get genre statistics
    const genreStats = await Story.aggregate([
      { $match: { visibility: 'public', status: 'published' } },
      { $group: { _id: '$genre', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { genre: '$_id', count: 1, _id: 0 } }
    ]);

    // Get age group statistics
    const ageStats = await Story.aggregate([
      { $match: { visibility: 'public', status: 'published' } },
      { $group: { _id: '$targetAge', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { ageGroup: '$_id', count: 1, _id: 0 } }
    ]);

    const totalPages = Math.ceil(totalStories / filters.limit!);

    return NextResponse.json({
      stories,
      pagination: {
        currentPage: filters.page,
        totalPages,
        totalStories,
        hasNextPage: filters.page! < totalPages,
        hasPrevPage: filters.page! > 1
      },
      filters: {
        applied: filters,
        available: {
          genres: genreStats,
          ageGroups: ageStats,
          popularTags: popularTags.slice(0, 15)
        }
      },
      meta: {
        totalPublicStories: totalStories
      }
    });

  } catch (error) {
    console.error('Explore stories error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stories' },
      { status: 500 }
    );
  }
}

// Get featured/highlighted stories
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const { type } = await request.json();

    let stories = [];

    switch (type) {
      case 'featured':
        // Get stories marked as featured by admins
        stories = await Story.find({
          visibility: 'public',
          status: 'published',
          featured: true
        })
        .populate('author', 'name avatar role username')
        .select('title content genre targetAge tags author createdAt likesCount viewsCount coverImage')
        .sort({ featuredAt: -1 })
        .limit(6)
        .lean();
        break;

      case 'trending':
        // Get trending stories based on recent engagement
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        stories = await Story.find({
          visibility: 'public',
          status: 'published',
          updatedAt: { $gte: weekAgo }
        })
        .populate('author', 'name avatar role username')
        .select('title content genre targetAge tags author createdAt likesCount viewsCount coverImage')
        .sort({ 'analytics.weeklyViews': -1, 'analytics.weeklyLikes': -1 })
        .limit(8)
        .lean();
        break;

      case 'recent':
        // Get recently published stories
        stories = await Story.find({
          visibility: 'public',
          status: 'published'
        })
        .populate('author', 'name avatar role username')
        .select('title content genre targetAge tags author createdAt likesCount viewsCount coverImage')
        .sort({ publishedAt: -1 })
        .limit(10)
        .lean();
        break;

      case 'by_genre':
        // Get top stories by each genre
        const genres = ['adventure', 'mystery', 'fantasy', 'science_fiction', 'friendship'];
        const storyPromises = genres.map(genre =>
          Story.find({
            visibility: 'public',
            status: 'published',
            genre
          })
          .populate('author', 'name avatar role username')
          .select('title content genre targetAge tags author createdAt likesCount viewsCount coverImage')
          .sort({ likesCount: -1, viewsCount: -1 })
          .limit(3)
          .lean()
        );
        
        const genreStories = await Promise.all(storyPromises);
        stories = genres.reduce((acc, genre, index) => {
          acc[genre] = genreStories[index];
          return acc;
        }, {} as any);
        break;

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    // Add excerpts to stories
    if (Array.isArray(stories)) {
      stories = stories.map(story => ({
        ...story,
        content: story.content ? story.content.substring(0, 150) + '...' : '',
        likesCount: story.likes?.length || 0
      }));
    }

    return NextResponse.json({ stories, type });

  } catch (error) {
    console.error('Featured stories error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured stories' },
      { status: 500 }
    );
  }
}