import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { connectToDatabase } from '@/utils/db';
import mongoose from 'mongoose';

// Security event logging schema
const SecurityEventSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['failed_login', 'suspicious_activity', 'content_violation', 'rate_limit_exceeded', 'invalid_token', 'permission_denied'],
    required: true,
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  ipAddress: {
    type: String,
    required: true,
  },
  userAgent: {
    type: String,
    required: true,
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    required: false,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: { expireAfterSeconds: 2592000 }, // 30 days TTL
  },
  resolved: {
    type: Boolean,
    default: false,
  },
});

const SecurityEvent = mongoose.models.SecurityEvent || mongoose.model('SecurityEvent', SecurityEventSchema);

// Content filtering and validation
export class ContentFilter {
  private static inappropriateWords = [
    // Add comprehensive list of inappropriate words
    'violence', 'hate', 'discrimination', 'bullying', 'inappropriate',
    // This would be a much larger list in production
  ];

  private static suspiciousPatterns = [
    /\b(?:password|login|hack|exploit)\b/gi,
    /\b(?:admin|root|system)\b/gi,
    /[<>'"&]/g, // Basic XSS patterns
  ];

  static filterContent(content: string): {
    isClean: boolean;
    violations: string[];
    cleanedContent: string;
  } {
    const violations: string[] = [];
    let cleanedContent = content;

    // Check for inappropriate words
    for (const word of this.inappropriateWords) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      if (regex.test(content)) {
        violations.push(`Inappropriate word: ${word}`);
        cleanedContent = cleanedContent.replace(regex, '***');
      }
    }

    // Check for suspicious patterns
    for (const pattern of this.suspiciousPatterns) {
      if (pattern.test(content)) {
        violations.push('Suspicious pattern detected');
        cleanedContent = cleanedContent.replace(pattern, '***');
      }
    }

    // Check for excessive capitalization (possible spam)
    const upperCaseRatio = (content.match(/[A-Z]/g) || []).length / content.length;
    if (upperCaseRatio > 0.7 && content.length > 10) {
      violations.push('Excessive capitalization');
    }

    // Check for repeated characters (spam pattern)
    if (/(.)\1{4,}/.test(content)) {
      violations.push('Repeated character spam');
    }

    return {
      isClean: violations.length === 0,
      violations,
      cleanedContent,
    };
  }

