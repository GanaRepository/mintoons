'use client';

import React, { useState } from 'react';
import { Eye, Code, Send, Smartphone, Monitor } from 'lucide-react';
import EmailTemplate from './EmailTemplate';

interface EmailPreviewProps {
  type: 'welcome' | 'password-reset' | 'story-published' | 'mentor-feedback' | 'achievement' | 'admin-user-created';
  data?: any;
  onSend?: (emailData: any) => void;
}

export default function EmailPreview({ type, data, onSend }: EmailPreviewProps) {
  const [viewMode, setViewMode] = useState<'preview' | 'html'>('preview');
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('desktop');
  const [testEmail, setTestEmail] = useState('');

  // Default data for preview if none provided
  const defaultData = {
    welcome: {
      name: 'Sarah',
      email: 'sarah@example.com'
    },
    'password-reset': {
      name: 'John',
      email: 'john@example.com',
      resetUrl: 'https://mintoons.com/reset-password?token=abc123'
    },
    'story-published': {
      name: 'Emma',
      email: 'emma@example.com',
      storyTitle: 'The Magical Adventure',
      storyUrl: 'https://mintoons.com/story/123'
    },
    'mentor-feedback': {
      name: 'Alex',
      email: 'alex@example.com',
      storyTitle: 'The Secret Garden',
      storyUrl: 'https://mintoons.com/story/456',
      mentorName: 'Ms. Johnson',
      feedbackMessage: 'Great work on the character development! I love how you described the main character\'s emotions...'
    },
    achievement: {
      name: 'Maya',
      email: 'maya@example.com',
      achievementTitle: 'First Story Published',
      achievementDescription: 'You\'ve successfully published your very first story! This is just the beginning of your writing journey.'
    },
    'admin-user-created': {
      name: 'David Wilson',
      email: 'david@example.com',
      role: 'mentor',
      tempPassword: 'TempPass123!',
      loginUrl: 'https://mintoons.com/login'
    }
  };

  const emailData = data || defaultData[type];

  const handleSendTest = () => {
    if (!testEmail) {
      alert('Please enter a test email address');
      return;
    }

    if (onSend) {
      onSend({
        to: testEmail,
        type,
        data: emailData
      });
    }
  };

  const getHtmlContent = () => {
    // This would render the EmailTemplate to HTML string
    // For now, we'll show a placeholder
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mintoons Email</title>
</head>
<body>
    <!-- EmailTemplate component would be rendered here -->
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <!-- Email content would be generated from the React component -->
    </div>
</body>
</html>`;
  };

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold capitalize">
              {type.replace('-', ' ')} Email
            </h3>
            
            {/* View Mode Toggle */}
            <div className="flex rounded-lg border p-1">
              <button
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1 text-sm rounded ${
                  viewMode === 'preview' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Eye className="w-4 h-4 inline mr-1" />
                Preview
              </button>
              <button
                onClick={() => setViewMode('html')}
                className={`px-3 py-1 text-sm rounded ${
                  viewMode === 'html' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Code className="w-4 h-4 inline mr-1" />
                HTML
              </button>
            </div>

            {/* Device View Toggle */}
            {viewMode === 'preview' && (
              <div className="flex rounded-lg border p-1">
                <button
                  onClick={() => setDeviceView('desktop')}
                  className={`px-3 py-1 text-sm rounded ${
                    deviceView === 'desktop' 
                      ? 'bg-gray-600 text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Monitor className="w-4 h-4 inline mr-1" />
                  Desktop
                </button>
                <button
                  onClick={() => setDeviceView('mobile')}
                  className={`px-3 py-1 text-sm rounded ${
                    deviceView === 'mobile' 
                      ? 'bg-gray-600 text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Smartphone className="w-4 h-4 inline mr-1" />
                  Mobile
                </button>
              </div>
            )}
          </div>

          {/* Test Email */}
          <div className="flex items-center space-x-2">
            <input
              type="email"
              placeholder="test@example.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="px-3 py-1 border rounded text-sm w-48"
            />
            <button
              onClick={handleSendTest}
              className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
            >
              <Send className="w-4 h-4" />
              <span>Send Test</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {viewMode === 'preview' ? (
          <div className="flex justify-center">
            <div 
              className={`border rounded-lg overflow-hidden transition-all ${
                deviceView === 'mobile' 
                  ? 'w-80' 
                  : 'w-full max-w-2xl'
              }`}
              style={{ 
                minHeight: '400px',
                backgroundColor: '#f8fafc' 
              }}
            >
              {/* Mock Email Client Header */}
              <div className="bg-gray-100 p-3 border-b text-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Mintoons Team &lt;noreply@mintoons.com&gt;</div>
                    <div className="text-gray-600">to: {emailData.email || 'user@example.com'}</div>
                  </div>
                  <div className="text-gray-500 text-xs">
                    {new Date().toLocaleString()}
                  </div>
                </div>
                <div className="mt-2 font-medium">
                  Subject: {getEmailSubject(type)}
                </div>
              </div>

              {/* Email Content */}
              <div className="bg-white">
                <EmailTemplate type={type} data={emailData} />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm">
              <code>{getHtmlContent()}</code>
            </pre>
          </div>
        )}
      </div>

      {/* Email Data */}
      <div className="p-4 border-t bg-gray-50">
        <h4 className="font-medium mb-2">Email Data:</h4>
        <div className="bg-gray-100 rounded p-3 text-sm font-mono">
          <pre>{JSON.stringify(emailData, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}

function getEmailSubject(type: string): string {
  switch (type) {
    case 'welcome':
      return 'Welcome to Mintoons! 🎉';
    case 'password-reset':
      return 'Reset your Mintoons password';
    case 'story-published':
      return 'Your story is now live! 📚';
    case 'mentor-feedback':
      return 'New feedback on your story 📝';
    case 'achievement':
      return 'Achievement unlocked! 🏆';
    case 'admin-user-created':
      return 'Your Mintoons account has been created';
    default:
      return 'Mintoons Notification';
  }
}