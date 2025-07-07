import React from 'react';

interface MentorCommentEmailProps {
  childName: string;
  parentName?: string;
  mentorName: string;
  storyTitle: string;
  storyUrl: string;
  commentPreview: string;
  commentType: 'grammar' | 'creativity' | 'encouragement' | 'suggestion';
  dashboardUrl: string;
  totalComments: number;
  unsubscribeUrl: string;
}

export default function MentorCommentEmail({
  childName,
  parentName,
  mentorName,
  storyTitle,
  storyUrl,
  commentPreview,
  commentType,
  dashboardUrl,
  totalComments,
  unsubscribeUrl,
}: MentorCommentEmailProps) {
  const getCommentTypeInfo = (type: string) => {
    switch (type) {
      case 'grammar':
        return { icon: '✏️', color: '#059669', label: 'Grammar Help' };
      case 'creativity':
        return { icon: '🎨', color: '#7c3aed', label: 'Creativity Boost' };
      case 'encouragement':
        return { icon: '🌟', color: '#f59e0b', label: 'Encouragement' };
      case 'suggestion':
        return { icon: '💡', color: '#3b82f6', label: 'Helpful Suggestion' };
      default:
        return { icon: '💬', color: '#6b7280', label: 'Feedback' };
    }
  };

  const typeInfo = getCommentTypeInfo(commentType);

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>New Teacher Feedback - Mintoons</title>
        <style>{`
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
          }
          
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          
          .header {
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
          }
          
          .mentor-icon {
            width: 70px;
            height: 70px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
          }
          
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
          }
          
          .header p {
            margin: 10px 0 0;
            font-size: 16px;
            opacity: 0.9;
          }
          
          .content {
            padding: 40px 30px;
          }
          
          .greeting {
            font-size: 20px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
          }
          
          .message {
            font-size: 16px;
            color: #4b5563;
            margin-bottom: 30px;
            line-height: 1.7;
          }
          
          .story-info {
            background: #f3f4f6;
            border-radius: 12px;
            padding: 25px;
            margin: 30px 0;
            border-left: 4px solid #3b82f6;
          }
          
          .story-title {
            font-size: 18px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 10px;
          }
          
          .mentor-info {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
          }
          
          .mentor-avatar {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
            margin-right: 12px;
          }
          
          .mentor-details {
            flex: 1;
          }
          
          .mentor-name {
            font-weight: 600;
            color: #1f2937;
            margin: 0;
          }
          
          .mentor-role {
            font-size: 14px;
            color: #6b7280;
            margin: 0;
          }
          
          .comment-preview {
            background: white;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            position: relative;
          }
          
          .comment-type-badge {
            position: absolute;
            top: -10px;
            left: 20px;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            color: white;
          }
          
          .comment-content {
            font-style: italic;
            color: #374151;
            margin-bottom: 15px;
            line-height: 1.6;
          }
          
          .comment-meta {
            font-size: 12px;
            color: #9ca3af;
            border-top: 1px solid #f3f4f6;
            padding-top: 10px;
          }
          
          .cta-section {
            background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
          }
          
          .cta-title {
            font-size: 18px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 15px;
          }
          
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 10px;
            transition: transform 0.2s ease;
          }
          
          .cta-button:hover {
            transform: translateY(-2px);
          }
          
          .secondary-button {
            display: inline-block;
            background: white;
            color: #3b82f6;
            border: 2px solid #3b82f6;
            text-decoration: none;
            padding: 14px 28px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 14px;
            margin: 10px;
          }
          
          .stats-section {
            background: #fef3c7;
            border: 1px solid #fbbf24;
            border-radius: 8px;
            padding: 20px;
            margin: 30px 0;
            text-align: center;
          }
          
          .stats-title {
            font-size: 16px;
            font-weight: 600;
            color: #92400e;
            margin-bottom: 15px;
          }
          
          .stats-content {
            font-size: 14px;
            color: #92400e;
          }
          
          .parent-note {
            background: #fdf4ff;
            border: 1px solid #e879f9;
            border-radius: 8px;
            padding: 20px;
            margin: 30px 0;
          }
          
          .parent-note-title {
            font-size: 16px;
            font-weight: 600;
            color: #a21caf;
            margin-bottom: 10px;
          }
          
          .parent-note-content {
            font-size: 14px;
            color: #86198f;
            line-height: 1.6;
          }
          
          .tips-section {
            background: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 8px;
            padding: 20px;
            margin: 30px 0;
          }
          
          .tips-title {
            font-size: 16px;
            font-weight: 600;
            color: #0369a1;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
          }
          
          .tips-content {
            font-size: 14px;
            color: #0c4a6e;
            line-height: 1.6;
          }
          
          .footer {
            background: #f9fafb;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
          }
          
          .footer-links {
            margin: 20px 0;
          }
          
          .footer-link {
            color: #6b7280;
            text-decoration: none;
            margin: 0 15px;
            font-size: 14px;
          }
          
          .footer-text {
            font-size: 12px;
            color: #9ca3af;
            margin-top: 20px;
          }
          
          .unsubscribe {
            font-size: 11px;
            color: #9ca3af;
            margin-top: 10px;
          }
          
          .unsubscribe a {
            color: #6b7280;
            text-decoration: underline;
          }
          
          @media (max-width: 600px) {
            .email-container {
              margin: 10px;
              border-radius: 8px;
            }
            
            .content {
              padding: 20px;
            }
            
            .cta-button {
              display: block;
              margin: 10px 0;
            }
            
            .mentor-info {
              flex-direction: column;
              text-align: center;
            }
            
            .mentor-avatar {
              margin: 0 0 10px 0;
            }
          }
        `}</style>
      </head>
      <body>
        <div className="email-container">
          {/* Header */}
          <div className="header">
            <div className="mentor-icon">👨‍🏫</div>
            <h1>New Teacher Feedback!</h1>
            <p>Your teacher has shared helpful comments on your story</p>
          </div>

          {/* Main Content */}
          <div className="content">
            <div className="greeting">
              Hi {childName}! 📚
            </div>

            <div className="message">
              Great news! Your teacher {mentorName} has left you some helpful feedback on your 
              story "{storyTitle}". They took time to read your work and share some thoughts 
              to help you become an even better writer!
            </div>

            {/* Story Information */}
            <div className="story-info">
              <div className="story-title">📖 "{storyTitle}"</div>
              
              <div className="mentor-info">
                <div className="mentor-avatar">
                  {mentorName.charAt(0).toUpperCase()}
                </div>
                <div className="mentor-details">
                  <div className="mentor-name">{mentorName}</div>
                  <div className="mentor-role">Your Writing Teacher</div>
                </div>
              </div>
            </div>

            {/* Comment Preview */}
            <div className="comment-preview">
              <div 
                className="comment-type-badge" 
                style={{ backgroundColor: typeInfo.color }}
              >
                {typeInfo.icon} {typeInfo.label}
              </div>
              
              <div className="comment-content">
                "{commentPreview}"
              </div>
              
              <div className="comment-meta">
                {totalComments > 1 && (
                  <span>This is one of {totalComments} comments on your story</span>
                )}
              </div>
            </div>

            {/* Call to Action */}
            <div className="cta-section">
              <div className="cta-title">Ready to see all your feedback?</div>
              <a href={storyUrl} className="cta-button">
                📝 Read Full Feedback
              </a>
              <br />
              <a href={dashboardUrl} className="secondary-button">
                Go to Dashboard
              </a>
            </div>

            {/* Progress Stats */}
            <div className="stats-section">
              <div className="stats-title">
                🎯 Why Teacher Feedback Matters
              </div>
              <div className="stats-content">
                <strong>Did you know?</strong> Students who regularly receive and apply teacher 
                feedback improve their writing skills 3x faster than those who don't. Your 
                teacher's comments are like a map to help you become an amazing storyteller!
              </div>
            </div>

            {/* Tips for Responding */}
            <div className="tips-section">
              <div className="tips-title">
                💡 How to Use This Feedback
              </div>
              <div className="tips-content">
                <strong>1. Read carefully:</strong> Take your time to understand what your teacher is suggesting<br />
                <strong>2. Ask questions:</strong> If something isn't clear, you can ask for more help<br />
                <strong>3. Try it out:</strong> Use the suggestions in your next story<br />
                <strong>4. Celebrate progress:</strong> Remember, every comment helps you grow as a writer!
              </div>
            </div>

            {/* Parent Note */}
            {parentName && (
              <div className="parent-note">
                <div className="parent-note-title">
                  📝 Note for {parentName}:
                </div>
                <div className="parent-note-content">
                  {mentorName} has provided personalized feedback on {childName}'s story "{storyTitle}". 
                  This type of {typeInfo.label.toLowerCase()} helps children develop specific writing 
                  skills. We recommend discussing the feedback with {childName} and celebrating their 
                  progress. Teacher feedback is a crucial part of the learning process on Mintoons!
                </div>
              </div>
            )}

            <div className="message">
              Remember, every piece of feedback is a gift from your teacher to help you grow. 
              They believe in your potential as a storyteller and want to see you succeed! 
              Keep up the fantastic work! 🌟
            </div>

            <div className="message">
              Happy writing!<br />
              <strong>The Mintoons Team</strong>
            </div>
          </div>

          {/* Footer */}
          <div className="footer">
            <div className="footer-links">
              <a href={storyUrl} className="footer-link">View Feedback</a>
              <a href={dashboardUrl} className="footer-link">Dashboard</a>
              <a href="/create-stories" className="footer-link">Write New Story</a>
            </div>
            
            <div className="footer-text">
              Mintoons - AI-Powered Story Writing Platform for Children<br />
              Connecting young writers with caring teacher mentors
            </div>
            
            <div className="unsubscribe">
              You're receiving this email because {childName} received teacher feedback on Mintoons.<br />
              <a href={unsubscribeUrl}>Unsubscribe from feedback notifications</a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}