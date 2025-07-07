import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import '@testing-library/jest-dom';
import StoryEditor from '../app/components/stories/StoryEditor';

// Mock next-auth
jest.mock('next-auth/react');
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

// Mock fetch
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Save: ({ className, ...props }: any) => <div className={className} data-testid="save-icon" {...props} />,
  Eye: ({ className, ...props }: any) => <div className={className} data-testid="eye-icon" {...props} />,
  Wand2: ({ className, ...props }: any) => <div className={className} data-testid="wand-icon" {...props} />,
  Mic: ({ className, ...props }: any) => <div className={className} data-testid="mic-icon" {...props} />,
  MicOff: ({ className, ...props }: any) => <div className={className} data-testid="mic-off-icon" {...props} />,
  Download: ({ className, ...props }: any) => <div className={className} data-testid="download-icon" {...props} />,
  Share: ({ className, ...props }: any) => <div className={className} data-testid="share-icon" {...props} />,
  Settings: ({ className, ...props }: any) => <div className={className} data-testid="settings-icon" {...props} />
}));

// Mock speech recognition
const mockSpeechRecognition = {
  start: jest.fn(),
  stop: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  continuous: false,
  interimResults: false,
  lang: 'en-US'
};

Object.defineProperty(window, 'SpeechRecognition', {
  writable: true,
  value: jest.fn().mockImplementation(() => mockSpeechRecognition)
});

Object.defineProperty(window, 'webkitSpeechRecognition', {
  writable: true,
  value: jest.fn().mockImplementation(() => mockSpeechRecognition)
});

