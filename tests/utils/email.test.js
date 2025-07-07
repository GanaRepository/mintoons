import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { EmailService } from '../lib/email';
import nodemailer from 'nodemailer';

// Mock nodemailer
jest.mock('nodemailer');
const mockNodemailer = nodemailer as jest.Mocked<typeof nodemailer>;

// Mock React DOM server
jest.mock('react-dom/server', () => ({
  renderToString: jest.fn().mockReturnValue('<html>Mocked email template</html>')
}));

describe('EmailService', () => {
  let emailService: EmailService;
  let mockTransporter: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockTransporter = {
      sendMail: jest.fn().mockResolvedValue({
        messageId: 'test-message-id',
        response: '250 Message accepted'
      }),
      verify: jest.fn().mockResolvedValue(true)
    };

    mockNodemailer.createTransporter.mockReturnValue(mockTransporter);
    
    emailService = new EmailService({
      host: 'smtp.test.com',
      port: 587,
      secure: false,
      auth: {
        user: 'test@example.com',
        pass: 'testpassword'
      }
    });
  });

  describe('Constructor and Configuration', () => {
    it('creates email service with valid configuration', () => {
      expect(emailService).toBeInstanceOf(EmailService);
      expect(mockNodemailer.createTransporter).toHaveBeenCalledWith({
        host: 'smtp.test.com',
        port: 587,
        secure: false,
        auth: {
          user: 'test@example.com',
          pass: 'testpassword'
        }
      });
    });

    it('verifies SMTP connection on initialization', async () => {
      await emailService.verifyConnection();
      expect(mockTransporter.verify).toHaveBeenCalled();
    });

    it('handles connection verification errors', async () => {
      mockTransporter.verify.mockRejectedValueOnce(new Error('Connection failed'));
      
      await expect(emailService.verifyConnection()).rejects.toThrow('Connection failed');
    });
  });

  describe('Template Email Sending', () => {
    it('sends welcome email successfully', async () => {
      const result = await emailService.sendTemplateEmail({
        to: 'newuser@example.com',
        templateType: 'welcome',
        data: {
          name: 'New User',
          email: 'newuser@example.com'
        }
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('test-message-id');
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: 'test@example.com',
        to: 'newuser@example.com',
        subject: 'Welcome to Mintoons!',
        html: '<html>Mocked email template</html>',
        text: expect.any(String)
      });
    });

    it('sends password reset email successfully', async () => {
      const resetUrl = 'https://mintoons.com/reset-password?token=abc123';
      
      const result = await emailService.sendTemplateEmail({
        to: 'user@example.com',
        templateType: 'password-reset',
        data: {
          name: 'John Doe',
          resetUrl: resetUrl
        }
      });

      expect(result.success).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: 'Reset Your Mintoons Password'
        })
      );
    });

    it('sends story published notification', async () => {
      const result = await emailService.sendTemplateEmail({
        to: 'author@example.com',
        templateType: 'story-published',
        data: {
          name: 'Young Author',
          storyTitle: 'My Amazing Adventure',
          storyUrl: 'https://mintoons.com/story/123'
        }
      });

      expect(result.success).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Your Story "My Amazing Adventure" is Now Published!'
        })
      );
    });

    it('sends mentor feedback notification', async () => {
      const result = await emailService.sendTemplateEmail({
        to: 'student@example.com',
        templateType: 'mentor-feedback',
        data: {
          name: 'Student Name',
          mentorName: 'Ms. Johnson',
          storyTitle: 'The Magic Forest',
          feedbackUrl: 'https://mintoons.com/story/123#comments'
        }
      });

      expect(result.success).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'New Feedback on "The Magic Forest"'
        })
      );
    });

    it('sends achievement notification', async () => {
      const result = await emailService.sendTemplateEmail({
        to: 'student@example.com',
        templateType: 'achievement',
        data: {
          name: 'Alex Student',
          achievementTitle: 'First Story Published',
          achievementDescription: 'Congratulations on publishing your first story!',
          xpEarned: 100
        }
      });

      expect(result.success).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Achievement Unlocked: First Story Published!'
        })
      );
    });
  });

  describe('Bulk Email Operations', () => {
    it('sends bulk emails successfully', async () => {
      const recipients = [
        { to: 'user1@example.com', data: { name: 'User 1' } },
        { to: 'user2@example.com', data: { name: 'User 2' } },
        { to: 'user3@example.com', data: { name: 'User 3' } }
      ];

      const results = await emailService.sendBulkEmails({
        templateType: 'welcome',
        recipients: recipients
      });

      expect(results.successful).toBe(3);
      expect(results.failed).toBe(0);
      expect(results.results).toHaveLength(3);
      expect(mockTransporter.sendMail).toHaveBeenCalledTimes(3);
    });

    it('handles partial failures in bulk sending', async () => {
      const recipients = [
        { to: 'user1@example.com', data: { name: 'User 1' } },
        { to: 'invalid-email', data: { name: 'User 2' } },
        { to: 'user3@example.com', data: { name: 'User 3' } }
      ];

      mockTransporter.sendMail
        .mockResolvedValueOnce({ messageId: 'msg1' })
        .mockRejectedValueOnce(new Error('Invalid email'))
        .mockResolvedValueOnce({ messageId: 'msg3' });

      const results = await emailService.sendBulkEmails({
        templateType: 'welcome',
        recipients: recipients
      });

      expect(results.successful).toBe(2);
      expect(results.failed).toBe(1);
      expect(results.results[1].success).toBe(false);
      expect(results.results[1].error).toBe('Invalid email');
    });

    it('respects rate limiting in bulk operations', async () => {
      const recipients = Array.from({ length: 10 }, (_, i) => ({
        to: `user${i}@example.com`,
        data: { name: `User ${i}` }
      }));

      const startTime = Date.now();
      await emailService.sendBulkEmails({
        templateType: 'welcome',
        recipients: recipients,
        rateLimit: 5 // 5 emails per second
      });
      const endTime = Date.now();

      // Should take at least 1 second due to rate limiting
      expect(endTime - startTime).toBeGreaterThan(900);
    });
  });

  describe('Email Queue Management', () => {
    it('adds emails to queue', async () => {
      await emailService.addToQueue({
        to: 'queued@example.com',
        templateType: 'welcome',
        data: { name: 'Queued User' },
        priority: 'high',
        scheduledFor: new Date(Date.now() + 3600000) // 1 hour from now
      });

      const queueStatus = await emailService.getQueueStatus();
      expect(queueStatus.pending).toBe(1);
      expect(queueStatus.total).toBe(1);
    });

    it('processes queued emails', async () => {
      // Add multiple emails to queue
      await emailService.addToQueue({
        to: 'user1@example.com',
        templateType: 'welcome',
        data: { name: 'User 1' },
        priority: 'high'
      });

      await emailService.addToQueue({
        to: 'user2@example.com',
        templateType: 'welcome',
        data: { name: 'User 2' },
        priority: 'low'
      });

      const processed = await emailService.processQueue(5);
      expect(processed).toBe(2);
      expect(mockTransporter.sendMail).toHaveBeenCalledTimes(2);
    });

    it('processes emails by priority', async () => {
      // Add emails with different priorities
      const lowPriorityEmail = {
        to: 'low@example.com',
        templateType: 'welcome' as const,
        data: { name: 'Low Priority' },
        priority: 'low' as const
      };

      const highPriorityEmail = {
        to: 'high@example.com',
        templateType: 'welcome' as const,
        data: { name: 'High Priority' },
        priority: 'high' as const
      };

      await emailService.addToQueue(lowPriorityEmail);
      await emailService.addToQueue(highPriorityEmail);

      const processedEmails: any[] = [];
      mockTransporter.sendMail.mockImplementation((mailOptions) => {
        processedEmails.push(mailOptions.to);
        return Promise.resolve({ messageId: 'test' });
      });

      await emailService.processQueue(2);

      // High priority should be processed first
      expect(processedEmails[0]).toBe('high@example.com');
      expect(processedEmails[1]).toBe('low@example.com');
    });

    it('handles scheduled emails', async () => {
      const futureDate = new Date(Date.now() + 3600000); // 1 hour from now
      
      await emailService.addToQueue({
        to: 'scheduled@example.com',
        templateType: 'welcome',
        data: { name: 'Scheduled User' },
        scheduledFor: futureDate
      });

      // Should not process scheduled emails before their time
      const processed = await emailService.processQueue(10);
      expect(processed).toBe(0);
    });
  });

  describe('Email Templates', () => {
    it('generates correct subject lines for different templates', () => {
      const templates = [
        { type: 'welcome', expected: 'Welcome to Mintoons!' },
        { type: 'password-reset', expected: 'Reset Your Mintoons Password' },
        { type: 'story-published', expected: expect.stringContaining('Published') },
        { type: 'mentor-feedback', expected: expect.stringContaining('Feedback') },
        { type: 'achievement', expected: expect.stringContaining('Achievement') }
      ];

      templates.forEach(({ type, expected }) => {
        const subject = emailService.getTemplateSubject(type as any, {
          storyTitle: 'Test Story',
          achievementTitle: 'Test Achievement'
        });
        
        if (typeof expected === 'string') {
          expect(subject).toBe(expected);
        } else {
          expect(subject).toEqual(expected);
        }
      });
    });

    it('renders templates with proper data interpolation', async () => {
      const templateData = {
        name: 'John Doe',
        storyTitle: 'The Magic Adventure',
        storyUrl: 'https://mintoons.com/story/123'
      };

      await emailService.sendTemplateEmail({
        to: 'test@example.com',
        templateType: 'story-published',
        data: templateData
      });

      // Verify that React renderToString was called with proper props
      const { renderToString } = require('react-dom/server');
      expect(renderToString).toHaveBeenCalledWith(
        expect.objectContaining({
          props: expect.objectContaining({
            type: 'story-published',
            data: templateData
          })
        })
      );
    });
  });

  describe('Error Handling and Retry Logic', () => {
    it('retries failed email sends', async () => {
      mockTransporter.sendMail
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockResolvedValueOnce({ messageId: 'success' });

      const result = await emailService.sendTemplateEmail({
        to: 'retry@example.com',
        templateType: 'welcome',
        data: { name: 'Retry User' }
      }, { maxRetries: 3 });

      expect(result.success).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledTimes(3);
    });

    it('fails after max retries exceeded', async () => {
      mockTransporter.sendMail.mockRejectedValue(new Error('Persistent failure'));

      const result = await emailService.sendTemplateEmail({
        to: 'fail@example.com',
        templateType: 'welcome',
        data: { name: 'Fail User' }
      }, { maxRetries: 2 });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Persistent failure');
      expect(mockTransporter.sendMail).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    it('validates email addresses before sending', async () => {
      const result = await emailService.sendTemplateEmail({
        to: 'invalid-email-address',
        templateType: 'welcome',
        data: { name: 'Invalid User' }
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid email address');
      expect(mockTransporter.sendMail).not.toHaveBeenCalled();
    });

    it('validates required template data', async () => {
      const result = await emailService.sendTemplateEmail({
        to: 'user@example.com',
        templateType: 'password-reset',
        data: { name: 'User' } // Missing resetUrl
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Missing required data');
    });
  });

  describe('Email Analytics and Tracking', () => {
    it('tracks email delivery statistics', async () => {
      // Send multiple emails
      await emailService.sendTemplateEmail({
        to: 'user1@example.com',
        templateType: 'welcome',
        data: { name: 'User 1' }
      });

      await emailService.sendTemplateEmail({
        to: 'user2@example.com',
        templateType: 'welcome',
        data: { name: 'User 2' }
      });

      const stats = await emailService.getDeliveryStats();
      expect(stats.sent).toBe(2);
      expect(stats.delivered).toBe(2);
      expect(stats.failed).toBe(0);
    });

    it('tracks template usage statistics', async () => {
      await emailService.sendTemplateEmail({
        to: 'user@example.com',
        templateType: 'welcome',
        data: { name: 'User' }
      });

      await emailService.sendTemplateEmail({
        to: 'user@example.com',
        templateType: 'story-published',
        data: { name: 'User', storyTitle: 'Story', storyUrl: 'url' }
      });

      const templateStats = await emailService.getTemplateStats();
      expect(templateStats.welcome).toBe(1);
      expect(templateStats['story-published']).toBe(1);
    });
  });

  describe('Security and Privacy', () => {
    it('sanitizes email content', async () => {
      const maliciousData = {
        name: '<script>alert("xss")</script>John',
        storyTitle: 'Story<img src="x" onerror="alert(1)">Title'
      };

      await emailService.sendTemplateEmail({
        to: 'user@example.com',
        templateType: 'story-published',
        data: maliciousData
      });

      // Verify that the HTML was sanitized
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.not.stringContaining('<script>')
        })
      );
    });

    it('validates email addresses for security', () => {
      const maliciousEmails = [
        'user@example.com\nBCC: attacker@evil.com',
        'user@example.com\rBCC: attacker@evil.com',
        'user@example.com%0ABcc:attacker@evil.com'
      ];

      maliciousEmails.forEach(async (email) => {
        const result = await emailService.sendTemplateEmail({
          to: email,
          templateType: 'welcome',
          data: { name: 'User' }
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain('Invalid email address');
      });
    });

    it('logs email activities for audit trail', async () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await emailService.sendTemplateEmail({
        to: 'user@example.com',
        templateType: 'welcome',
        data: { name: 'User' }
      });

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('Email sent'),
        expect.objectContaining({
          to: 'user@example.com',
          template: 'welcome'
        })
      );

      logSpy.mockRestore();
    });
  });

  describe('HTML to Text Conversion', () => {
    it('converts HTML email to plain text', () => {
      const htmlContent = '<h1>Welcome!</h1><p>This is a <strong>test</strong> email with <a href="http://example.com">links</a>.</p>';
      const textContent = emailService.htmlToText(htmlContent);

      expect(textContent).toContain('Welcome!');
      expect(textContent).toContain('This is a test email');
      expect(textContent).toContain('links (http://example.com)');
      expect(textContent).not.toContain('<h1>');
      expect(textContent).not.toContain('<strong>');
    });

    it('handles complex HTML structures', () => {
      const complexHtml = `
        <div>
          <h2>Story Published!</h2>
          <ul>
            <li>Title: My Story</li>
            <li>Author: John Doe</li>
          </ul>
          <blockquote>This is a great story!</blockquote>
        </div>
      `;

      const textContent = emailService.htmlToText(complexHtml);

      expect(textContent).toContain('Story Published!');
      expect(textContent).toContain('• Title: My Story');
      expect(textContent).toContain('• Author: John Doe');
      expect(textContent).toContain('> This is a great story!');
    });

    it('preserves important spacing and formatting', () => {
      const htmlWithSpacing = '<p>Paragraph 1</p><p>Paragraph 2</p><br><p>Paragraph 3</p>';
      const textContent = emailService.htmlToText(htmlWithSpacing);

      expect(textContent).toContain('Paragraph 1\n\nParagraph 2\n\nParagraph 3');
    });
  });

  describe('Configuration and Environment', () => {
    it('uses development configuration in test environment', () => {
      const devEmailService = new EmailService({
        host: 'localhost',
        port: 1025,
        secure: false,
        auth: null
      });

      expect(devEmailService).toBeInstanceOf(EmailService);
    });

    it('validates required configuration parameters', () => {
      expect(() => {
        new EmailService({} as any);
      }).toThrow('Invalid email configuration');
    });

    it('handles missing authentication gracefully in development', () => {
      const devConfig = {
        host: 'localhost',
        port: 1025,
        secure: false
      };

      expect(() => {
        new EmailService(devConfig as any);
      }).not.toThrow();
    });
  });

  describe('Performance and Optimization', () => {
    it('caches rendered templates for performance', async () => {
      const { renderToString } = require('react-dom/server');
      renderToString.mockClear();

      // Send the same template multiple times
      const templateData = { name: 'User', storyTitle: 'Story', storyUrl: 'url' };
      
      await emailService.sendTemplateEmail({
        to: 'user1@example.com',
        templateType: 'story-published',
        data: templateData
      });

      await emailService.sendTemplateEmail({
        to: 'user2@example.com',
        templateType: 'story-published',
        data: templateData
      });

      // Should cache and reuse the rendered template
      expect(renderToString).toHaveBeenCalledTimes(1);
    });

    it('handles concurrent email sending efficiently', async () => {
      const emailPromises = Array.from({ length: 10 }, (_, i) =>
        emailService.sendTemplateEmail({
          to: `user${i}@example.com`,
          templateType: 'welcome',
          data: { name: `User ${i}` }
        })
      );

      const results = await Promise.all(emailPromises);
      
      expect(results.every(result => result.success)).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledTimes(10);
    });

    it('implements connection pooling for high volume', async () => {
      // Send many emails to test connection reuse
      const manyEmails = Array.from({ length: 50 }, (_, i) =>
        emailService.sendTemplateEmail({
          to: `user${i}@example.com`,
          templateType: 'welcome',
          data: { name: `User ${i}` }
        })
      );

      await Promise.all(manyEmails);

      // Should reuse the same transporter connection
      expect(mockNodemailer.createTransporter).toHaveBeenCalledTimes(1);
    });
  });

  describe('Monitoring and Health Checks', () => {
    it('provides health check endpoint', async () => {
      const health = await emailService.getHealthStatus();
      
      expect(health.status).toBe('healthy');
      expect(health.lastChecked).toBeInstanceOf(Date);
      expect(health.queueSize).toBeGreaterThanOrEqual(0);
    });

    it('detects unhealthy SMTP connection', async () => {
      mockTransporter.verify.mockRejectedValueOnce(new Error('SMTP error'));
      
      const health = await emailService.getHealthStatus();
      
      expect(health.status).toBe('unhealthy');
      expect(health.error).toBe('SMTP error');
    });

    it('monitors queue performance', async () => {
      // Add emails to queue
      await emailService.addToQueue({
        to: 'user@example.com',
        templateType: 'welcome',
        data: { name: 'User' }
      });

      const metrics = await emailService.getPerformanceMetrics();
      
      expect(metrics.queueSize).toBe(1);
      expect(metrics.averageProcessingTime).toBeGreaterThan(0);
      expect(metrics.successRate).toBeGreaterThanOrEqual(0);
    });
  });
});