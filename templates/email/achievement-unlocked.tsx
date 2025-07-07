import React from 'react';

interface AchievementUnlockedEmailProps {
  childName: string;
  parentName?: string;
  achievementName: string;
  achievementDescription: string;
  achievementIcon: string;
  achievementCategory: string;
  dashboardUrl: string;
  unsubscribeUrl: string;
}

export default function AchievementUnlockedEmail({
  childName,
  parentName,
  achievementName,
  achievementDescription,
  achievementIcon,
  achievementCategory,
  dashboardUrl,
  unsubscribeUrl
}: AchievementUnlockedEmailProps) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Achievement Unlocked! 🏆</title>
        <style>{`
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f0f9ff;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
          }
          .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="2" fill="rgba(255,255,255,0.1)"/></svg>') repeat;
            animation: sparkle 3s linear infinite;
          }
          @keyframes sparkle {
            0% { transform: translateX(0) translateY(0); }
            100% { transform: translateX(-50px) translateY(-50px); }
          }
          .achievement-icon {
            font-size: 60px;
            margin-bottom: 20px;
            display: block;
            position: relative;
            z-index: 1;
          }
          .achievement-badge {
            background: rgba(255, 255, 255, 0.2);
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            width: 120px;
            height: 120px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            backdrop-filter: blur(10px);
            animation: pulse 2s infinite;
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          .content {
            padding: 40px 30px;
          }
          .achievement-title {
            font-size: 28px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 10px;
            text-align: center;
          }
          .achievement-category {
            display: inline-block;
            background: #ddd6fe;
            color: #7c3aed;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 20px;
          }
          .achievement-description {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #7c3aed;
            margin: 20px 0;
            font-style: italic;
            color: #4b5563;
          }
          .celebration-message {
            text-align: center;
            font-size: 18px;
            color: #1f2937;
            margin: 30px 0;
            line-height: 1.8;
          }
          .cta-button {
            display: block;
            width: fit-content;
            margin: 30px auto;
            padding: 15px 30px;
            background: linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            text-align: center;
            transition: transform 0.2s ease;
          }
          .cta-button:hover {
            transform: translateY(-2px);
          }
          .stats-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 30px 0;
          }
          .stat-item {
            text-align: center;
            padding: 20px;
            background: #f8fafc;
            border-radius: 8px;
          }
          .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: #7c3aed;
            display: block;
          }
          .stat-label {
            color: #6b7280;
            font-size: 14px;
            margin-top: 5px;
          }
          .footer {
            background: #f9fafb;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
          }
          .footer p {
            margin: 5px 0;
            font-size: 14px;
            color: #6b7280;
          }
          .footer a {
            color: #7c3aed;
            text-decoration: none;
          }
          .motivation-quote {
            background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%);
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            margin: 30px 0;
            border: 1px solid #f59e0b;
          }
          .quote-text {
            font-size: 16px;
            font-style: italic;
            color: #92400e;
            margin-bottom: 10px;
          }
          .quote-author {
            font-size: 14px;
            color: #78350f;
            font-weight: 600;
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          {/* Header */}
          <div className="header">
            <div className="achievement-badge">
              <span className="achievement-icon">{achievementIcon}</span>
            </div>
            <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 'bold' }}>
              Achievement Unlocked!
            </h1>
            <p style={{ margin: '10px 0 0', fontSize: '18px', opacity: 0.9 }}>
              🎉 Congratulations, {childName}! 🎉
            </p>
          </div>

          {/* Content */}
          <div className="content">
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <span className="achievement-category">{achievementCategory}</span>
            </div>

            <h2 className="achievement-title">{achievementName}</h2>

            <div className="achievement-description">
              <strong>What you accomplished:</strong>
              <br />
              {achievementDescription}
            </div>

            <div className="celebration-message">
              <strong>Way to go, {childName}!</strong> 🌟
              <br />
              You're becoming an amazing storyteller! This achievement shows your dedication to creative writing and continuous improvement.
            </div>

            <div className="motivation-quote">
              <div className="quote-text">
                "Every great writer was once a beginner who never gave up."
              </div>
              <div className="quote-author">
                — Keep writing amazing stories! 📚✨
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-number">🏆</span>
                <div className="stat-label">Achievement<br />Unlocked</div>
              </div>
              <div className="stat-item">
                <span className="stat-number">⭐</span>
                <div className="stat-label">Keep Going!<br />More Awaits</div>
              </div>
            </div>

            <a href={dashboardUrl} className="cta-button">
              View Your Dashboard 🚀
            </a>

            <div style={{ textAlign: 'center', marginTop: '30px', padding: '20px', backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
              <h3 style={{ color: '#1e40af', margin: '0 0 10px' }}>What's Next?</h3>
              <p style={{ margin: 0, color: '#1f2937' }}>
                Keep writing stories, exploring your creativity, and unlocking more achievements! 
                Your writing journey is just getting started! ✨
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="footer">
            <p>
              <strong>Mintoons - AI-Powered Story Writing Platform</strong>
            </p>
            <p>
              Inspiring young writers to create amazing stories! 📖
            </p>
            {parentName && (
              <p>
                This email was sent to notify you of {childName}'s achievement.
              </p>
            )}
            <p>
              <a href={unsubscribeUrl}>Unsubscribe</a> | 
              <a href="mailto:support@mintoons.com"> Contact Support</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}