describe('StoryEditor', () => {
  const defaultProps = {
    onSave: jest.fn(),
    onPreview: jest.fn(),
    initialTitle: '',
    initialContent: ''
  };

  const defaultSession = {
    data: {
      user: {
        id: 'student1',
        name: 'Alex Student',
        email: 'alex@example.com',
        role: 'student'
      }
    },
    status: 'authenticated' as const
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue(defaultSession);
    
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ suggestions: [] })
    } as Response);
  });

  describe('Rendering', () => {
    it('renders the story editor interface', () => {
      render(<StoryEditor {...defaultProps} />);

      expect(screen.getByPlaceholderText('Story Title')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Start writing your story...')).toBeInTheDocument();
      expect(screen.getByTestId('save-icon')).toBeInTheDocument();
      expect(screen.getByTestId('eye-icon')).toBeInTheDocument();
    });

    it('populates fields with initial values', () => {
      const props = {
        ...defaultProps,
        initialTitle: 'My Adventure',
        initialContent: 'Once upon a time...'
      };

      render(<StoryEditor {...props} />);

      expect(screen.getByDisplayValue('My Adventure')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Once upon a time...')).toBeInTheDocument();
    });

    it('shows word count and reading time', () => {
      render(<StoryEditor {...defaultProps} />);

      const textarea = screen.getByPlaceholderText('Start writing your story...');
      fireEvent.change(textarea, { target: { value: 'This is a test story with multiple words.' } });

      expect(screen.getByText(/8 words/)).toBeInTheDocument();
      expect(screen.getByText(/< 1 min read/)).toBeInTheDocument();
    });
  });

  describe('Content Input', () => {
    it('updates content when typing', () => {
      render(<StoryEditor {...defaultProps} />);

      const titleInput = screen.getByPlaceholderText('Story Title');
      const contentTextarea = screen.getByPlaceholderText('Start writing your story...');

      fireEvent.change(titleInput, { target: { value: 'New Story Title' } });
      fireEvent.change(contentTextarea, { target: { value: 'New story content' } });

      expect(titleInput).toHaveValue('New Story Title');
      expect(contentTextarea).toHaveValue('New story content');
    });

    it('handles long content appropriately', () => {
      render(<StoryEditor {...defaultProps} />);

      const textarea = screen.getByPlaceholderText('Start writing your story...');
      const longContent = 'word '.repeat(1000); // 1000 words

      fireEvent.change(textarea, { target: { value: longContent } });

      expect(screen.getByText(/1000 words/)).toBeInTheDocument();
      expect(screen.getByText(/4 min read/)).toBeInTheDocument();
    });

    it('validates content length', () => {
      render(<StoryEditor {...defaultProps} />);

      const textarea = screen.getByPlaceholderText('Start writing your story...');
      const veryLongContent = 'a'.repeat(10001); // Exceeds limit

      fireEvent.change(textarea, { target: { value: veryLongContent } });

      expect(screen.getByText('Story is too long (max 10,000 characters)')).toBeInTheDocument();
    });
  });

  describe('Auto-save Functionality', () => {
    it('auto-saves content after typing stops', async () => {
      jest.useFakeTimers();
      
      render(<StoryEditor {...defaultProps} storyId="story123" />);

      const textarea = screen.getByPlaceholderText('Start writing your story...');
      fireEvent.change(textarea, { target: { value: 'Auto-save test content' } });

      // Fast-forward time to trigger auto-save
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/stories/story123',
          expect.objectContaining({
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: expect.stringContaining('Auto-save test content')
          })
        );
      });

      jest.useRealTimers();
    });

    it('shows auto-save status', async () => {
      jest.useFakeTimers();
      
      render(<StoryEditor {...defaultProps} storyId="story123" />);

      const textarea = screen.getByPlaceholderText('Start writing your story...');
      fireEvent.change(textarea, { target: { value: 'Content to save' } });

      expect(screen.getByText('Saving...')).toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(screen.getByText('Saved')).toBeInTheDocument();
      });

      jest.useRealTimers();
    });
  });

  describe('Voice Input', () => {
    it('starts voice recognition when mic button clicked', () => {
      render(<StoryEditor {...defaultProps} />);

      const micButton = screen.getByRole('button', { name: /voice input/i });
      fireEvent.click(micButton);

      expect(mockSpeechRecognition.start).toHaveBeenCalled();
      expect(screen.getByTestId('mic-off-icon')).toBeInTheDocument();
    });

    it('stops voice recognition and updates content', () => {
      render(<StoryEditor {...defaultProps} />);

      const micButton = screen.getByRole('button', { name: /voice input/i });
      fireEvent.click(micButton); // Start recording
      fireEvent.click(micButton); // Stop recording

      expect(mockSpeechRecognition.stop).toHaveBeenCalled();
      expect(screen.getByTestId('mic-icon')).toBeInTheDocument();
    });

    it('handles speech recognition results', () => {
      render(<StoryEditor {...defaultProps} />);

      const micButton = screen.getByRole('button', { name: /voice input/i });
      fireEvent.click(micButton);

      // Simulate speech recognition result
      const mockEvent = {
        results: [
          {
            0: { transcript: 'This is spoken text' },
            isFinal: true
          }
        ]
      };

      const addEventListenerCalls = mockSpeechRecognition.addEventListener.mock.calls;
      const resultHandler = addEventListenerCalls.find(call => call[0] === 'result')?.[1];
      
      if (resultHandler) {
        resultHandler(mockEvent);
      }

      const textarea = screen.getByPlaceholderText('Start writing your story...');
      expect(textarea).toHaveValue('This is spoken text');
    });
  });

  describe('AI Assistance', () => {
    it('shows AI assistance panel when enabled', () => {
      render(<StoryEditor {...defaultProps} showAIAssistance />);

      expect(screen.getByTestId('wand-icon')).toBeInTheDocument();
      expect(screen.getByText('AI Assistant')).toBeInTheDocument();
    });

    it('requests AI suggestions for content', async () => {
      const aiSuggestions = [
        'The mysterious door creaked open...',
        'She discovered a hidden treasure...',
        'The dragon roared in the distance...'
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ suggestions: aiSuggestions })
      } as Response);

      render(<StoryEditor {...defaultProps} showAIAssistance />);

      const textarea = screen.getByPlaceholderText('Start writing your story...');
      fireEvent.change(textarea, { target: { value: 'Once upon a time' } });

      const aiButton = screen.getByRole('button', { name: /get ai suggestions/i });
      fireEvent.click(aiButton);

      await waitFor(() => {
        expect(screen.getByText('The mysterious door creaked open...')).toBeInTheDocument();
      });
    });

    it('inserts AI suggestions into content', async () => {
      const aiSuggestions = ['The adventure begins now.'];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ suggestions: aiSuggestions })
      } as Response);

      render(<StoryEditor {...defaultProps} showAIAssistance />);

      const textarea = screen.getByPlaceholderText('Start writing your story...');
      fireEvent.change(textarea, { target: { value: 'Start of story. ' } });

      const aiButton = screen.getByRole('button', { name: /get ai suggestions/i });
      fireEvent.click(aiButton);

      await waitFor(() => {
        expect(screen.getByText('The adventure begins now.')).toBeInTheDocument();
      });

      const insertButton = screen.getByRole('button', { name: /insert suggestion/i });
      fireEvent.click(insertButton);

      expect(textarea).toHaveValue('Start of story. The adventure begins now.');
    });
  });

  describe('Save and Preview', () => {
    it('calls onSave when save button clicked', () => {
      const mockOnSave = jest.fn();
      render(<StoryEditor {...defaultProps} onSave={mockOnSave} />);

      const titleInput = screen.getByPlaceholderText('Story Title');
      const textarea = screen.getByPlaceholderText('Start writing your story...');

      fireEvent.change(titleInput, { target: { value: 'Test Story' } });
      fireEvent.change(textarea, { target: { value: 'Test content' } });

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      expect(mockOnSave).toHaveBeenCalledWith({
        title: 'Test Story',
        content: 'Test content'
      });
    });

    it('calls onPreview when preview button clicked', () => {
      const mockOnPreview = jest.fn();
      render(<StoryEditor {...defaultProps} onPreview={mockOnPreview} />);

      const titleInput = screen.getByPlaceholderText('Story Title');
      const textarea = screen.getByPlaceholderText('Start writing your story...');

      fireEvent.change(titleInput, { target: { value: 'Preview Story' } });
      fireEvent.change(textarea, { target: { value: 'Preview content' } });

      const previewButton = screen.getByRole('button', { name: /preview/i });
      fireEvent.click(previewButton);

      expect(mockOnPreview).toHaveBeenCalledWith({
        title: 'Preview Story',
        content: 'Preview content'
      });
    });

    it('prevents saving empty stories', () => {
      const mockOnSave = jest.fn();
      render(<StoryEditor {...defaultProps} onSave={mockOnSave} />);

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      expect(mockOnSave).not.toHaveBeenCalled();
      expect(screen.getByText('Please add a title and content')).toBeInTheDocument();
    });
  });

  describe('Formatting Tools', () => {
    it('applies bold formatting', () => {
      render(<StoryEditor {...defaultProps} />);

      const textarea = screen.getByPlaceholderText('Start writing your story...');
      const boldButton = screen.getByRole('button', { name: /bold/i });

      // Select some text and apply bold
      fireEvent.change(textarea, { target: { value: 'This is text' } });
      textarea.setSelectionRange(5, 7); // Select "is"
      fireEvent.click(boldButton);

      expect(textarea).toHaveValue('This **is** text');
    });

    it('applies italic formatting', () => {
      render(<StoryEditor {...defaultProps} />);

      const textarea = screen.getByPlaceholderText('Start writing your story...');
      const italicButton = screen.getByRole('button', { name: /italic/i });

      fireEvent.change(textarea, { target: { value: 'This is text' } });
      textarea.setSelectionRange(5, 7); // Select "is"
      fireEvent.click(italicButton);

      expect(textarea).toHaveValue('This *is* text');
    });

    it('adds paragraph breaks', () => {
      render(<StoryEditor {...defaultProps} />);

      const textarea = screen.getByPlaceholderText('Start writing your story...');
      const paragraphButton = screen.getByRole('button', { name: /new paragraph/i });

      fireEvent.change(textarea, { target: { value: 'First paragraph' } });
      textarea.setSelectionRange(15, 15); // End of text
      fireEvent.click(paragraphButton);

      expect(textarea).toHaveValue('First paragraph\n\n');
    });
  });

  describe('Export and Share', () => {
    it('exports story as PDF', async () => {
      const mockBlob = new Blob(['PDF content'], { type: 'application/pdf' });
      global.URL.createObjectURL = jest.fn().mockReturnValue('blob:url');
      
      render(<StoryEditor {...defaultProps} />);

      const titleInput = screen.getByPlaceholderText('Story Title');
      const textarea = screen.getByPlaceholderText('Start writing your story...');

      fireEvent.change(titleInput, { target: { value: 'Export Story' } });
      fireEvent.change(textarea, { target: { value: 'Story to export' } });

      const exportButton = screen.getByRole('button', { name: /export/i });
      fireEvent.click(exportButton);

      const pdfOption = screen.getByRole('button', { name: /export as pdf/i });
      fireEvent.click(pdfOption);

      // Verify download link creation
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });

    it('shares story link', async () => {
      const mockShare = jest.fn();
      Object.defineProperty(navigator, 'share', {
        writable: true,
        value: mockShare
      });

      render(<StoryEditor {...defaultProps} storyId="story123" />);

      const shareButton = screen.getByRole('button', { name: /share/i });
      fireEvent.click(shareButton);

      expect(mockShare).toHaveBeenCalledWith({
        title: expect.any(String),
        url: expect.stringContaining('story123')
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<StoryEditor {...defaultProps} />);

      expect(screen.getByLabelText('Story title')).toBeInTheDocument();
      expect(screen.getByLabelText('Story content')).toBeInTheDocument();
    });

    it('supports keyboard shortcuts', () => {
      render(<StoryEditor {...defaultProps} />);

      const textarea = screen.getByPlaceholderText('Start writing your story...');
      
      // Test Ctrl+S for save
      fireEvent.keyDown(textarea, { key: 's', ctrlKey: true });
      
      // Should trigger save functionality
      expect(screen.getByText('Keyboard shortcut: Ctrl+S to save')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles save errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Save failed'));

      render(<StoryEditor {...defaultProps} storyId="story123" />);

      const textarea = screen.getByPlaceholderText('Start writing your story...');
      fireEvent.change(textarea, { target: { value: 'Content that will fail to save' } });

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to save story')).toBeInTheDocument();
      });
    });

    it('handles AI suggestion errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('AI service unavailable'));

      render(<StoryEditor {...defaultProps} showAIAssistance />);

      const aiButton = screen.getByRole('button', { name: /get ai suggestions/i });
      fireEvent.click(aiButton);

      await waitFor(() => {
        expect(screen.getByText('AI suggestions unavailable')).toBeInTheDocument();
      });
    });
  });
});