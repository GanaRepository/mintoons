'use client';

import React, { useState, useEffect } from 'react';
import { Bot, Send, Lightbulb, RefreshCw, Star, ThumbsUp, ThumbsDown, Copy } from 'lucide-react';

interface AICollaborationPanelProps {
  storyContent: string;
  onInsertText: (text: string) => void;
  onReplaceText: (oldText: string, newText: string) => void;
  storyGenre?: string;
  targetAge?: string;
}

interface AISuggestion {
  id: string;
  type: 'continuation' | 'improvement' | 'character' | 'plot' | 'dialogue';
  content: string;
  context?: string;
  rating?: number;
}

export default function AICollaborationPanel({
  storyContent,
  onInsertText,
  onReplaceText,
  storyGenre = 'adventure',
  targetAge = '8-12'
}: AICollaborationPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'suggestions' | 'prompts' | 'feedback'>('suggestions');
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedText, setSelectedText] = useState('');
  
  const predefinedPrompts = [
    {
      category: 'Story Development',
      prompts: [
        'Continue this story with an exciting plot twist',
        'Add more descriptive details to this scene',
        'Introduce a new character who creates conflict',
        'Develop the relationship between the main characters',
        'Add dialogue to make this scene more engaging'
      ]
    },
    {
      category: 'Character Development',
      prompts: [
        'Describe what the main character is thinking',
        'Show the character\'s emotions through actions',
        'Add a character flaw that creates problems',
        'Give the character a unique way of speaking',
        'Show how the character has grown or changed'
      ]
    },
    {
      category: 'World Building',
      prompts: [
        'Describe the setting in more detail',
        'Add sensory details (sounds, smells, textures)',
        'Create atmosphere that matches the mood',
        'Introduce an interesting location',
        'Add cultural or historical details'
      ]
    }
  ];
  
  const generateSuggestions = async (type: string, prompt?: string) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/stories/ai-collaboration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyContent,
          selectedText,
          type,
          prompt,
          genre: storyGenre,
          targetAge,
          context: {
            wordCount: storyContent.split(' ').length,
            lastParagraph: storyContent.split('\n\n').slice(-1)[0]
          }
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCustomPrompt = async () => {
    if (!customPrompt.trim()) return;
    await generateSuggestions('custom', customPrompt);
    setCustomPrompt('');
  };
  
  const rateSuggestion = async (suggestionId: string, rating: number) => {
    setSuggestions(prev => 
      prev.map(s => s.id === suggestionId ? { ...s, rating } : s)
    );
    
    // Send rating to backend for learning
    try {
      await fetch('/api/stories/ai-collaboration/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suggestionId, rating, storyContent })
      });
    } catch (error) {
      console.error('Error rating suggestion:', error);
    }
  };
  
  const copySuggestion = (suggestion: AISuggestion) => {
    navigator.clipboard.writeText(suggestion.content);
    // You could add a toast notification here
  };
  
  const insertSuggestion = (suggestion: AISuggestion) => {
    onInsertText(suggestion.content);
  };
  
  useEffect(() => {
    if (isOpen && suggestions.length === 0) {
      generateSuggestions('continuation');
    }
  }, [isOpen]);

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed right-4 top-1/2 transform -translate-y-1/2 z-50 p-3 rounded-l-lg shadow-lg transition-all ${
          isOpen ? 'bg-purple-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
        }`}
      >
        <Bot className="w-5 h-5" />
      </button>
      
      {/* AI Panel */}
      {isOpen && (
        <div className="fixed right-0 top-0 h-full w-80 bg-white border-l shadow-lg z-40 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bot className="w-5 h-5" />
                <h3 className="font-semibold">AI Writing Assistant</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200"
              >
                ×
              </button>
            </div>
            
            {/* Tabs */}
            <div className="flex space-x-1 mt-3">
              {['suggestions', 'prompts', 'feedback'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-3 py-1 rounded text-sm capitalize ${
                    activeTab === tab 
                      ? 'bg-white text-purple-600' 
                      : 'text-white hover:bg-white hover:bg-opacity-20'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'suggestions' && (
              <div className="p-4">
                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button
                    onClick={() => generateSuggestions('continuation')}
                    disabled={isLoading}
                    className="p-2 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
                  >
                    Continue Story
                  </button>
                  <button
                    onClick={() => generateSuggestions('improvement')}
                    disabled={isLoading}
                    className="p-2 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
                  >
                    Improve Text
                  </button>
                  <button
                    onClick={() => generateSuggestions('character')}
                    disabled={isLoading}
                    className="p-2 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
                  >
                    Add Character
                  </button>
                  <button
                    onClick={() => generateSuggestions('dialogue')}
                    disabled={isLoading}
                    className="p-2 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
                  >
                    Add Dialogue
                  </button>
                </div>
                
                {/* Loading */}
                {isLoading && (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin text-purple-600" />
                    <span className="ml-2 text-gray-600">Generating suggestions...</span>
                  </div>
                )}
                
                {/* Suggestions */}
                <div className="space-y-3">
                  {suggestions.map((suggestion) => (
                    <div key={suggestion.id} className="border rounded-lg p-3 hover:bg-gray-50">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs font-medium text-purple-600 capitalize">
                          {suggestion.type}
                        </span>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => copySuggestion(suggestion)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-3">{suggestion.content}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-1">
                          <button
                            onClick={() => rateSuggestion(suggestion.id, 1)}
                            className={`p-1 rounded ${
                              suggestion.rating === 1 ? 'text-green-600' : 'text-gray-400 hover:text-green-600'
                            }`}
                          >
                            <ThumbsUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => rateSuggestion(suggestion.id, -1)}
                            className={`p-1 rounded ${
                              suggestion.rating === -1 ? 'text-red-600' : 'text-gray-400 hover:text-red-600'
                            }`}
                          >
                            <ThumbsDown className="w-3 h-3" />
                          </button>
                        </div>
                        
                        <button
                          onClick={() => insertSuggestion(suggestion)}
                          className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700"
                        >
                          Insert
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeTab === 'prompts' && (
              <div className="p-4">
                {/* Custom Prompt */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Custom Request</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="Ask AI to help with..."
                      className="flex-1 p-2 border rounded text-sm"
                      onKeyPress={(e) => e.key === 'Enter' && handleCustomPrompt()}
                    />
                    <button
                      onClick={handleCustomPrompt}
                      disabled={!customPrompt.trim() || isLoading}
                      className="p-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Predefined Prompts */}
                {predefinedPrompts.map((category) => (
                  <div key={category.category} className="mb-4">
                    <h4 className="font-medium text-sm mb-2">{category.category}</h4>
                    <div className="space-y-1">
                      {category.prompts.map((prompt, index) => (
                        <button
                          key={index}
                          onClick={() => generateSuggestions('custom', prompt)}
                          className="w-full text-left p-2 text-sm border rounded hover:bg-gray-50"
                        >
                          <Lightbulb className="w-3 h-3 inline mr-2 text-yellow-500" />
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {activeTab === 'feedback' && (
              <div className="p-4">
                <div className="text-center py-8">
                  <Star className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                  <h4 className="font-medium mb-2">Story Feedback</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Get AI feedback on your story's strengths and areas for improvement.
                  </p>
                  <button
                    onClick={() => generateSuggestions('feedback')}
                    disabled={isLoading}
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
                  >
                    Analyze Story
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="border-t p-3 bg-gray-50">
            <div className="text-xs text-gray-600 text-center">
              🤖 AI suggestions are creative tools. Always review before using!
            </div>
          </div>
        </div>
      )}
    </div>
  );
}