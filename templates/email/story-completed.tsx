import React from 'react';

interface StoryCompletedEmailProps {
  childName: string;
  parentName?: string;
  storyTitle: string;
  storyUrl: string;
  dashboardUrl: string;
  aiAssessment: {
    grammarScore: number;
    creativityScore: number;
    overallScore: number;
    feedback: string;
    strengths: string[];
  };
  storyStats: {
    wordCount: number;
    timeSpent: string;
    totalStories: number;
  };
  nextSteps: string[];
  unsubscribeUrl: string;
}

export default function StoryCompletedEmail({
  childName,
  parentName,
  storyTitle,
  storyUrl,
  dashboardUrl,
  aiAssessment,
  storyStats,
  nextSteps,
  unsubscribeUrl,
}: StoryCompletedEmailProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return '#10b981'; // Green
    if (score >= 80) return '#f59e0b'; // Yellow
    if (score >= 70) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 90) return '🌟';
    if (score >= 80) return '⭐';
    if (score >= 70) return '👍';
    return '💪';
  };

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Story Completed - Congratulations!</title>
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
            background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
          }
          
          .celebration-icon {
            width: 80px;
            height: 80px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 36px;
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
          
          .story-showcase {
            background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
            border: 2px solid #d1d5db;
          }
          
          .story-title {
            font-size: 24px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 15px;
          }
          
          .story-stats {
            display: flex;
            justify-content: space-around;
            margin: 20px 0;
            flex-wrap: wrap;
            gap: 15px;
          }
          
          .stat-item {
            text-align: center;
            min-width: 100px;
          }
          
          .stat-number {
            font-size: 24px;
            font-weight: 700;
            color: #8b5cf6;
          }
          
          .stat-label {
            font-size: 12px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
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
          
          .assessment-section {
            background: #fef3c7;
            border: 1px solid #fbbf24;
            border-radius: 12px;
            padding: 25px;
            margin: 30px 0;
          }
          
          .assessment-title {
            font-size: 18px;
            font-weight: 600;
            color: #92400e;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
          }
          
          .score-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
            margin: 20px 0;
          }
          
          .score-item {
            text-align: center;
            background: white;
            padding: 20px;
            border-radius: 8px;
            border: 2px solid #fed7aa;
          }
          
          .score-value {
            font-size: 36px;
            font-weight: 700;
            margin-bottom: 5px;
          }
          
          .score-label {
            font-size: 14px;
            color: #92400e;
            font-weight: 500;
          }
          
          .feedback-box {
            background: white;
            border-left: 4px solid #fbbf24;
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
          }
          
          .feedback-text {
            font-style: italic;
            color: #92400e;
            margin-bottom: 15px;
          }
          
          .strengths-list {
            list-style: none;
            padding: 0;
            margin: 15px 0;
          }
          
          .strengths-list li {
            background: #dcfce7;
            padding: 8px 12px;
            margin: 5px 0;
            border-radius: 6px;
            color: #166534;
            font-size: 14px;
          }
          
          .strengths-list li:before {
            content: '✅ ';
            margin-right: 8px;
          }
          
          .next-steps {
            background: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 8px;
            padding: 20px;
            margin: 30px 0;
          }
          
          .next-steps-title {
            font-size: 16px;
            font-weight: 600;
            color: #0369a1;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
          }
          
          .next-steps-list {
            list-style: none;
            padding: 0;
            margin: 0;
          }
          
          .next-steps-list li {
            background: white;
            padding: 12px 16px;
            margin: 8px 0;
            border-radius: 6px;
            color: #0c4a6e;
            font-size: 14px;
            border-left: 3px solid #0ea5e9;
          }
          
          .next-steps-list li:before {
            content: '🎯 ';
            margin-right: 8px;
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
            
            .story-stats {
              flex-direction: column;
              align-items: center;
            }
            
            .score-grid {
              grid-template-columns: 1fr;
            }
            
            .cta-button {
              display: block;
              margin: 10px 0;
            }
          }
        `}</style>
      </head>
      <body>
        <div className="email-container">
          {/* Header */}
          <div className="header">
            <div className="celebration-icon">🎉</div>
            <h1>Story Completed!</h1>
            <p>Amazing work on your latest creative adventure</p>
          </div>

          {/* Main Content */}
          <div className="content">
            <div className="greeting">
              Congratulations, {childName}! 🌟
            </div>

            <div className="message">
              You've just completed another fantastic story! Your creativity and hard work really shine through 
              in "{storyTitle}". We're so proud of your dedication to becoming an amazing storyteller.
            </div>

            {/* Story Showcase */}
            <div className="story-showcase">
              <div className="story-title">📖 "{storyTitle}"</div>
              
              <div className="story-stats">
                <div className="stat-item">
                  <div className="stat-number">{storyStats.wordCount}</div>
                  <div className="stat-label">Words Written</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">{storyStats.timeSpent}</div>
                  <div className="stat-label">Time Spent</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">{storyStats.totalStories}</div>
                  <div className="stat-label">Total Stories</div>
                </div>
              </div>
              
              <a href={storyUrl} className="cta-button">
                📚 Read Your Story
              </a>
            </div>

            {/* AI Assessment */}
            <div className="assessment-section">
              <div className="assessment-title">
                🤖 Your AI Writing Assistant Says:
              </div>
              
              <div className="score-grid">
                <div className="score-item">
                  <div className="score-value" style={{ color: getScoreColor(aiAssessment.grammarScore) }}>
                    {aiAssessment.grammarScore}% {getScoreEmoji(aiAssessment.grammarScore)}
                  </div>
                  <div className="score-label">Grammar Score</div>
                </div>
                <div className="score-item">
                  <div className="score-value" style={{ color: getScoreColor(aiAssessment.creativityScore) }}>
                    {aiAssessment.creativityScore}% {getScoreEmoji(aiAssessment.creativityScore)}
                  </div>
                  <div className="score-label">Creativity Score</div>
                </div>
                <div className="score-item">
                  <div className="score-value" style={{ color: getScoreColor(aiAssessment.overallScore) }}>
                    {aiAssessment.overallScore}% {getScoreEmoji(aiAssessment.overallScore)}
                  </div>
                  <div className="score-label">Overall Score</div>
                </div>
              </div>

              <div className="feedback-box">
                <div className="feedback-text">
                  "{aiAssessment.feedback}"
                </div>
                
                <strong style={{ color: '#92400e' }}>What you did great:</strong>
                <ul className="strengths-list">
                  {aiAssessment.strengths.map((strength, index) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Next Steps */}
            <div className="next-steps">
              <div className="next-steps-title">
                🚀 Ready for Your Next Adventure?
              </div>
              <ul className="next-steps-list">
                {nextSteps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
            </div>

            {/* Parent Note */}
            {parentName && (
              <div className="parent-note">
                <div className="parent-note-title">
                  📝 Note for {parentName}:
                </div>
                <div className="parent-note-content">
                  {childName} has completed another story on Mintoons! Their writing skills continue to develop 
                  through our AI collaboration system. The scores above reflect their current progress in grammar, 
                  creativity, and overall storytelling ability. Consider celebrating this achievement and 
                  encouraging them to continue their writing journey!
                </div>
              </div>
            )}

            <div className="message">
              Keep up the amazing work! Your teacher will review your story soon and provide personalized 
              feedback to help you become an even better writer. Remember, every story you write makes you 
              stronger as a storyteller! 💪
            </div>

            <div className="message">
              Happy writing! ✨<br />
              <strong>The Mintoons Team</strong>
            </div>
          </div>

          {/* Footer */}
          <div className="footer">
            <div className="footer-links">
              <a href={dashboardUrl} className="footer-link">Dashboard</a>
              <a href={storyUrl} className="footer-link">View Story</a>
              <a href="/create-stories" className="footer-link">Write New Story</a>
            </div>
            
            <div className="footer-text">
              Mintoons - AI-Powered Story Writing Platform for Children<br />
              Helping young minds discover the joy of storytelling
            </div>
            
            <div className="unsubscribe">
              You're receiving this email because {childName} completed a story on Mintoons.<br />
              <a href={unsubscribeUrl}>Unsubscribe from story completion emails</a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}