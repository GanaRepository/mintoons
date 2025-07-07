import React from 'react';

interface PasswordResetEmailProps {
  name: string;
  resetUrl: string;
  expiryTime: string; // e.g., "1 hour"
  loginUrl: string;
  supportUrl: string;
  ipAddress?: string;
  browserInfo?: string;
}

export default function PasswordResetEmail({
  name,
  resetUrl,
  expiryTime,
  loginUrl,
  supportUrl,
  ipAddress,
  browserInfo,
}: PasswordResetEmailProps) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Reset Your Mintoons Password</title>
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
            background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%);
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
          
          .alert-box {
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          
          .alert-title {
            font-size: 16px;
            font-weight: 600;
            color: #dc2626;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
          }
          
          .alert-content {
            font-size: 14px;
            color: #7f1d1d;
            line-height: 1.6;
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
            background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 10px 0;
            transition: transform 0.2s ease;
          }
          
          .cta-button:hover {
            transform: translateY(-2px);
          }
          
          .reset-link {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            word-break: break-all;
            font-family: monospace;
            font-size: 12px;
            color: #374151;
          }
          
          .security-info {
            background: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 8px;
            padding: 20px;
            margin: 30px 0;
          }
          
          .security-title {
            font-size: 16px;
            font-weight: 600;
            color: #0369a1;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
          }
          
          .security-content {
            font-size: 14px;
            color: #0c4a6e;
            line-height: 1.6;
          }
          
          .request-details {
            background: #fffbeb;
            border: 1px solid #fed7aa;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            font-size: 13px;
            color: #92400e;
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
          
          .help-section {
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
            margin-top: 30px;
          }
          
          .help-title {
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 10px;
          }
          
          .help-content {
            font-size: 14px;
            color: #6b7280;
            line-height: 1.6;
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
          }
        `}</style>
      </head>
      <body>
        <div className="email-container">
          {/* Header */}
          <div className="header">
            <div className="logo">🔐</div>
            <h1>Password Reset</h1>
            <p>Secure password reset for your Mintoons account</p>
          </div>

          {/* Main Content */}
          <div className="content">
            <div className="greeting">
              Hi {name},
            </div>

            <div className="message">
              We received a request to reset the password for your Mintoons account. If you requested this, 
              you can reset your password using the button below.
            </div>

            {/* Security Alert */}
            <div className="alert-box">
              <div className="alert-title">
                🛡️ Security Notice
              </div>
              <div className="alert-content">
                <strong>If you didn't request this password reset, please ignore this email.</strong> Your account 
                remains secure, and no changes will be made. Consider changing your password if you think 
                someone else might have access to your email.
              </div>
            </div>

            {/* Reset Button */}
            <div className="cta-section">
              <div className="cta-title">Reset Your Password</div>
              <a href={resetUrl} className="cta-button">
                Reset Password Securely
              </a>
              <div style={{ marginTop: '15px', fontSize: '14px', color: '#6b7280' }}>
                This link will expire in {expiryTime}
              </div>
            </div>

            {/* Alternative Link */}
            <div className="message">
              If the button above doesn't work, you can copy and paste this link into your browser:
            </div>
            <div className="reset-link">
              {resetUrl}
            </div>

            {/* Request Details */}
            {(ipAddress || browserInfo) && (
              <div className="request-details">
                <strong>Request Details:</strong><br />
                {ipAddress && `IP Address: ${ipAddress}`}<br />
                {browserInfo && `Browser: ${browserInfo}`}<br />
                Time: {new Date().toLocaleString()}
              </div>
            )}

            {/* Security Information */}
            <div className="security-info">
              <div className="security-title">
                🔒 Security Best Practices
              </div>
              <div className="security-content">
                <strong>Creating a strong password:</strong><br />
                • Use at least 8 characters<br />
                • Include uppercase and lowercase letters<br />
                • Add numbers and special characters<br />
                • Avoid personal information<br />
                • Don't reuse passwords from other accounts
              </div>
            </div>

            <div className="message">
              After resetting your password, we recommend:
              <ul style={{ marginLeft: '20px', color: '#6b7280' }}>
                <li>Signing out of all devices and signing back in</li>
                <li>Updating your password in any saved password managers</li>
                <li>Reviewing your recent account activity</li>
              </ul>
            </div>

            {/* Help Section */}
            <div className="help-section">
              <div className="help-title">
                Need Help?
              </div>
              <div className="help-content">
                If you're having trouble resetting your password or have security concerns, our support team 
                is here to help. Contact us at <a href={supportUrl} style={{ color: '#dc2626' }}>support@mintoons.com</a> 
                or visit our help center.
              </div>
            </div>

            <div className="message">
              Best regards,<br />
              <strong>The Mintoons Security Team</strong>
            </div>
          </div>

          {/* Footer */}
          <div className="footer">
            <div className="footer-links">
              <a href={loginUrl} className="footer-link">Sign In</a>
              <a href={supportUrl} className="footer-link">Help Center</a>
              <a href="https://mintoons.com/security" className="footer-link">Security</a>
            </div>
            
            <div className="footer-text">
              Mintoons - AI-Powered Story Writing Platform<br />
              This email was sent to verify a password reset request for your account.
            </div>
            
            <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '20px' }}>
              For security reasons, this email cannot be replied to directly.<br />
              If you need assistance, please contact our support team.
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}