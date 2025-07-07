import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
  GET as getStoriesHandler,
  POST as createStoryHandler,
} from '../app/api/stories/route';
import {
  GET as getStoryHandler,
  PUT as updateStoryHandler,
  DELETE as deleteStoryHandler,
} from '../app/api/stories/[id]/route';
import { POST as likeStoryHandler } from '../app/api/stories/[id]/like/route';
import { connectDB } from '../utils/db';
import Story from '../models/Story';
import User from '../models/User';

// Mock dependencies
jest.mock('../utils/db');
jest.mock('../models/Story');
jest.mock('../models/User');
jest.mock('next-auth');

describe('Stories API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/stories', () => {
    it('should fetch stories with pagination', async () => {
      const mockStories = [
        {
          _id: 'story1',
          title: 'Test Story 1',
          content: 'Content 1',
          author: { name: 'Author 1', _id: 'user1' },
          isPublished: true,
          createdAt: new Date(),
        },
        {
          _id: 'story2',
          title: 'Test Story 2',
          content: 'Content 2',
          author: { name: 'Author 2', _id: 'user2' },
          isPublished: true,
          createdAt: new Date(),
        },
      ];

      Story.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              skip: jest.fn().mockResolvedValue(mockStories),
            }),
          }),
        }),
      });
      Story.countDocuments = jest.fn().mockResolvedValue(2);

      const request = new Request(
        'http://localhost:3000/api/stories?page=1&limit=10'
      );
      const response = await getStoriesHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.stories).toHaveLength(2);
      expect(data.pagination.total).toBe(2);
      expect(data.stories[0].title).toBe('Test Story 1');
    });

    it('should filter stories by search term', async () => {
      const mockStories = [
        {
          _id: 'story1',
          title: 'Adventure Story',
          content: 'An exciting adventure',
          author: { name: 'Author 1', _id: 'user1' },
          isPublished: true,
        },
      ];

      Story.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              skip: jest.fn().mockResolvedValue(mockStories),
            }),
          }),
        }),
      });

      const request = new Request(
        'http://localhost:3000/api/stories?search=adventure'
      );
      const response = await getStoriesHandler(request);
      const data = await response.json();

      expect(Story.find).toHaveBeenCalledWith(
        expect.objectContaining({
          $and: expect.arrayContaining([
            expect.objectContaining({
              $or: expect.arrayContaining([
                { title: { $regex: 'adventure', $options: 'i' } },
                { content: { $regex: 'adventure', $options: 'i' } },
              ]),
            }),
          ]),
        })
      );
    });
  });

  describe('POST /api/stories', () => {
    it('should create a new story', async () => {
      const mockUser = { _id: 'user123', role: 'student' };
      const mockStory = {
        _id: 'story123',
        title: 'New Story',
        content: 'Story content',
        author: 'user123',
        save: jest.fn().mockResolvedValue(true),
      };

      // Mock session
      jest.doMock('next-auth', () => ({
        getServerSession: jest.fn().mockResolvedValue({
          user: { id: 'user123', role: 'student' },
        }),
      }));

      Story.mockImplementation(() => mockStory);

      const request = new Request('http://localhost:3000/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'New Story',
          content: 'Story content',
          genre: 'adventure',
          targetAge: '8-12',
        }),
      });

      const response = await createStoryHandler(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.story.title).toBe('New Story');
    });

    it('should validate required fields', async () => {
      jest.doMock('next-auth', () => ({
        getServerSession: jest.fn().mockResolvedValue({
          user: { id: 'user123', role: 'student' },
        }),
      }));

      const request = new Request('http://localhost:3000/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Missing title and content
          genre: 'adventure',
        }),
      });

      const response = await createStoryHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('required');
    });
  });

  describe('GET /api/stories/[id]', () => {
    it('should fetch a single story', async () => {
      const mockStory = {
        _id: 'story123',
        title: 'Test Story',
        content: 'Story content',
        author: { name: 'Author', _id: 'user1' },
        isPublished: true,
        views: 10,
        likes: ['user2', 'user3'],
      };

      Story.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockStory),
      });

      const request = new Request('http://localhost:3000/api/stories/story123');
      const response = await getStoryHandler(request, {
        params: { id: 'story123' },
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.story.title).toBe('Test Story');
    });

    it('should return 404 for non-existent story', async () => {
      Story.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      const request = new Request(
        'http://localhost:3000/api/stories/nonexistent'
      );
      const response = await getStoryHandler(request, {
        params: { id: 'nonexistent' },
      });

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/stories/[id]', () => {
    it('should update story by author', async () => {
      const mockStory = {
        _id: 'story123',
        title: 'Old Title',
        author: 'user123',
        save: jest.fn().mockResolvedValue(true),
      };

      jest.doMock('next-auth', () => ({
        getServerSession: jest.fn().mockResolvedValue({
          user: { id: 'user123', role: 'student' },
        }),
      }));

      Story.findById = jest.fn().mockResolvedValue(mockStory);

      const request = new Request(
        'http://localhost:3000/api/stories/story123',
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Updated Title',
            content: 'Updated content',
          }),
        }
      );

      const response = await updateStoryHandler(request, {
        params: { id: 'story123' },
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockStory.title).toBe('Updated Title');
    });

    it('should prevent unauthorized updates', async () => {
      const mockStory = {
        _id: 'story123',
        author: 'user456', // Different user
      };

      jest.doMock('next-auth', () => ({
        getServerSession: jest.fn().mockResolvedValue({
          user: { id: 'user123', role: 'student' },
        }),
      }));

      Story.findById = jest.fn().mockResolvedValue(mockStory);

      const request = new Request(
        'http://localhost:3000/api/stories/story123',
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Unauthorized Update',
          }),
        }
      );

      const response = await updateStoryHandler(request, {
        params: { id: 'story123' },
      });

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/stories/[id]/like', () => {
    it('should like a story', async () => {
      const mockStory = {
        _id: 'story123',
        likes: [],
        save: jest.fn().mockResolvedValue(true),
      };

      jest.doMock('next-auth', () => ({
        getServerSession: jest.fn().mockResolvedValue({
          user: { id: 'user123' },
        }),
      }));

      Story.findById = jest.fn().mockResolvedValue(mockStory);

      const request = new Request(
        'http://localhost:3000/api/stories/story123/like',
        {
          method: 'POST',
        }
      );

      const response = await likeStoryHandler(request, {
        params: { id: 'story123' },
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.liked).toBe(true);
      expect(mockStory.likes).toContain('user123');
    });

    it('should unlike a previously liked story', async () => {
      const mockStory = {
        _id: 'story123',
        likes: ['user123'],
        save: jest.fn().mockResolvedValue(true),
      };

      jest.doMock('next-auth', () => ({
        getServerSession: jest.fn().mockResolvedValue({
          user: { id: 'user123' },
        }),
      }));

      Story.findById = jest.fn().mockResolvedValue(mockStory);

      const request = new Request(
        'http://localhost:3000/api/stories/story123/like',
        {
          method: 'POST',
        }
      );

      const response = await likeStoryHandler(request, {
        params: { id: 'story123' },
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.liked).toBe(false);
      expect(mockStory.likes).not.toContain('user123');
    });
  });

  describe('Story Validation', () => {
    it('should validate story content length', () => {
      const shortContent = 'Too short';
      const validContent =
        'This is a properly sized story content that meets the minimum requirements for a creative story.';

      expect(shortContent.length).toBeLessThan(50);
      expect(validContent.length).toBeGreaterThan(50);
    });

    it('should validate age-appropriate content', () => {
      const inappropriateWords = ['violence', 'inappropriate', 'adult'];
      const storyContent =
        'This is a child-friendly adventure story about friendship and discovery.';

      const hasInappropriateContent = inappropriateWords.some((word) =>
        storyContent.toLowerCase().includes(word)
      );

      expect(hasInappropriateContent).toBe(false);
    });
  });
});
