import React from 'react';

interface WelcomeEmailProps {
  name: string;
  age?: number;
  loginUrl: string;
  dashboardUrl: string;
  createStoryUrl: string;
  supportUrl: string;
  unsubscribeUrl: string;
}

export default function WelcomeEmail({
  name,
  age,
  loginUrl,
  dashboardUrl,
  createStoryUrl,
  supportUrl,
  unsubscribeUrl,
}: WelcomeEmailProps) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Welcome to Mintoons!</title>
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
          
          .logo {
            width: 60px;
            height: 60px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 16px;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
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
          
          .secondary-button {
            display: inline-block;
            background: white;
            color: #8b5cf6;
            border: 2px solid #8b5cf6;
            text-decoration: none;
            padding: 14px 28px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 14px;
            margin: 10px;
          }
          
          .features {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin: 30px 0;
          }
          
          .feature {
            flex: 1;
            min-width: 200px;
            text-align: center;
            padding: 20px;
            background: #f9fafb;
            border-radius: 8px;
          }
          
          .feature-icon {
            font-size: 32px;
            margin-bottom: 10px;
          }
          
          .feature-title {
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 8px;
          }
          
          .feature-description {
            font-size: 14px;
            color: #6b7280;
          }
          
          .tips {
            background: #fef3c7;
            border: 1px solid #fbbf24;
            border-radius: 8px;
            padding: 20px;
            margin: 30px 0;
          }
          
          .tips-title {
            font-size: 16px;
            font-weight: 600;
            color: #92400e;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
          }
          
          .tips-content {
            font-size: 14px;
            color: #92400e;
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
            
            .features {
              flex-direction: column;
            }
            
            .feature {
              min-width: auto;
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
            <div className="logo">✨</div>
            <h1>Welcome to Mintoons!</h1>
            <p>Your creative writing adventure begins now</p>
          </div>

          {/* Main Content */}
          <div className="content">
            <div className="greeting">
              Hi {name}! 👋
            </div>

            <div className="message">
              Welcome to the Mintoons family! We're absolutely thrilled to have you join our community of young storytellers. 
              {age && age < 13 && " We've designed Mintoons especially for creative minds like yours, with safety and fun as our top priorities."}
            </div>

            <div className="message">
              At Mintoons, you'll collaborate with our friendly AI assistant to create amazing stories, get helpful feedback 
              from teachers, and track your progress as you become an even better writer. Think of it as having a creative 
              writing buddy who's always there to help!
            </div>

            {/* Call-to-Action */}
            <div className="cta-section">
              <div className="cta-title">Ready to create your first story?</div>
              <a href={createStoryUrl} className="cta-button">
                Start Writing Now! 🚀
              </a>
              <br />
              <a href={dashboardUrl} className="secondary-button">
                Visit Your Dashboard
              </a>
            </div>

            {/* Features */}
            <div className="features">
              <div className="feature">
                <div className="feature-icon">🤖</div>
                <div className="feature-title">AI Writing Partner</div>
                <div className="feature-description">
                  Work together with our AI to brainstorm ideas and craft stories
                </div>
              </div>
              <div className="feature">
                <div className="feature-icon">👨‍🏫</div>
                <div className="feature-title">Teacher Feedback</div>
                <div className="feature-description">
                  Get helpful comments and suggestions from real teachers
                </div>
              </div>
              <div className="feature">
                <div className="feature-icon">📈</div>
                <div className="feature-title">Track Progress</div>
                <div className="feature-description">
                  Watch your writing skills improve with detailed analytics
                </div>
              </div>
            </div>

            {/* Tips Section */}
            <div className="tips">
              <div className="tips-title">
                💡 Quick Tips to Get Started
              </div>
              <div className="tips-content">
                <strong>1. Choose your story elements</strong> - Pick a genre, setting, character, and mood that excite you!<br />
                <strong>2. Let your imagination flow</strong> - Don't worry about perfection, just have fun writing.<br />
                <strong>3. Listen to the AI</strong> - Our AI assistant will give you helpful prompts and suggestions.<br />
                <strong>4. Read teacher feedback</strong> - Use their comments to make your stories even better!
              </div>
            </div>

            <div className="message">
              Remember, every great writer started with a single story. We can't wait to see what amazing tales 
              you'll create! If you have any questions, our friendly support team is always here to help.
            </div>

            <div className="message">
              Happy writing! 📝✨<br />
              <strong>The Mintoons Team</strong>
            </div>
          </div>

          {/* Footer */}
          <div className="footer">
            <div className="footer-links">
              <a href={dashboardUrl} className="footer-link">Dashboard</a>
              <a href={supportUrl} className="footer-link">Help Center</a>
              <a href={loginUrl} className="footer-link">Sign In</a>
            </div>
            
            <div className="footer-text">
              Mintoons - AI-Powered Story Writing Platform for Children<br />
              Empowering young minds through creative storytelling
            </div>
            
            <div className="unsubscribe">
              You're receiving this email because you created a Mintoons account.<br />
              <a href={unsubscribeUrl}>Unsubscribe from welcome emails</a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}