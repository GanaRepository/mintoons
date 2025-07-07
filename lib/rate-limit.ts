import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import mongoose from 'mongoose';

// Rate limit storage schema
const RateLimitSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  count: {
    type: Number,
    default: 0,
  },
  resetTime: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 }, // TTL index
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const RateLimit = mongoose.models.RateLimit || mongoose.model('RateLimit', RateLimitSchema);

// Rate limit configuration interface
interface RateLimitConfig {
  windowMs: number;     // Time window in milliseconds
  maxRequests: number;  // Maximum requests per window
  message?: string;     // Custom error message
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: NextRequest) => string;
  onLimitReached?: (req: NextRequest, key: string) => void;
}

// Default configurations for different endpoints
export const rateLimitConfigs = {
  // Authentication endpoints
  login: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: 'Too many login attempts. Please try again in 15 minutes.',
  },
  register: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    message: 'Too many registration attempts. Please try again in 1 hour.',
  },
  forgotPassword: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    message: 'Too many password reset requests. Please try again in 1 hour.',
  },
  
  // API endpoints
  apiGeneral: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    message: 'Too many API requests. Please slow down.',
  },
  
  // AI endpoints (more restrictive due to cost)
  aiGenerate: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 20,
    message: 'AI generation limit reached. Please wait before creating more stories.',
  },
  aiAssess: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 30,
    message: 'AI assessment limit reached. Please wait before assessing more stories.',
  },
  
  // File operations
  fileUpload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 50,
    message: 'File upload limit reached. Please wait before uploading more files.',
  },
  
  // Story operations
  storyCreate: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    message: 'Story creation limit reached. Please wait before creating more stories.',
  },
  storyUpdate: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 50,
    message: 'Too many story updates. Please slow down.',
  },
  
  // Comment operations
  commentCreate: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 20,
    message: 'Comment limit reached. Please wait before adding more comments.',
  },
  
  // Export operations
  exportPdf: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    message: 'PDF export limit reached. Please wait before exporting more files.',
  },
  
  // Admin operations
  adminOperations: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 200,
    message: 'Admin operation limit reached.',
  },
};

// Rate limiting class
export class RateLimiter {
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  async checkLimit(req: NextRequest): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: Date;
    totalHits: number;
  }> {
    const key = this.generateKey(req);
    const now = new Date();
    const windowStart = new Date(now.getTime() - this.config.windowMs);

    await connectToDatabase();

    try {
      // Find or create rate limit record
      let record = await RateLimit.findOne({ key });

      if (!record) {
        // Create new record
        record = new RateLimit({
          key,
          count: 1,
          resetTime: new Date(now.getTime() + this.config.windowMs),
        });
        await record.save();

        return {
          allowed: true,
          remaining: this.config.maxRequests - 1,
          resetTime: record.resetTime,
          totalHits: 1,
        };
      }

      // Check if window has expired
      if (now > record.resetTime) {
        // Reset the window
        record.count = 1;
        record.resetTime = new Date(now.getTime() + this.config.windowMs);
        await record.save();

        return {
          allowed: true,
          remaining: this.config.maxRequests - 1,
          resetTime: record.resetTime,
          totalHits: 1,
        };
      }

      // Increment counter
      record.count += 1;
      await record.save();

      const allowed = record.count <= this.config.maxRequests;
      const remaining = Math.max(0, this.config.maxRequests - record.count);

      if (!allowed && this.config.onLimitReached) {
        this.config.onLimitReached(req, key);
      }

      return {
        allowed,
        remaining,
        resetTime: record.resetTime,
        totalHits: record.count,
      };
    } catch (error) {
      console.error('Rate limit check failed:', error);
      // Allow request on error to avoid blocking legitimate users
      return {
        allowed: true,
        remaining: this.config.maxRequests,
        resetTime: new Date(now.getTime() + this.config.windowMs),
        totalHits: 0,
      };
    }
  }

  private generateKey(req: NextRequest): string {
    if (this.config.keyGenerator) {
      return this.config.keyGenerator(req);
    }

    // Default key generation based on IP and user agent
    const ip = this.getClientIP(req);
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const url = new URL(req.url);
    
    return `${ip}:${url.pathname}:${this.hashString(userAgent)}`;
  }

  private getClientIP(req: NextRequest): string {
    const forwarded = req.headers.get('x-forwarded-for');
    const realIP = req.headers.get('x-real-ip');
    const cloudflareIP = req.headers.get('cf-connecting-ip');
    
    if (cloudflareIP) return cloudflareIP;
    if (realIP) return realIP;
    if (forwarded) return forwarded.split(',')[0].trim();
    
    return 'unknown';
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }
}

// Middleware function for Next.js API routes
export function createRateLimitMiddleware(configName: keyof typeof rateLimitConfigs) {
  const config = rateLimitConfigs[configName];
  const limiter = new RateLimiter(config);

  return async function rateLimitMiddleware(req: NextRequest): Promise<NextResponse | null> {
    const result = await limiter.checkLimit(req);

    // Add rate limit headers
    const headers = new Headers({
      'X-RateLimit-Limit': config.maxRequests.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': Math.ceil(result.resetTime.getTime() / 1000).toString(),
      'X-RateLimit-Window': config.windowMs.toString(),
    });

    if (!result.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: config.message || 'Too many requests',
          retryAfter: Math.ceil((result.resetTime.getTime() - Date.now()) / 1000),
        },
        {
          status: 429,
          headers,
        }
      );
    }

    // Return null if allowed (continue to next middleware/handler)
    return null;
  };
}

// Custom rate limiter with user-specific limits
export class UserRateLimiter extends RateLimiter {
  constructor(config: RateLimitConfig) {
    super(config);
  }

