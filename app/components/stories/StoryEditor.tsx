'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Save, Eye, Wand2, Mic, MicOff, Download, Share, Settings } from 'lucide-react';

interface StoryEditorProps {
  storyId?: string;
  initialTitle?: string;
  initialContent?: string;
  onSave?: (title: string, content: string) => void;
  onAIAssist?: (prompt: string) => void;
  isLoading?: boolean;
}

export default function StoryEditor({
  storyId,
  initialTitle = '',
  initialContent = '',
  onSave,
  onAIAssist,
  isLoading = false
}: StoryEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [wordCount, setWordCount] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  
  // Auto-save functionality
  useEffect(() => {
    if (autoSave && (title || content)) {
      const timer = setTimeout(() => {
        handleSave();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [title, content, autoSave]);
  
  // Word count
  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [content]);
  
  const handleSave = async () => {
    if (onSave) {
      await onSave(title, content);
      setLastSaved(new Date());
    }
  };
  
  const handleAIAssist = () => {
    const selectedText = contentRef.current?.value.substring(
      contentRef.current.selectionStart,
      contentRef.current.selectionEnd
    ) || '';
    
    const prompt = selectedText || 'Continue this story...';
    if (onAIAssist) {
      onAIAssist(prompt);
    }
  };
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const audioChunks: BlobPart[] = [];
      
      mediaRecorder.addEventListener('dataavailable', (event) => {
        audioChunks.push(event.data);
      });
      
      mediaRecorder.addEventListener('stop', () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        // Here you would typically send the audio to a speech-to-text service
        console.log('Audio recorded:', audioBlob);
      });
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not start recording. Please check microphone permissions.');
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };
  
  const insertText = (text: string) => {
    const textarea = contentRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.substring(0, start) + text + content.substring(end);
      setContent(newContent);
      
      // Restore cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + text.length, start + text.length);
      }, 0);
    }
  };
  
  const formatText = (format: string) => {
    const textarea = contentRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = content.substring(start, end);
      
      let formattedText = '';
      switch (format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `*${selectedText}*`;
          break;
        case 'quote':
          formattedText = `"${selectedText}"`;
          break;
        default:
          formattedText = selectedText;
      }
      
      const newContent = content.substring(0, start) + formattedText + content.substring(end);
      setContent(newContent);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>
          
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            <Eye className="w-4 h-4" />
            <span>Preview</span>
          </button>
          
          <button
            onClick={handleAIAssist}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Wand2 className="w-4 h-4" />
            <span>AI Assist</span>
          </button>
          
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              isRecording 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'border border-gray-300 hover:bg-gray-100'
            }`}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            <span>{isRecording ? 'Stop' : 'Record'}</span>
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            {wordCount} words
          </div>
          
          {lastSaved && (
            <div className="text-xs text-gray-500">
              Saved {lastSaved.toLocaleTimeString()}
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={autoSave}
                onChange={(e) => setAutoSave(e.target.checked)}
                className="rounded"
              />
              <span>Auto-save</span>
            </label>
          </div>
        </div>
      </div>
      
      {/* Formatting Toolbar */}
      <div className="flex items-center space-x-2 p-2 border-b bg-gray-50">
        <button
          onClick={() => formatText('bold')}
          className="px-3 py-1 text-sm font-bold border rounded hover:bg-gray-100"
        >
          B
        </button>
        <button
          onClick={() => formatText('italic')}
          className="px-3 py-1 text-sm italic border rounded hover:bg-gray-100"
        >
          I
        </button>
        <button
          onClick={() => formatText('quote')}
          className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
        >
          "
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-2" />
        
        <button
          onClick={() => insertText('\n\n---\n\n')}
          className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
        >
          Page Break
        </button>
        
        <button
          onClick={() => insertText('\n\n')}
          className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
        >
          Paragraph
        </button>
      </div>
      
      <div className="flex-1 flex">
        {/* Editor */}
        <div className={`${showPreview ? 'w-1/2' : 'w-full'} flex flex-col`}>
          <input
            type="text"
            placeholder="Story Title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="p-4 text-2xl font-bold border-b focus:outline-none focus:border-blue-500"
          />
          
          <textarea
            ref={contentRef}
            placeholder="Once upon a time..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 p-4 resize-none focus:outline-none"
            style={{ fontFamily: 'Georgia, serif', fontSize: '16px', lineHeight: '1.6' }}
          />
        </div>
        
        {/* Preview */}
        {showPreview && (
          <div className="w-1/2 border-l bg-gray-50">
            <div className="p-4 border-b bg-white">
              <h3 className="font-semibold">Preview</h3>
            </div>
            <div className="p-4 h-full overflow-y-auto">
              <h1 className="text-3xl font-bold mb-6">{title || 'Untitled Story'}</h1>
              <div 
                className="prose prose-lg max-w-none"
                style={{ fontFamily: 'Georgia, serif' }}
                dangerouslySetInnerHTML={{
                  __html: content
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/\n\n---\n\n/g, '<hr class="my-8" />')
                    .replace(/\n\n/g, '</p><p>')
                    .replace(/^/, '<p>')
                    .replace(/$/, '</p>')
                }}
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Writing Stats */}
      <div className="border-t bg-gray-50 p-2">
        <div className="flex justify-between items-center text-xs text-gray-600">
          <div className="flex space-x-4">
            <span>Characters: {content.length}</span>
            <span>Words: {wordCount}</span>
            <span>Paragraphs: {content.split('\n\n').filter(p => p.trim()).length}</span>
          </div>
          
          <div className="flex space-x-2">
            <span>Reading time: ~{Math.ceil(wordCount / 200)} min</span>
          </div>
        </div>
      </div>
    </div>
  );
}