  static validateFileName(filename: string): {
    isValid: boolean;
    sanitizedName: string;
    violations: string[];
  } {
    const violations: string[] = [];
    let sanitizedName = filename;

    // Remove dangerous characters
    sanitizedName = sanitizedName.replace(/[<>:"/\\|?*]/g, '');
    
    // Remove leading/trailing dots and spaces
    sanitizedName = sanitizedName.replace(/^[\s.]+|[\s.]+$/g, '');
    
    // Check for dangerous extensions
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.vbs', '.js'];
    const extension = sanitizedName.toLowerCase().substring(sanitizedName.lastIndexOf('.'));
    
    if (dangerousExtensions.includes(extension)) {
      violations.push('Dangerous file extension');
      sanitizedName = sanitizedName.replace(extension, '.txt');
    }

    // Check for reserved names (Windows)
    const reservedNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'];
    const nameWithoutExt = sanitizedName.substring(0, sanitizedName.lastIndexOf('.'));
    
    if (reservedNames.includes(nameWithoutExt.toUpperCase())) {
      violations.push('Reserved filename');
      sanitizedName = `file_${sanitizedName}`;
    }

    // Ensure reasonable length
    if (sanitizedName.length > 255) {
      violations.push('Filename too long');
      const ext = sanitizedName.substring(sanitizedName.lastIndexOf('.'));
      sanitizedName = sanitizedName.substring(0, 255 - ext.length) + ext;
    }

    return {
      isValid: violations.length === 0,
      sanitizedName,
      violations,
    };
  }
}

// Input sanitization and validation
export class InputSanitizer {
  static sanitizeHTML(input: string): string {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  static sanitizeSQL(input: string): string {
    return input
      .replace(/'/g, "''")
      .replace(/;/g, '')
      .replace(/--/g, '')
      .replace(/\/\*/g, '')
      .replace(/\*\//g, '');
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  static validateAge(age: number): boolean {
    return Number.isInteger(age) && age >= 2 && age <= 18;
  }

  static sanitizeStoryContent(content: string): string {
    // Remove potentially dangerous content while preserving story formatting
    let sanitized = content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
      .replace(/javascript:/gi, '') // Remove javascript: links
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();

    // Limit content length
    if (sanitized.length > 5000) {
      sanitized = sanitized.substring(0, 5000);
    }

    return sanitized;
  }
}

// CSRF protection
export class CSRFProtection {
  private static readonly SECRET_KEY = process.env.CSRF_SECRET || 'default-csrf-secret';

  static generateToken(sessionId: string): string {
    const timestamp = Date.now().toString();
    const data = `${sessionId}:${timestamp}`;
    const hash = crypto.createHmac('sha256', this.SECRET_KEY).update(data).digest('hex');
    return `${timestamp}.${hash}`;
  }

  static validateToken(token: string, sessionId: string): boolean {
    try {
      const [timestamp, hash] = token.split('.');
      const data = `${sessionId}:${timestamp}`;
      const expectedHash = crypto.createHmac('sha256', this.SECRET_KEY).update(data).digest('hex');
      
      if (hash !== expectedHash) {
        return false;
      }

      // Check if token is not too old (1 hour)
      const tokenTime = parseInt(timestamp);
      const currentTime = Date.now();
      const maxAge = 60 * 60 * 1000; // 1 hour
      
      return (currentTime - tokenTime) <= maxAge;
    } catch (error) {
      return false;
    }
  }
}

// Security headers utility
export class SecurityHeaders {
  static getSecurityHeaders(): Record<string, string> {
    return {
      // Prevent clickjacking
      'X-Frame-Options': 'DENY',
      
      // Prevent MIME type sniffing
      'X-Content-Type-Options': 'nosniff',
      
      // Enable XSS protection
      'X-XSS-Protection': '1; mode=block',
      
      // Referrer policy
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      
      // Content Security Policy
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdnjs.cloudflare.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https:",
        "connect-src 'self' https://api.openai.com https://api.anthropic.com https://generativelanguage.googleapis.com",
        "frame-src 'none'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "upgrade-insecure-requests"
      ].join('; '),
      
      // Permissions policy
      'Permissions-Policy': [
        'camera=()',
        'microphone=()',
        'geolocation=()',
        'payment=()',
        'usb=()',
        'bluetooth=()',
        'magnetometer=()',
        'accelerometer=()',
        'gyroscope=()'
      ].join(', '),
      
      // Strict Transport Security
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    };
  }
}

// Security event logging
export class SecurityLogger {
  static async logEvent(
    type: string,
    req: NextRequest,
    details: any = {},
    userId?: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<void> {
    try {
      await connectToDatabase();

      const event = new SecurityEvent({
        type,
        severity,
        userId,
        ipAddress: this.getClientIP(req),
        userAgent: req.headers.get('user-agent') || 'unknown',
        details,
      });

      await event.save();

      // For critical events, you might want to send immediate alerts
      if (severity === 'critical') {
        await this.sendSecurityAlert(event);
      }
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  private static getClientIP(req: NextRequest): string {
    return req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
           req.headers.get('x-real-ip') ||
           req.headers.get('cf-connecting-ip') ||
           'unknown';
  }

  private static async sendSecurityAlert(event: any): Promise<void> {
    // In production, integrate with alerting system (email, Slack, etc.)
    console.error('CRITICAL SECURITY EVENT:', {
      type: event.type,
      ip: event.ipAddress,
      details: event.details,
      timestamp: event.timestamp,
    });
  }

  static async getRecentEvents(limit = 100): Promise<any[]> {
    try {
      await connectToDatabase();
      return await SecurityEvent.find()
        .sort({ timestamp: -1 })
        .limit(limit)
        .lean();
    } catch (error) {
      console.error('Failed to get security events:', error);
      return [];
    }
  }

  static async getEventsByIP(ipAddress: string, hours = 24): Promise<any[]> {
    try {
      await connectToDatabase();
      const since = new Date(Date.now() - hours * 60 * 60 * 1000);
      
      return await SecurityEvent.find({
        ipAddress,
        timestamp: { $gte: since },
      })
        .sort({ timestamp: -1 })
        .lean();
    } catch (error) {
      console.error('Failed to get events by IP:', error);
      return [];
    }
  }
}

// Suspicious activity detection
export class ThreatDetection {
  static async analyzeRequest(req: NextRequest, userId?: string): Promise<{
    riskScore: number;
    threats: string[];
    shouldBlock: boolean;
  }> {
    const threats: string[] = [];
    let riskScore = 0;

    const ip = this.getClientIP(req);
    const userAgent = req.headers.get('user-agent') || '';
    const url = new URL(req.url);

    // Check for suspicious IP patterns
    if (await this.isKnownMaliciousIP(ip)) {
      threats.push('Known malicious IP');
      riskScore += 50;
    }

    // Check for bot-like behavior
    if (this.isLikelyBot(userAgent)) {
      threats.push('Bot-like user agent');
      riskScore += 20;
    }

    // Check for SQL injection patterns in URL
    if (this.hasSQLInjectionPatterns(url.search)) {
      threats.push('SQL injection attempt');
      riskScore += 40;
    }

    // Check for XSS patterns
    if (this.hasXSSPatterns(url.search)) {
      threats.push('XSS attempt');
      riskScore += 30;
    }

    // Check for excessive request frequency from IP
    if (await this.hasExcessiveRequestFrequency(ip)) {
      threats.push('Excessive request frequency');
      riskScore += 25;
    }

    // Check for suspicious user behavior patterns
    if (userId) {
      const userRisk = await this.analyzeUserBehavior(userId);
      riskScore += userRisk.score;
      threats.push(...userRisk.threats);
    }

    // Check for geographic anomalies
    const geoRisk = await this.analyzeGeographicRisk(ip, userId);
    riskScore += geoRisk.score;
    if (geoRisk.threat) threats.push(geoRisk.threat);

    return {
      riskScore: Math.min(riskScore, 100),
      threats,
      shouldBlock: riskScore >= 70,
    };
  }

  private static getClientIP(req: NextRequest): string {
    return req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
           req.headers.get('x-real-ip') ||
           req.headers.get('cf-connecting-ip') ||
           'unknown';
  }

  private static async isKnownMaliciousIP(ip: string): Promise<boolean> {
    // In production, integrate with threat intelligence APIs
    // For now, implement basic checks
    const maliciousPatterns = [
      /^10\.0\.0\.1$/, // Example internal IP that shouldn't access externally
      /^192\.168\./, // Private IPs (might be suspicious if coming from outside)
    ];

    return maliciousPatterns.some(pattern => pattern.test(ip));
  }

  private static isLikelyBot(userAgent: string): boolean {
    const botPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
      /python-requests/i,
      /^$/,
    ];

    return botPatterns.some(pattern => pattern.test(userAgent));
  }

  private static hasSQLInjectionPatterns(queryString: string): boolean {
    const sqlPatterns = [
      /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
      /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
      /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
      /((\%27)|(\'))union/i,
      /exec(\s|\+)+(s|x)p\w+/i,
      /union([^a-zA-Z]|[\s])+select/i,
    ];

    return sqlPatterns.some(pattern => pattern.test(queryString));
  }

  private static hasXSSPatterns(queryString: string): boolean {
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /eval\(/gi,
      /expression\(/gi,
    ];

    return xssPatterns.some(pattern => pattern.test(decodeURIComponent(queryString)));
  }

  private static async hasExcessiveRequestFrequency(ip: string): Promise<boolean> {
    try {
      await connectToDatabase();
      
      // Check requests in last 5 minutes
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const recentEvents = await SecurityEvent.countDocuments({
        ipAddress: ip,
        timestamp: { $gte: fiveMinutesAgo },
      });

      return recentEvents > 50; // More than 50 requests in 5 minutes
    } catch (error) {
      console.error('Failed to check request frequency:', error);
      return false;
    }
  }

  private static async analyzeUserBehavior(userId: string): Promise<{
    score: number;
    threats: string[];
  }> {
    const threats: string[] = [];
    let score = 0;

    try {
      await connectToDatabase();
      
      // Check for multiple failed login attempts
      const recentFailedLogins = await SecurityEvent.countDocuments({
        userId,
        type: 'failed_login',
        timestamp: { $gte: new Date(Date.now() - 60 * 60 * 1000) }, // Last hour
      });

      if (recentFailedLogins > 3) {
        threats.push('Multiple failed login attempts');
        score += 15;
      }

      // Check for rapid content creation (potential spam)
      const recentStoryCreations = await SecurityEvent.countDocuments({
        userId,
        type: 'story_created',
        timestamp: { $gte: new Date(Date.now() - 60 * 60 * 1000) }, // Last hour
      });

      if (recentStoryCreations > 10) {
        threats.push('Rapid content creation');
        score += 20;
      }

      // Check for permission violations
      const recentPermissionDenials = await SecurityEvent.countDocuments({
        userId,
        type: 'permission_denied',
        timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours
      });

      if (recentPermissionDenials > 5) {
        threats.push('Multiple permission violations');
        score += 25;
      }

    } catch (error) {
      console.error('Failed to analyze user behavior:', error);
    }

    return { score, threats };
  }

  private static async analyzeGeographicRisk(ip: string, userId?: string): Promise<{
    score: number;
    threat?: string;
  }> {
    // In production, integrate with IP geolocation services
    // For now, implement basic checks
    
    try {
      // Check if IP is from a high-risk country (implement based on requirements)
      // This is a simplified example
      const highRiskCountries = ['CN', 'RU', 'IR', 'KP']; // Example list
      
      // In a real implementation, you'd call a geolocation API here
      // const geoData = await getIPGeolocation(ip);
      
      // For demonstration, return no risk
      return { score: 0 };
    } catch (error) {
      console.error('Failed to analyze geographic risk:', error);
      return { score: 0 };
    }
  }
}

// Password security utilities
export class PasswordSecurity {
  private static readonly MIN_LENGTH = 8;
  private static readonly MIN_ENTROPY = 40;

  static validatePassword(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (password.length < this.MIN_LENGTH) {
      feedback.push(`Password must be at least ${this.MIN_LENGTH} characters long`);
    } else {
      score += Math.min(25, password.length * 2);
    }

    // Character variety
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasDigits = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    const varietyCount = [hasLowercase, hasUppercase, hasDigits, hasSpecialChars].filter(Boolean).length;
    score += varietyCount * 15;

    if (!hasLowercase) feedback.push('Add lowercase letters');
    if (!hasUppercase) feedback.push('Add uppercase letters');
    if (!hasDigits) feedback.push('Add numbers');
    if (!hasSpecialChars) feedback.push('Add special characters');

    // Common patterns check
    if (/123456|password|qwerty|abc123/i.test(password)) {
      feedback.push('Avoid common patterns');
      score -= 20;
    }

    // Repetitive characters
    if (/(.)\1{2,}/.test(password)) {
      feedback.push('Avoid repetitive characters');
      score -= 10;
    }

    // Calculate entropy
    const entropy = this.calculateEntropy(password);
    if (entropy < this.MIN_ENTROPY) {
      feedback.push('Password is too predictable');
      score -= 15;
    }

    score = Math.max(0, Math.min(100, score));
    const isValid = score >= 60 && feedback.filter(f => f.includes('must')).length === 0;

    return {
      isValid,
      score,
      feedback,
    };
  }

  private static calculateEntropy(password: string): number {
    const charset = new Set(password).size;
    return password.length * Math.log2(charset);
  }

  static async checkPasswordBreach(passwordHash: string): Promise<boolean> {
    // In production, integrate with HaveIBeenPwned API
    // For now, return false (not breached)
    return false;
  }

  static generateSecurePassword(length = 12): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const digits = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const all = lowercase + uppercase + digits + special;
    
    let password = '';
    
    // Ensure at least one character from each set
    password += this.getRandomChar(lowercase);
    password += this.getRandomChar(uppercase);
    password += this.getRandomChar(digits);
    password += this.getRandomChar(special);
    
    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += this.getRandomChar(all);
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  private static getRandomChar(charset: string): string {
    return charset.charAt(Math.floor(Math.random() * charset.length));
  }
}

// File security scanner
export class FileSecurity {
  private static readonly ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  static validateFile(file: {
    name: string;
    size: number;
    type: string;
    buffer?: Buffer;
  }): {
    isValid: boolean;
    violations: string[];
  } {
    const violations: string[] = [];

    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      violations.push('File size exceeds maximum allowed size');
    }

    // Check MIME type
    if (!this.ALLOWED_MIME_TYPES.includes(file.type)) {
      violations.push('File type not allowed');
    }

    // Check filename
    const nameValidation = ContentFilter.validateFileName(file.name);
    if (!nameValidation.isValid) {
      violations.push(...nameValidation.violations);
    }

    // Scan for malicious content if buffer is provided
    if (file.buffer) {
      const malwareCheck = this.scanForMalware(file.buffer);
      if (!malwareCheck.isClean) {
        violations.push(...malwareCheck.threats);
      }
    }

    return {
      isValid: violations.length === 0,
      violations,
    };
  }

  private static scanForMalware(buffer: Buffer): {
    isClean: boolean;
    threats: string[];
  } {
    const threats: string[] = [];
    const content = buffer.toString('binary');

    // Check for executable signatures
    if (content.startsWith('MZ')) {
      threats.push('Executable file detected');
    }

    // Check for script content in images
    if (/<script|javascript:|on\w+\s*=/i.test(content)) {
      threats.push('Script content in file');
    }

    // Check for PHP tags
    if (/<\?php/i.test(content)) {
      threats.push('PHP code detected');
    }

    return {
      isClean: threats.length === 0,
      threats,
    };
  }
}

// Session security
export class SessionSecurity {
  static generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  static validateSession(sessionToken: string, userId: string): boolean {
    // In production, validate against stored session data
    // This is a simplified implementation
    return sessionToken.length === 64 && /^[a-f0-9]+$/.test(sessionToken);
  }

  static async detectSessionHijacking(
    sessionToken: string,
    currentIP: string,
    currentUserAgent: string,
    userId: string
  ): Promise<boolean> {
    try {
      await connectToDatabase();
      
      // Check for rapid IP changes
      const recentSessions = await SecurityEvent.find({
        userId,
        type: 'session_activity',
        timestamp: { $gte: new Date(Date.now() - 60 * 60 * 1000) }, // Last hour
      }).lean();

      const uniqueIPs = new Set(recentSessions.map(s => s.ipAddress));
      
      // If more than 3 different IPs in an hour, it's suspicious
      if (uniqueIPs.size > 3) {
        await SecurityLogger.logEvent(
          'suspicious_activity',
          { headers: { get: () => currentUserAgent } } as any,
          { reason: 'Multiple IP addresses for session', sessionToken },
          userId,
          'high'
        );
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to detect session hijacking:', error);
      return false;
    }
  }
}

// Export main security functions
export {
  ContentFilter,
  InputSanitizer,
  CSRFProtection,
  SecurityHeaders,
  SecurityLogger,
  ThreatDetection,
  PasswordSecurity,
  FileSecurity,
  SessionSecurity,
};

// Main security middleware wrapper
export async function securityMiddleware(req: NextRequest, userId?: string): Promise<{
  passed: boolean;
  violations: string[];
  riskScore: number;
}> {
  const violations: string[] = [];
  let riskScore = 0;

  try {
    // Analyze request for threats
    const threatAnalysis = await ThreatDetection.analyzeRequest(req, userId);
    riskScore = threatAnalysis.riskScore;
    
    if (threatAnalysis.shouldBlock) {
      violations.push(...threatAnalysis.threats);
      
      // Log security event
      await SecurityLogger.logEvent(
        'suspicious_activity',
        req,
        { threats: threatAnalysis.threats, riskScore },
        userId,
        riskScore > 80 ? 'critical' : 'high'
      );
    }

    return {
      passed: !threatAnalysis.shouldBlock,
      violations,
      riskScore,
    };
  } catch (error) {
    console.error('Security middleware error:', error);
    return {
      passed: true, // Allow on error to avoid blocking legitimate users
      violations: [],
      riskScore: 0,
    };
  }
}