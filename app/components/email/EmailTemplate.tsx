import React from 'react';

interface EmailTemplateProps {
  type: 'welcome' | 'password-reset' | 'story-published' | 'mentor-feedback' | 'achievement' | 'admin-user-created';
  data: {
    name: string;
    email?: string;
    resetUrl?: string;
    storyTitle?: string;
    storyUrl?: string;
    mentorName?: string;
    feedbackMessage?: string;
    achievementTitle?: string;
    achievementDescription?: string;
    tempPassword?: string;
    loginUrl?: string;
    role?: string;
  };
}

export default function EmailTemplate({ type, data }: EmailTemplateProps) {
  const baseStyles = {
    fontFamily: 'Arial, sans-serif',
    lineHeight: '1.6',
    color: '#333333',
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: '#ffffff'
  };

  const headerStyles = {
    backgroundColor: '#3B82F6',
    color: 'white',
    padding: '20px',
    textAlign: 'center' as const
  };

  const contentStyles = {
    padding: '30px 20px',
    backgroundColor: '#ffffff'
  };

  const buttonStyles = {
    display: 'inline-block',
    padding: '12px 24px',
    backgroundColor: '#3B82F6',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    margin: '20px 0'
  };

  const footerStyles = {
    padding: '20px',
    backgroundColor: '#F3F4F6',
    textAlign: 'center' as const,
    fontSize: '14px',
    color: '#6B7280'
  };

  const renderContent = () => {
    switch (type) {
      case 'welcome':
        return (
          <>
            <h1 style={{ color: '#1F2937', marginBottom: '20px' }}>
              Welcome to Mintoons, {data.name}! 🎉
            </h1>
            <p>We're thrilled to have you join our creative writing community!</p>
            <p>At Mintoons, young writers like you can:</p>
            <ul style={{ paddingLeft: '20px', marginBottom: '20px' }}>
              <li>📝 Create amazing stories with AI assistance</li>
              <li>🎯 Get helpful feedback from experienced mentors</li>
              <li>🏆 Earn achievements and level up your writing skills</li>
              <li>📚 Share your stories with other young writers</li>
            </ul>
            <p>Ready to start your writing adventure?</p>
            <a href="https://mintoons.com/dashboard" style={buttonStyles}>
              Start Writing Now
            </a>
            <p>Happy writing!</p>
            <p>The Mintoons Team</p>
          </>
        );

      case 'password-reset':
        return (
          <>
            <h1 style={{ color: '#1F2937', marginBottom: '20px' }}>
              Reset Your Password
            </h1>
            <p>Hi {data.name},</p>
            <p>We received a request to reset your password for your Mintoons account.</p>
            <p>Click the button below to create a new password:</p>
            <a href={data.resetUrl} style={buttonStyles}>
              Reset Password
            </a>
            <p style={{ fontSize: '14px', color: '#6B7280' }}>
              This link will expire in 1 hour for security reasons.
            </p>
            <p>If you didn't request this password reset, please ignore this email.</p>
            <p>Best regards,<br />The Mintoons Team</p>
          </>
        );

      case 'story-published':
        return (
          <>
            <h1 style={{ color: '#1F2937', marginBottom: '20px' }}>
              🎉 Your Story is Live!
            </h1>
            <p>Congratulations, {data.name}!</p>
            <p>Your story <strong>"{data.storyTitle}"</strong> has been published and is now live for everyone to read!</p>
            <div style={{ 
              backgroundColor: '#F0F9FF', 
              border: '1px solid #0EA5E9', 
              borderRadius: '8px', 
              padding: '16px', 
              margin: '20px 0' 
            }}>
              <p style={{ margin: '0', color: '#0C4A6E' }}>
                💡 <strong>Tip:</strong> Share your story with friends and family to get more readers!
              </p>
            </div>
            <a href={data.storyUrl} style={buttonStyles}>
              View Your Story
            </a>
            <p>Keep up the amazing work! We can't wait to see what you write next.</p>
            <p>The Mintoons Team</p>
          </>
        );

      case 'mentor-feedback':
        return (
          <>
            <h1 style={{ color: '#1F2937', marginBottom: '20px' }}>
              📝 New Feedback on Your Story!
            </h1>
            <p>Hi {data.name},</p>
            <p>Great news! <strong>{data.mentorName}</strong> has left feedback on your story <strong>"{data.storyTitle}"</strong>.</p>
            
            <div style={{ 
              backgroundColor: '#F0FDF4', 
              border: '1px solid #16A34A', 
              borderRadius: '8px', 
              padding: '16px', 
              margin: '20px 0' 
            }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#15803D' }}>Feedback Preview:</h3>
              <p style={{ margin: '0', fontStyle: 'italic', color: '#166534' }}>
                "{data.feedbackMessage}"
              </p>
            </div>

            <a href={data.storyUrl} style={buttonStyles}>
              Read Full Feedback
            </a>
            <p>Mentor feedback is a great way to improve your writing skills. Take some time to read through the suggestions!</p>
            <p>Happy writing!<br />The Mintoons Team</p>
          </>
        );

      case 'achievement':
        return (
          <>
            <h1 style={{ color: '#1F2937', marginBottom: '20px' }}>
              🏆 Achievement Unlocked!
            </h1>
            <p>Congratulations, {data.name}!</p>
            <p>You've unlocked a new achievement:</p>
            
            <div style={{ 
              backgroundColor: '#FEF3C7', 
              border: '2px solid #F59E0B', 
              borderRadius: '12px', 
              padding: '20px', 
              margin: '20px 0',
              textAlign: 'center' as const
            }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>🏆</div>
              <h2 style={{ margin: '0 0 10px 0', color: '#92400E' }}>{data.achievementTitle}</h2>
              <p style={{ margin: '0', color: '#78350F' }}>{data.achievementDescription}</p>
            </div>

            <p>Keep up the fantastic work! Every achievement brings you one step closer to becoming an amazing writer.</p>
            <a href="https://mintoons.com/dashboard/progress" style={buttonStyles}>
              View All Achievements
            </a>
            <p>The Mintoons Team</p>
          </>
        );

      case 'admin-user-created':
        return (
          <>
            <h1 style={{ color: '#1F2937', marginBottom: '20px' }}>
              Welcome to Mintoons!
            </h1>
            <p>Hi {data.name},</p>
            <p>An account has been created for you on Mintoons with the role of <strong>{data.role}</strong>.</p>
            
            <div style={{ 
              backgroundColor: '#FEF2F2', 
              border: '1px solid #EF4444', 
              borderRadius: '8px', 
              padding: '16px', 
              margin: '20px 0' 
            }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#DC2626' }}>Your Login Details:</h3>
              <p style={{ margin: '5px 0', color: '#991B1B' }}>
                <strong>Email:</strong> {data.email}
              </p>
              <p style={{ margin: '5px 0', color: '#991B1B' }}>
                <strong>Temporary Password:</strong> {data.tempPassword}
              </p>
            </div>

            <p><strong>Important:</strong> Please change your password immediately after logging in for security.</p>
            
            <a href={data.loginUrl} style={buttonStyles}>
              Login to Mintoons
            </a>
            
            <p>If you have any questions, please don't hesitate to contact our support team.</p>
            <p>Welcome to the team!<br />The Mintoons Admin Team</p>
          </>
        );

      default:
        return <p>Email template not found.</p>;
    }
  };

  return (
    <div style={baseStyles}>
      {/* Header */}
      <div style={headerStyles}>
        <h1 style={{ margin: '0', fontSize: '24px' }}>
          🎨 Mintoons
        </h1>
        <p style={{ margin: '5px 0 0 0', opacity: '0.9' }}>
          Where Young Writers Shine
        </p>
      </div>

      {/* Content */}
      <div style={contentStyles}>
        {renderContent()}
      </div>

      {/* Footer */}
      <div style={footerStyles}>
        <p style={{ margin: '0 0 10px 0' }}>
          © 2024 Mintoons. All rights reserved.
        </p>
        <p style={{ margin: '0' }}>
          Need help? Contact us at{' '}
          <a href="mailto:support@mintoons.com" style={{ color: '#3B82F6' }}>
            support@mintoons.com
          </a>
        </p>
        <p style={{ margin: '10px 0 0 0', fontSize: '12px' }}>
          This email was sent to {data.email}. If you no longer wish to receive these emails,{' '}
          <a href="#" style={{ color: '#6B7280' }}>unsubscribe here</a>.
        </p>
      </div>
    </div>
  );
}