  async checkUserLimit(userId: string, action: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: Date;
  }> {
    const key = `user:${userId}:${action}`;
    const now = new Date();

    await connectToDatabase();

    try {
      let record = await RateLimit.findOne({ key });

      if (!record) {
        record = new RateLimit({
          key,
          count: 1,
          resetTime: new Date(now.getTime() + this.config.windowMs),
        });
        await record.save();

        return {
          allowed: true,
          remaining: this.config.maxRequests - 1,
          resetTime: record.resetTime,
        };
      }

      if (now > record.resetTime) {
        record.count = 1;
        record.resetTime = new Date(now.getTime() + this.config.windowMs);
        await record.save();

        return {
          allowed: true,
          remaining: this.config.maxRequests - 1,
          resetTime: record.resetTime,
        };
      }

      record.count += 1;
      await record.save();

      const allowed = record.count <= this.config.maxRequests;
      const remaining = Math.max(0, this.config.maxRequests - record.count);

      return {
        allowed,
        remaining,
        resetTime: record.resetTime,
      };
    } catch (error) {
      console.error('User rate limit check failed:', error);
      return {
        allowed: true,
        remaining: this.config.maxRequests,
        resetTime: new Date(now.getTime() + this.config.windowMs),
      };
    }
  }
}

// Specialized rate limiters for different user roles
export class RoleBasedRateLimiter {
  private limiters: Map<string, UserRateLimiter> = new Map();

  constructor() {
    // Initialize role-specific limiters
    this.limiters.set('user', new UserRateLimiter({
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 50,
      message: 'User rate limit exceeded',
    }));

    this.limiters.set('mentor', new UserRateLimiter({
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 200,
      message: 'Mentor rate limit exceeded',
    }));

    this.limiters.set('admin', new UserRateLimiter({
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 1000,
      message: 'Admin rate limit exceeded',
    }));
  }

  async checkLimit(userId: string, userRole: string, action: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: Date;
  }> {
    const limiter = this.limiters.get(userRole) || this.limiters.get('user')!;
    return await limiter.checkUserLimit(userId, action);
  }
}

// AI-specific rate limiter with cost tracking
export class AIRateLimiter {
  private costLimiter: UserRateLimiter;
  private requestLimiter: UserRateLimiter;

  constructor() {
    this.costLimiter = new UserRateLimiter({
      windowMs: 24 * 60 * 60 * 1000, // 24 hours
      maxRequests: 100, // $1.00 daily limit (assuming $0.01 per request)
      message: 'Daily AI cost limit exceeded',
    });

    this.requestLimiter = new UserRateLimiter({
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 20,
      message: 'AI request limit exceeded',
    });
  }

  async checkAILimit(userId: string, estimatedCost: number = 1): Promise<{
    allowed: boolean;
    reason?: string;
    remaining: number;
    resetTime: Date;
  }> {
    // Check request limit first
    const requestResult = await this.requestLimiter.checkUserLimit(userId, 'ai_requests');
    
    if (!requestResult.allowed) {
      return {
        allowed: false,
        reason: 'Request limit exceeded',
        remaining: requestResult.remaining,
        resetTime: requestResult.resetTime,
      };
    }

    // Check cost limit
    const costResult = await this.costLimiter.checkUserLimit(userId, 'ai_cost');
    
    if (!costResult.allowed) {
      return {
        allowed: false,
        reason: 'Cost limit exceeded',
        remaining: costResult.remaining,
        resetTime: costResult.resetTime,
      };
    }

    return {
      allowed: true,
      remaining: Math.min(requestResult.remaining, costResult.remaining),
      resetTime: new Date(Math.max(requestResult.resetTime.getTime(), costResult.resetTime.getTime())),
    };
  }
}

// Export singleton instances
export const roleBasedLimiter = new RoleBasedRateLimiter();
export const aiLimiter = new AIRateLimiter();

// Helper functions for common rate limiting scenarios
export async function checkAuthRateLimit(req: NextRequest, action: 'login' | 'register' | 'forgotPassword'): Promise<NextResponse | null> {
  const middleware = createRateLimitMiddleware(action);
  return await middleware(req);
}

export async function checkAPIRateLimit(req: NextRequest): Promise<NextResponse | null> {
  const middleware = createRateLimitMiddleware('apiGeneral');
  return await middleware(req);
}

export async function checkAIRateLimit(userId: string): Promise<{
  allowed: boolean;
  error?: string;
}> {
  const result = await aiLimiter.checkAILimit(userId);
  
  if (!result.allowed) {
    return {
      allowed: false,
      error: result.reason || 'AI rate limit exceeded',
    };
  }

  return { allowed: true };
}

export async function checkUserActionLimit(
  userId: string,
  userRole: string,
  action: string
): Promise<{
  allowed: boolean;
  remaining: number;
  resetTime: Date;
}> {
  return await roleBasedLimiter.checkLimit(userId, userRole, action);
}

// Cleanup function to remove expired rate limit records
export async function cleanupExpiredRateLimits(): Promise<void> {
  try {
    await connectToDatabase();
    const now = new Date();
    
    const result = await RateLimit.deleteMany({
      resetTime: { $lt: now }
    });
    
    console.log(`Cleaned up ${result.deletedCount} expired rate limit records`);
  } catch (error) {
    console.error('Failed to cleanup expired rate limits:', error);
  }
}

// Rate limit bypass for testing/admin purposes
export class RateLimitBypass {
  private static bypassKeys: Set<string> = new Set();

  static addBypassKey(key: string): void {
    this.bypassKeys.add(key);
  }

  static removeBypassKey(key: string): void {
    this.bypassKeys.delete(key);
  }

  static hasBypass(key: string): boolean {
    return this.bypassKeys.has(key);
  }

  static clearAllBypasses(): void {
    this.bypassKeys.clear();
  }
}