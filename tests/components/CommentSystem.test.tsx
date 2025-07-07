import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { useSession } from 'next-auth/react';
import CommentSystem from '../app/components/stories/CommentSystem';

// Mock next-auth
jest.mock('next-auth/react');
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

// Mock fetch
global.fetch = jest.fn();
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('CommentSystem Component', () => {
  const mockComments = [
    {
      _id: 'comment1',
      content: 'Great story! I love the characters.',
      author: {
        _id: 'user1',
        name: 'John Mentor',
        role: 'mentor',
        avatar: 'avatar1.jpg',
      },
      createdAt: '2024-01-15T10:00:00Z',
      likes: ['user2'],
      replies: [
        {
          _id: 'reply1',
          content: 'Thank you for the feedback!',
          author: {
            _id: 'user2',
            name: 'Student Writer',
            role: 'student',
          },
          createdAt: '2024-01-15T11:00:00Z',
          likes: [],
        },
      ],
      isEdited: false,
      isFlagged: false,
    },
    {
      _id: 'comment2',
      content: 'The plot twist was unexpected!',
      author: {
        _id: 'user3',
        name: 'Jane Reader',
        role: 'student',
      },
      createdAt: '2024-01-16T09:00:00Z',
      likes: [],
      replies: [],
      isEdited: true,
      isFlagged: false,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'user2',
          name: 'Current User',
          role: 'student',
        },
      },
      status: 'authenticated',
    });

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ comments: mockComments }),
    } as Response);
  });

  it('renders comments correctly', async () => {
    render(<CommentSystem storyId="story123" />);

    await waitFor(() => {
      expect(
        screen.getByText('Great story! I love the characters.')
      ).toBeInTheDocument();
      expect(
        screen.getByText('The plot twist was unexpected!')
      ).toBeInTheDocument();
      expect(screen.getByText('John Mentor')).toBeInTheDocument();
      expect(screen.getByText('Jane Reader')).toBeInTheDocument();
    });
  });

  it('shows mentor badge for mentor comments', async () => {
    render(<CommentSystem storyId="story123" />);

    await waitFor(() => {
      expect(screen.getByText('Mentor')).toBeInTheDocument();
    });
  });

  it('displays edited indicator', async () => {
    render(<CommentSystem storyId="story123" />);

    await waitFor(() => {
      expect(screen.getByText('(edited)')).toBeInTheDocument();
    });
  });

  it('allows adding new comments', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        comment: {
          _id: 'new-comment',
          content: 'New comment content',
          author: {
            _id: 'user2',
            name: 'Current User',
            role: 'student',
          },
          createdAt: new Date().toISOString(),
          likes: [],
          replies: [],
        },
      }),
    } as Response);

    render(<CommentSystem storyId="story123" />);

    const textarea = screen.getByPlaceholderText(
      'Share your thoughts about this story...'
    );
    const submitButton = screen.getByText('Post Comment');

    fireEvent.change(textarea, { target: { value: 'New comment content' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/stories/story123/comments',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: 'New comment content' }),
        })
      );
    });
  });

  it('validates comment length', () => {
    render(<CommentSystem storyId="story123" />);

    const textarea = screen.getByPlaceholderText(
      'Share your thoughts about this story...'
    );
    const submitButton = screen.getByText('Post Comment');

    // Test empty comment
    fireEvent.click(submitButton);
    expect(mockFetch).not.toHaveBeenCalled();

    // Test very long comment
    const longComment = 'a'.repeat(1001);
    fireEvent.change(textarea, { target: { value: longComment } });

    expect(
      screen.getByText('Comment is too long (max 1000 characters)')
    ).toBeInTheDocument();
  });

  it('allows liking comments', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ liked: true, likes: ['user1', 'user2'] }),
    } as Response);

    render(<CommentSystem storyId="story123" />);

    await waitFor(() => {
      const likeButton = screen.getAllByTestId('like-button')[0];
      fireEvent.click(likeButton);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/stories/story123/comments/comment1/like',
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  it('shows reply interface when replying', async () => {
    render(<CommentSystem storyId="story123" />);

    await waitFor(() => {
      const replyButton = screen.getAllByText('Reply')[0];
      fireEvent.click(replyButton);

      expect(
        screen.getByPlaceholderText('Write a reply...')
      ).toBeInTheDocument();
      expect(screen.getByText('Post Reply')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  it('allows submitting replies', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        reply: {
          _id: 'new-reply',
          content: 'This is a reply',
          author: {
            _id: 'user2',
            name: 'Current User',
            role: 'student',
          },
          createdAt: new Date().toISOString(),
          likes: [],
        },
      }),
    } as Response);

    render(<CommentSystem storyId="story123" />);

    await waitFor(async () => {
      const replyButton = screen.getAllByText('Reply')[0];
      fireEvent.click(replyButton);

      const replyTextarea = screen.getByPlaceholderText('Write a reply...');
      const postReplyButton = screen.getByText('Post Reply');

      fireEvent.change(replyTextarea, { target: { value: 'This is a reply' } });
      fireEvent.click(postReplyButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/stories/story123/comments',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
              content: 'This is a reply',
              parentId: 'comment1',
            }),
          })
        );
      });
    });
  });

  it('shows edit interface for own comments', async () => {
    const userComments = [
      {
        ...mockComments[0],
        author: {
          _id: 'user2',
          name: 'Current User',
          role: 'student',
        },
      },
    ];

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ comments: userComments }),
    } as Response);

    render(<CommentSystem storyId="story123" />);

    await waitFor(() => {
      const moreButton = screen.getByTestId('comment-menu');
      fireEvent.click(moreButton);

      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });
  });

  it('allows editing comments', async () => {
    const userComments = [
      {
        ...mockComments[0],
        author: {
          _id: 'user2',
          name: 'Current User',
          role: 'student',
        },
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ comments: userComments }),
    } as Response);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        comment: {
          ...userComments[0],
          content: 'Updated comment content',
          isEdited: true,
        },
      }),
    } as Response);

    render(<CommentSystem storyId="story123" />);

    await waitFor(async () => {
      const moreButton = screen.getByTestId('comment-menu');
      fireEvent.click(moreButton);

      const editButton = screen.getByText('Edit');
      fireEvent.click(editButton);

      const editTextarea = screen.getByDisplayValue(
        'Great story! I love the characters.'
      );
      fireEvent.change(editTextarea, {
        target: { value: 'Updated comment content' },
      });

      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/stories/story123/comments/comment1',
          expect.objectContaining({
            method: 'PUT',
            body: JSON.stringify({ content: 'Updated comment content' }),
          })
        );
      });
    });
  });

  it('allows deleting comments', async () => {
    const userComments = [
      {
        ...mockComments[0],
        author: {
          _id: 'user2',
          name: 'Current User',
          role: 'student',
        },
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ comments: userComments }),
    } as Response);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Comment deleted' }),
    } as Response);

    render(<CommentSystem storyId="story123" />);

    await waitFor(async () => {
      const moreButton = screen.getByTestId('comment-menu');
      fireEvent.click(moreButton);

      const deleteButton = screen.getByText('Delete');
      fireEvent.click(deleteButton);

      // Confirm deletion
      const confirmButton = screen.getByText('Yes, delete');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/stories/story123/comments/comment1',
          expect.objectContaining({ method: 'DELETE' })
        );
      });
    });
  });

  it('allows flagging inappropriate comments', async () => {
    render(<CommentSystem storyId="story123" />);

    await waitFor(async () => {
      const moreButton = screen.getAllByTestId('comment-menu')[0];
      fireEvent.click(moreButton);

      const flagButton = screen.getByText('Flag');
      fireEvent.click(flagButton);

      // Select reason and submit
      const reasonSelect = screen.getByTestId('flag-reason');
      fireEvent.change(reasonSelect, { target: { value: 'inappropriate' } });

      const submitFlagButton = screen.getByText('Submit Flag');
      fireEvent.click(submitFlagButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/stories/story123/comments/comment1/flag',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ reason: 'inappropriate' }),
          })
        );
      });
    });
  });

  it('sorts comments correctly', async () => {
    render(<CommentSystem storyId="story123" />);

    await waitFor(() => {
      const sortSelect = screen.getByTestId('comment-sort');
      fireEvent.change(sortSelect, { target: { value: 'oldest' } });

      // Should trigger re-fetch with new sort order
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/stories/story123/comments?sort=oldest'
      );
    });
  });

  it('shows loading state', () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<CommentSystem storyId="story123" />);

    expect(screen.getByTestId('comments-loading')).toBeInTheDocument();
  });

  it('handles authentication required state', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(<CommentSystem storyId="story123" />);

    expect(screen.getByText('Please log in to comment')).toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText('Share your thoughts about this story...')
    ).not.toBeInTheDocument();
  });

  it('displays nested replies correctly', async () => {
    render(<CommentSystem storyId="story123" />);

    await waitFor(() => {
      expect(
        screen.getByText('Thank you for the feedback!')
      ).toBeInTheDocument();

      // Reply should be indented/nested under parent comment
      const reply = screen
        .getByText('Thank you for the feedback!')
        .closest('[data-testid="comment-reply"]');
      expect(reply).toHaveClass('ml-8'); // Indentation class
    });
  });

  it('shows character count while typing', () => {
    render(<CommentSystem storyId="story123" />);

    const textarea = screen.getByPlaceholderText(
      'Share your thoughts about this story...'
    );
    fireEvent.change(textarea, { target: { value: 'Hello world' } });

    expect(screen.getByText('11 / 1000')).toBeInTheDocument();
  });
});
