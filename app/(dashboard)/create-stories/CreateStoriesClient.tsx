'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Book, Wand2, Users, Globe, Lock, ArrowRight, ArrowLeft, Save } from 'lucide-react';
import StoryEditor from '../../components/stories/StoryEditor';
import AICollaborationPanel from '../../components/stories/AICollaborationPanel';

interface StorySettings {
  title: string;
  genre: string;
  targetAge: string;
  visibility: 'private' | 'public' | 'mentors_only';
  allowComments: boolean;
  allowAIAssistance: boolean;
  tags: string[];
}

export default function CreateStoriesClient() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const [settings, setSettings] = useState<StorySettings>({
    title: '',
    genre: 'adventure',
    targetAge: '8-12',
    visibility: 'private',
    allowComments: true,
    allowAIAssistance: true,
    tags: []
  });
  
  const [content, setContent] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [useAIStarter, setUseAIStarter] = useState(false);

  const genres = [
    { value: 'adventure', label: '🗺️ Adventure', description: 'Exciting journeys and quests' },
    { value: 'mystery', label: '🔍 Mystery', description: 'Puzzles and detective stories' },
    { value: 'fantasy', label: '🧙‍♂️ Fantasy', description: 'Magic and mythical creatures' },
    { value: 'science_fiction', label: '🚀 Science Fiction', description: 'Future technology and space' },
    { value: 'friendship', label: '👫 Friendship', description: 'Stories about relationships' },
    { value: 'family', label: '👨‍👩‍👧‍👦 Family', description: 'Family adventures and lessons' },
    { value: 'humor', label: '😄 Comedy', description: 'Funny and lighthearted stories' },
    { value: 'educational', label: '📚 Educational', description: 'Learning through storytelling' }
  ];

  const ageGroups = [
    { value: '5-7', label: '5-7 years', description: 'Early readers' },
    { value: '8-12', label: '8-12 years', description: 'Middle grade' },
    { value: '13-17', label: '13-17 years', description: 'Young adult' },
    { value: 'all', label: 'All ages', description: 'Family friendly' }
  ];

  const storyPrompts = {
    adventure: [
      "A young explorer discovers a hidden map in their grandparent's attic...",
      "Two friends find a mysterious door in their school that leads to...",
      "A child receives a magical compass that always points to adventure..."
    ],
    mystery: [
      "Strange things have been happening in the neighborhood, and only you notice...",
      "A new student arrives with a secret that could change everything...",
      "The school's oldest trophy has gone missing, and all clues point to..."
    ],
    fantasy: [
      "On your 11th birthday, you discover you can speak to animals...",
      "A shooting star crashes in your backyard, bringing with it...",
      "Your reflection in the mirror starts acting independently..."
    ]
  };

  const generateAIStarter = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/stories/ai-collaboration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'story_starter',
          genre: settings.genre,
          targetAge: settings.targetAge,
          customPrompt: customPrompt || undefined,
          context: {
            title: settings.title,
            tags: settings.tags
          }
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setContent(data.starter || '');
        setStep(3); // Jump to editor
      }
    } catch (error) {
      console.error('Error generating AI starter:', error);
      alert('Failed to generate AI story starter. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const saveStory = async (title: string, storyContent: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || settings.title,
          content: storyContent,
          genre: settings.genre,
          targetAge: settings.targetAge,
          visibility: settings.visibility,
          allowComments: settings.allowComments,
          allowAIAssistance: settings.allowAIAssistance,
          tags: settings.tags,
          status: 'draft'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        router.push(`/dashboard/story/${data.story._id}`);
      } else {
        throw new Error('Failed to save story');
      }
    } catch (error) {
      console.error('Error saving story:', error);
      alert('Failed to save story. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAIAssist = async (prompt: string) => {
    // This would be handled by the AICollaborationPanel
    console.log('AI assist requested:', prompt);
  };

  const addTag = (tag: string) => {
    if (tag && !settings.tags.includes(tag)) {
      setSettings(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setSettings(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <Book className="w-16 h-16 mx-auto text-blue-600 mb-4" />
              <h1 className="text-3xl font-bold mb-2">Create Your Story</h1>
              <p className="text-gray-600">Let's start with some basic details about your story.</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Story Title</label>
                <input
                  type="text"
                  value={settings.title}
                  onChange={(e) => setSettings(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter your story title..."
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Genre</label>
                <div className="grid grid-cols-2 gap-3">
                  {genres.map((genre) => (
                    <button
                      key={genre.value}
                      onClick={() => setSettings(prev => ({ ...prev, genre: genre.value }))}
                      className={`p-3 border rounded-lg text-left transition-all ${
                        settings.genre === genre.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{genre.label}</div>
                      <div className="text-sm text-gray-600">{genre.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Target Age Group</label>
                <div className="grid grid-cols-2 gap-3">
                  {ageGroups.map((age) => (
                    <button
                      key={age.value}
                      onClick={() => setSettings(prev => ({ ...prev, targetAge: age.value }))}
                      className={`p-3 border rounded-lg text-left transition-all ${
                        settings.targetAge === age.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{age.label}</div>
                      <div className="text-sm text-gray-600">{age.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <Wand2 className="w-16 h-16 mx-auto text-purple-600 mb-4" />
              <h1 className="text-3xl font-bold mb-2">Choose Your Starting Point</h1>
              <p className="text-gray-600">How would you like to begin writing your story?</p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => setStep(3)}
                className="w-full p-6 bg-white border rounded-lg text-left hover:border-blue-500 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Start from scratch</h3>
                    <p className="text-gray-600">Begin with a blank page and let your imagination flow.</p>
                  </div>
                  <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-blue-500" />
                </div>
              </button>

              <button
                onClick={() => setUseAIStarter(true)}
                className="w-full p-6 bg-white border rounded-lg text-left hover:border-purple-500 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg mb-2 flex items-center">
                      <Wand2 className="w-5 h-5 mr-2 text-purple-600" />
                      AI Story Starter
                    </h3>
                    <p className="text-gray-600">Get AI help to generate an engaging opening for your story.</p>
                  </div>
                  <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-purple-500" />
                </div>
              </button>

              {useAIStarter && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <h4 className="font-medium mb-3">Customize Your AI Starter</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Specific Ideas (Optional)
                      </label>
                      <textarea
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        placeholder="Describe any specific elements you want in your story opening..."
                        className="w-full p-3 border rounded-lg resize-none"
                        rows={3}
                      />
                    </div>

                    {storyPrompts[settings.genre as keyof typeof storyPrompts] && (
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Or choose from these {settings.genre} prompts:
                        </label>
                        <div className="space-y-2">
                          {storyPrompts[settings.genre as keyof typeof storyPrompts].map((prompt, index) => (
                            <button
                              key={index}
                              onClick={() => setCustomPrompt(prompt)}
                              className="w-full p-3 text-left border rounded-lg hover:bg-white hover:border-purple-300 transition-all"
                            >
                              {prompt}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={generateAIStarter}
                      disabled={isLoading}
                      className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center"
                    >
                      <Wand2 className="w-5 h-5 mr-2" />
                      {isLoading ? 'Generating...' : 'Generate Story Starter'}
                    </button>
                  </div>
                </div>
              )}

              <div className="text-center">
                <button
                  onClick={() => setStep(1)}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  ← Go back to story details
                </button>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="h-full flex flex-col">
            <div className="bg-white border-b p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold">{settings.title || 'Untitled Story'}</h1>
                  <p className="text-gray-600 text-sm">
                    {settings.genre} • {settings.targetAge} years
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setStep(4)}
                    className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </button>
                  
                  <button
                    onClick={() => saveStory(settings.title, content)}
                    disabled={isLoading}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Draft</span>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex-1 relative">
              <StoryEditor
                initialTitle={settings.title}
                initialContent={content}
                onSave={saveStory}
                onAIAssist={handleAIAssist}
                isLoading={isLoading}
              />
              
              {settings.allowAIAssistance && (
                <AICollaborationPanel
                  storyContent={content}
                  onInsertText={(text) => setContent(prev => prev + text)}
                  onReplaceText={(oldText, newText) => setContent(prev => prev.replace(oldText, newText))}
                  storyGenre={settings.genre}
                  targetAge={settings.targetAge}
                />
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <Settings className="w-16 h-16 mx-auto text-gray-600 mb-4" />
              <h1 className="text-3xl font-bold mb-2">Story Settings</h1>
              <p className="text-gray-600">Configure who can see and interact with your story.</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border space-y-6">
              <div>
                <label className="block text-sm font-medium mb-3">Visibility</label>
                <div className="space-y-3">
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, visibility: 'private' }))}
                    className={`w-full p-4 border rounded-lg text-left transition-all ${
                      settings.visibility === 'private'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <Lock className="w-5 h-5 mr-2" />
                      <span className="font-medium">Private</span>
                    </div>
                    <p className="text-sm text-gray-600">Only you can see this story</p>
                  </button>

                  <button
                    onClick={() => setSettings(prev => ({ ...prev, visibility: 'mentors_only' }))}
                    className={`w-full p-4 border rounded-lg text-left transition-all ${
                      settings.visibility === 'mentors_only'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <Users className="w-5 h-5 mr-2" />
                      <span className="font-medium">Mentors Only</span>
                    </div>
                    <p className="text-sm text-gray-600">Share with mentors for feedback</p>
                  </button>

                  <button
                    onClick={() => setSettings(prev => ({ ...prev, visibility: 'public' }))}
                    className={`w-full p-4 border rounded-lg text-left transition-all ${
                      settings.visibility === 'public'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <Globe className="w-5 h-5 mr-2" />
                      <span className="font-medium">Public</span>
                    </div>
                    <p className="text-sm text-gray-600">Anyone can read this story</p>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium">Allow Comments</label>
                    <p className="text-sm text-gray-600">Let others comment on your story</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.allowComments}
                      onChange={(e) => setSettings(prev => ({ ...prev, allowComments: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium">AI Assistance</label>
                    <p className="text-sm text-gray-600">Enable AI writing help while editing</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.allowAIAssistance}
                      onChange={(e) => setSettings(prev => ({ ...prev, allowAIAssistance: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tags</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {settings.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Add a tag..."
                    className="flex-1 p-2 border rounded"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addTag((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = (e.target as HTMLElement).parentElement?.querySelector('input');
                      if (input) {
                        addTag(input.value);
                        input.value = '';
                      }
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Add
                  </button>
                </div>
                
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-2">Popular tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {['friendship', 'magic', 'school', 'family', 'pets', 'adventure'].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => addTag(tag)}
                        className="px-2 py-1 text-sm border rounded hover:bg-gray-50"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Bar */}
      {step < 4 && (
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {[1, 2, 3].map((stepNumber) => (
                  <div key={stepNumber} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step >= stepNumber
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {stepNumber}
                    </div>
                    {stepNumber < 3 && (
                      <div
                        className={`w-8 h-1 mx-2 ${
                          step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
              
              <div className="text-sm text-gray-600">
                Step {step} of 3: {
                  step === 1 ? 'Story Details' :
                  step === 2 ? 'Writing Method' :
                  'Write & Edit'
                }
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className={`${step === 3 ? 'h-screen' : 'p-8'}`}>
        {renderStep()}
      </div>

      {/* Navigation */}
      {step < 3 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
          <div className="max-w-2xl mx-auto flex justify-between">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              onClick={() => {
                if (step === 1 && !settings.title.trim()) {
                  alert('Please enter a story title');
                  return;
                }
                setStep(step + 1);
              }}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <span>{step === 2 ? 'Start Writing' : 'Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
          <div className="max-w-2xl mx-auto flex justify-between">
            <button
              onClick={() => setStep(3)}
              className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Editor</span>
            </button>

            <button
              onClick={() => {
                setStep(3);
                // Settings are automatically saved in state
              }}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <span>Apply Settings</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}