// File 104: templates/email/weekly-progress.tsx - Weekly Progress Email
import React from 'react';

interface WeeklyProgressEmailProps {
  childName: string;
  parentName?: string;
  weeklyStats: {
    storiesCreated: number;
    wordsWritten: number;
    timeSpent: number;
    streakDays: number;
    achievementsUnlocked: number;
  };
  topStory?: {
    title: string;
    url: string;
  };
  dashboardUrl: string;
  unsubscribeUrl: string;
}

export default function WeeklyProgressEmail({
  childName,
  parentName,
  weeklyStats,
  topStory,
  dashboardUrl,
  unsubscribeUrl,
}: WeeklyProgressEmailProps) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <title>Weekly Progress Report - Mintoons</title>
        <style>{`
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f8fafc;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 12px 12px 0 0;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            padding: 30px;
            background: white;
          }
          .stat-card {
            text-align: center;
            padding: 20px;
            background: #f1f5f9;
            border-radius: 12px;
          }
          .stat-number {
            font-size: 2rem;
            font-weight: bold;
            color: #6366f1;
          }
          .cta-button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 8px;
            display: inline-block;
            font-weight: bold;
            margin: 20px auto;
          }
        `}</style>
      </head>
      <body>
        <div className="email-container">
          {/* Header */}
          <div className="header">
            <h1>📊 Weekly Progress Report</h1>
            <p>Amazing work this week, {childName}!</p>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{weeklyStats.storiesCreated}</div>
              <div>Stories Created</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{weeklyStats.wordsWritten}</div>
              <div>Words Written</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{weeklyStats.timeSpent}</div>
              <div>Minutes Writing</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{weeklyStats.streakDays}</div>
              <div>Day Streak</div>
            </div>
          </div>

          {/* Top Story */}
          {topStory && (
            <div style={{ padding: '30px', backgroundColor: 'white', textAlign: 'center' }}>
              <h2>⭐ Top Story This Week</h2>
              <p style={{ fontSize: '1.2rem', color: '#6366f1' }}>{topStory.title}</p>
              <a href={topStory.url} className="cta-button">Read Story</a>
            </div>
          )}

          {/* CTA */}
          <div style={{ padding: '30px', backgroundColor: 'white', textAlign: 'center' }}>
            <h2>Keep up the amazing work!</h2>
            <a href={dashboardUrl} className="cta-button">Continue Writing</a>
          </div>

          {/* Footer */}
          <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
            <p>Happy writing!</p>
            <p>The Mintoons Team</p>
            <a href={unsubscribeUrl} style={{ color: '#64748b', textDecoration: 'underline' }}>
              Unsubscribe
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}