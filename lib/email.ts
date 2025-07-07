import nodemailer from 'nodemailer';
import { connectToDatabase } from '@/utils/db';
import { EmailTemplate, EmailType } from '@/types/email';

// Email configuration
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
};

// Create reusable transporter
let transporter: nodemailer.Transporter | null = null;

async function getTransporter(): Promise<nodemailer.Transporter> {
  if (!transporter) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      throw new Error('SMTP credentials not configured');
    }
    
    transporter = nodemailer.createTransporter(emailConfig);
    
    // Verify connection
    try {
      await transporter.verify();
      console.log('Email service connected successfully');
    } catch (error) {
      console.error('Email service connection failed:', error);
      throw new Error('Failed to connect to email service');
    }
  }
  
  return transporter;
}

// Email templates
const emailTemplates: Record<EmailType, EmailTemplate> = {
  welcome: {
    subject: 'Welcome to Mintoons! 🎨✨',
    html: (data: any) => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Mintoons</title>
          <style>
            body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
            .content { padding: 40px 30px; }
            .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .footer { background-color: #f8fafc; padding: 20px; text-align: center; color: #666; font-size: 14px; }
            .highlight { background-color: #e0e7ff; padding: 15px; border-radius: 8px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎨 Welcome to Mintoons! ✨</h1>
              <p>Where imagination comes to life through AI-powered storytelling</p>
            </div>
            <div class="content">
              <h2>Hi ${data.name}! 👋</h2>
              <p>We're absolutely thrilled to have you join our magical storytelling community! Mintoons is where creativity meets technology to help young writers like you create amazing stories.</p>
              
              <div class="highlight">
                <h3>🚀 What you can do with Mintoons:</h3>
                <ul>
                  <li>✍️ Create collaborative stories with AI assistance</li>
                  <li>🎯 Get personalized feedback from experienced mentors</li>
                  <li>🏆 Earn achievements as you improve your writing skills</li>
                  <li>📚 Build your personal story library</li>
                  <li>🎨 Export your stories as beautiful PDFs</li>
                </ul>
              </div>
              
              <p>Ready to start your first story adventure?</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/create-stories" class="button">Create Your First Story 🎯</a>
              
              <p>If you have any questions or need help getting started, just reply to this email - we're here to help!</p>
              
              <p>Happy writing!<br>The Mintoons Team 💜</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Mintoons. All rights reserved.</p>
              <p>Questions? Contact us at <a href="mailto:support@mintoons.com">support@mintoons.com</a></p>
            </div>
          </div>
        </body>
      </html>
    `,
  },

  passwordReset: {
    subject: 'Reset Your Mintoons Password 🔐',
    html: (data: any) => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
          <style>
            body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 40px 20px; text-align: center; }
            .content { padding: 40px 30px; }
            .button { display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .footer { background-color: #f8fafc; padding: 20px; text-align: center; color: #666; font-size: 14px; }
            .warning { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Hi ${data.name}!</h2>
              <p>We received a request to reset your Mintoons password. If you made this request, click the button below to create a new password:</p>
              
              <a href="${data.resetUrl}" class="button">Reset My Password 🔐</a>
              
              <div class="warning">
                <p><strong>⚠️ Important:</strong></p>
                <ul>
                  <li>This link will expire in 1 hour</li>
                  <li>You can only use this link once</li>
                  <li>If you didn't request this, you can safely ignore this email</li>
                </ul>
              </div>
              
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #666; font-size: 14px;">${data.resetUrl}</p>
              
              <p>Need help? Contact us at <a href="mailto:support@mintoons.com">support@mintoons.com</a></p>
              
              <p>Best regards,<br>The Mintoons Team</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Mintoons. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  },

  storyCompleted: {
    subject: '🎉 Amazing! You completed a new story!',
    html: (data: any) => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Story Completed!</title>
          <style>
            body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 20px; text-align: center; }
            .content { padding: 40px 30px; }
            .button { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .footer { background-color: #f8fafc; padding: 20px; text-align: center; color: #666; font-size: 14px; }
            .stats { background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .score { display: inline-block; background-color: #10b981; color: white; padding: 8px 16px; border-radius: 20px; margin: 5px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Congratulations!</h1>
              <p>You've completed another amazing story!</p>
            </div>
            <div class="content">
              <h2>Great job, ${data.name}! 🌟</h2>
              <p>We're so proud of you for completing "<strong>${data.storyTitle}</strong>"! Your creativity and hard work really shine through.</p>
              
              <div class="stats">
                <h3>📊 Your Story Scores:</h3>
                <div class="score">Grammar: ${data.grammarScore}/100</div>
                <div class="score">Creativity: ${data.creativityScore}/100</div>
                <div class="score">Overall: ${data.overallScore}/100</div>
              </div>
              
              <p><strong>🎯 What made your story special:</strong></p>
              <p style="font-style: italic; color: #059669;">"${data.feedback}"</p>
              
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/my-stories" class="button">View Your Story 📚</a>
              
              <p>Keep up the fantastic work! Ready to start your next adventure?</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/create-stories" class="button">Write Another Story ✍️</a>
              
              <p>Happy writing!<br>The Mintoons Team 💜</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Mintoons. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  },

  mentorComment: {
    subject: '💬 Your mentor left you a comment!',
    html: (data: any) => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Mentor Comment</title>
          <style>
            body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 40px 20px; text-align: center; }
            .content { padding: 40px 30px; }
            .button { display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .footer { background-color: #f8fafc; padding: 20px; text-align: center; color: #666; font-size: 14px; }
            .comment { background-color: #f3f4f6; border-left: 4px solid #8b5cf6; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💬 You have a new comment!</h1>
            </div>
            <div class="content">
              <h2>Hi ${data.studentName}! 👋</h2>
              <p>Great news! Your mentor <strong>${data.mentorName}</strong> left you a comment on your story "<strong>${data.storyTitle}</strong>".</p>
              
              <div class="comment">
                <h3>💡 Mentor's Comment:</h3>
                <p style="font-style: italic;">"${data.commentContent}"</p>
                <p><small>Comment type: <strong>${data.commentType}</strong></small></p>
              </div>
              
              <p>Your mentor took time to read your story and wants to help you become an even better writer. Check out their feedback and feel free to ask questions!</p>
              
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/my-stories/${data.storyId}" class="button">View Comment & Reply 💬</a>
              
              <p>Keep up the amazing work!<br>The Mintoons Team 💜</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Mintoons. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  },

  weeklyProgress: {
    subject: '📈 Your amazing writing progress this week!',
    html: (data: any) => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Weekly Progress Report</title>
          <style>
            body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 40px 20px; text-align: center; }
            .content { padding: 40px 30px; }
            .button { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .footer { background-color: #f8fafc; padding: 20px; text-align: center; color: #666; font-size: 14px; }
            .progress-card { background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 15px 0; }
            .achievement { background-color: #fef3c7; padding: 10px; border-radius: 6px; margin: 10px 0; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📈 Your Weekly Progress Report</h1>
              <p>Look how much you've accomplished!</p>
            </div>
            <div class="content">
              <h2>Hi ${data.name}! 🌟</h2>
              <p>What an amazing week of writing! Here's a summary of all your creative accomplishments:</p>
              
              <div class="progress-card">
                <h3>📚 This Week's Stats:</h3>
                <ul>
                  <li><strong>${data.storiesCompleted}</strong> stories completed</li>
                  <li><strong>${data.wordsWritten}</strong> words written</li>
                  <li><strong>${data.mentorComments}</strong> helpful comments received</li>
                  <li><strong>${data.averageScore}</strong> average story score</li>
                </ul>
              </div>
              
              ${data.achievements && data.achievements.length > 0 ? `
                <h3>🏆 New Achievements Unlocked:</h3>
                ${data.achievements.map((achievement: string) => `
                  <div class="achievement">🎯 ${achievement}</div>
                `).join('')}
              ` : ''}
              
              <div class="progress-card">
                <h3>📊 Progress Comparison:</h3>
                <p>You're improving so much! Compared to last week:</p>
                <ul>
                  <li>Grammar score: ${data.grammarImprovement > 0 ? '+' : ''}${data.grammarImprovement} points</li>
                  <li>Creativity score: ${data.creativityImprovement > 0 ? '+' : ''}${data.creativityImprovement} points</li>
                  <li>Writing streak: ${data.writingStreak} days in a row!</li>
                </ul>
              </div>
              
              <p>You're doing fantastic! Keep up the amazing work and remember - every story you write makes you a better writer.</p>
              
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/progress" class="button">View Full Progress 📈</a>
              
              <p>Ready to start another amazing week of writing?</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/create-stories" class="button">Write Your Next Story ✍️</a>
              
              <p>Keep shining!<br>The Mintoons Team 💜</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Mintoons. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  },

  achievementUnlocked: {
    subject: '🏆 Achievement Unlocked! You did it!',
    html: (data: any) => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Achievement Unlocked!</title>
          <style>
            body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 40px 20px; text-align: center; }
            .content { padding: 40px 30px; text-align: center; }
            .button { display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .footer { background-color: #f8fafc; padding: 20px; text-align: center; color: #666; font-size: 14px; }
            .achievement-badge { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white; padding: 30px; border-radius: 50%; display: inline-block; font-size: 48px; margin: 20px 0; box-shadow: 0 8px 25px rgba(245, 158, 11, 0.3); }
            .achievement-details { background-color: #fef3c7; padding: 25px; border-radius: 12px; margin: 25px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 ACHIEVEMENT UNLOCKED! 🎉</h1>
            </div>
            <div class="content">
              <div class="achievement-badge">
                ${data.achievementIcon || '🏆'}
              </div>
              
              <h2>Congratulations, ${data.name}!</h2>
              
              <div class="achievement-details">
                <h3>🌟 ${data.achievementName}</h3>
                <p style="font-size: 18px; margin: 15px 0;">${data.achievementDescription}</p>
                
                ${data.rewardUnlocked ? `
                  <div style="background-color: #065f46; color: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <strong>🎁 Reward Unlocked:</strong> ${data.rewardUnlocked}
                  </div>
                ` : ''}
              </div>
              
              <p>You've worked so hard to earn this achievement! Your dedication to improving your writing skills is truly inspiring.</p>
              
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/progress" class="button">View All Achievements 🏆</a>
              
              <p>What achievement will you unlock next? Keep writing and find out!</p>
              
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/create-stories" class="button">Continue Writing ✍️</a>
              
              <p>We're so proud of you!<br>The Mintoons Team 💜</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Mintoons. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  },
};

// Core email sending function
export async function sendEmail(
  to: string | string[],
  type: EmailType,
  data: any,
  options: {
    cc?: string | string[];
    bcc?: string | string[];
    attachments?: any[];
  } = {}
): Promise<boolean> {
  try {
    const transporter = await getTransporter();
    const template = emailTemplates[type];
    
    if (!template) {
      throw new Error(`Email template '${type}' not found`);
    }

    const recipients = Array.isArray(to) ? to : [to];
    
    // Validate email addresses
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const email of recipients) {
      if (!emailRegex.test(email)) {
        throw new Error(`Invalid email address: ${email}`);
      }
    }

    const mailOptions = {
      from: `"Mintoons" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: recipients.join(', '),
      cc: options.cc ? (Array.isArray(options.cc) ? options.cc.join(', ') : options.cc) : undefined,
      bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc.join(', ') : options.bcc) : undefined,
      subject: template.subject,
      html: template.html(data),
      attachments: options.attachments || [],
    };

    const result = await transporter.sendMail(mailOptions);
    
    // Log email sending (in production, you might want to store this in database)
    console.log(`Email sent successfully to ${recipients.join(', ')}: ${result.messageId}`);
    
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

// Specific email functions
export async function sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
  return await sendEmail(userEmail, 'welcome', {
    name: userName,
  });
}

export async function sendPasswordResetEmail(
  userEmail: string,
  userName: string,
  resetToken: string
): Promise<boolean> {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
  
  return await sendEmail(userEmail, 'passwordReset', {
    name: userName,
    resetUrl,
  });
}

export async function sendStoryCompletedEmail(
  userEmail: string,
  userName: string,
  storyData: {
    title: string;
    grammarScore: number;
    creativityScore: number;
    overallScore: number;
    feedback: string;
  }
): Promise<boolean> {
  return await sendEmail(userEmail, 'storyCompleted', {
    name: userName,
    storyTitle: storyData.title,
    grammarScore: storyData.grammarScore,
    creativityScore: storyData.creativityScore,
    overallScore: storyData.overallScore,
    feedback: storyData.feedback,
  });
}

export async function sendMentorCommentEmail(
  studentEmail: string,
  studentName: string,
  commentData: {
    mentorName: string;
    storyTitle: string;
    storyId: string;
    commentContent: string;
    commentType: string;
  }
): Promise<boolean> {
  return await sendEmail(studentEmail, 'mentorComment', {
    studentName,
    mentorName: commentData.mentorName,
    storyTitle: commentData.storyTitle,
    storyId: commentData.storyId,
    commentContent: commentData.commentContent,
    commentType: commentData.commentType,
  });
}

export async function sendWeeklyProgressEmail(
  userEmail: string,
  userName: string,
  progressData: {
    storiesCompleted: number;
    wordsWritten: number;
    mentorComments: number;
    averageScore: number;
    achievements: string[];
    grammarImprovement: number;
    creativityImprovement: number;
    writingStreak: number;
  }
): Promise<boolean> {
  return await sendEmail(userEmail, 'weeklyProgress', {
    name: userName,
    ...progressData,
  });
}

export async function sendAchievementEmail(
  userEmail: string,
  userName: string,
  achievementData: {
    achievementName: string;
    achievementDescription: string;
    achievementIcon?: string;
    rewardUnlocked?: string;
  }
): Promise<boolean> {
  return await sendEmail(userEmail, 'achievementUnlocked', {
    name: userName,
    ...achievementData,
  });
}

// Bulk email sending for admin notifications
export async function sendBulkEmail(
  recipients: string[],
  type: EmailType,
  data: any
): Promise<{ success: number; failed: number; errors: string[] }> {
  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[],
  };

  // Send emails in batches to avoid overwhelming the SMTP server
  const batchSize = 10;
  const batches = [];
  
  for (let i = 0; i < recipients.length; i += batchSize) {
    batches.push(recipients.slice(i, i + batchSize));
  }

  for (const batch of batches) {
    const promises = batch.map(async (email) => {
      try {
        const success = await sendEmail(email, type, data);
        if (success) {
          results.success++;
        } else {
          results.failed++;
          results.errors.push(`Failed to send to ${email}`);
        }
      } catch (error) {
        results.failed++;
        results.errors.push(`Error sending to ${email}: ${error}`);
      }
    });

    await Promise.all(promises);
    
    // Small delay between batches
    if (batches.indexOf(batch) < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
}

// Email queue for better performance (basic implementation)
interface EmailQueueItem {
  id: string;
  to: string | string[];
  type: EmailType;
  data: any;
  options?: any;
  attempts: number;
  createdAt: Date;
  scheduledFor?: Date;
}

const emailQueue: EmailQueueItem[] = [];
let isProcessing = false;

export async function queueEmail(
  to: string | string[],
  type: EmailType,
  data: any,
  options: { delay?: number; [key: string]: any } = {}
): Promise<string> {
  const queueItem: EmailQueueItem = {
    id: generateEmailId(),
    to,
    type,
    data,
    options,
    attempts: 0,
    createdAt: new Date(),
    scheduledFor: options.delay ? new Date(Date.now() + options.delay) : new Date(),
  };

  emailQueue.push(queueItem);
  
  if (!isProcessing) {
    processEmailQueue();
  }

  return queueItem.id;
}

async function processEmailQueue(): Promise<void> {
  if (isProcessing) return;
  isProcessing = true;

  while (emailQueue.length > 0) {
    const now = new Date();
    const readyItems = emailQueue.filter(item => 
      item.scheduledFor && item.scheduledFor <= now
    );

    if (readyItems.length === 0) {
      // Wait a bit before checking again
      await new Promise(resolve => setTimeout(resolve, 5000));
      continue;
    }

    for (const item of readyItems) {
      try {
        const success = await sendEmail(item.to, item.type, item.data, item.options);
        
        if (success) {
          // Remove from queue
          const index = emailQueue.indexOf(item);
          if (index > -1) {
            emailQueue.splice(index, 1);
          }
        } else {
          // Retry logic
          item.attempts++;
          if (item.attempts >= 3) {
            // Remove after 3 failed attempts
            const index = emailQueue.indexOf(item);
            if (index > -1) {
              emailQueue.splice(index, 1);
            }
            console.error(`Failed to send email after 3 attempts: ${item.id}`);
          } else {
            // Schedule retry in 5 minutes
            item.scheduledFor = new Date(Date.now() + 5 * 60 * 1000);
          }
        }
      } catch (error) {
        console.error(`Error processing email queue item ${item.id}:`, error);
        
        item.attempts++;
        if (item.attempts >= 3) {
          const index = emailQueue.indexOf(item);
          if (index > -1) {
            emailQueue.splice(index, 1);
          }
        } else {
          item.scheduledFor = new Date(Date.now() + 5 * 60 * 1000);
        }
      }
    }

    // Small delay between processing batches
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  isProcessing = false;
}

function generateEmailId(): string {
  return `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Email verification helpers
export async function verifyEmailConnection(): Promise<boolean> {
  try {
    const transporter = await getTransporter();
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('Email connection verification failed:', error);
    return false;
  }
}

export function getEmailQueueStatus(): {
  queueLength: number;
  isProcessing: boolean;
  oldestItem?: Date;
} {
  return {
    queueLength: emailQueue.length,
    isProcessing,
    oldestItem: emailQueue.length > 0 
      ? emailQueue.reduce((oldest, item) => 
          item.createdAt < oldest ? item.createdAt : oldest, 
          emailQueue[0].createdAt
        )
      : undefined,
  };
}