import mongoose, { Schema, Document, Model } from 'mongoose';
import crypto from 'crypto';

// Password Reset interface extending mongoose Document
export interface IPasswordReset extends Document {
  _id: string;
  userId: string;
  email: string;
  token: string;
  hashedToken: string;
  
  // Status and validation
  isUsed: boolean;
  isValid: boolean;
  
  // Timestamps
  createdAt: Date;
  expiresAt: Date;
  usedAt?: Date;
  
  // Security tracking
  ipAddress?: string;
  userAgent?: string;
  
  // Attempts tracking
  verificationAttempts: number;
  maxAttempts: number;
  
  // Methods
  validateToken(token: string): boolean;
  markAsUsed(): Promise<void>;
  isExpired(): boolean;
  incrementAttempts(): Promise<void>;
  canAttempt(): boolean;
  generateNewToken(): string;
}

// Password Reset schema definition
const PasswordResetSchema = new Schema<IPasswordReset>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    index: true,
  },
  
  token: {
    type: String,
    required: true,
    select: false, // Don't include in queries by default
  },
  
  hashedToken: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  
  isUsed: {
    type: Boolean,
    default: false,
    index: true,
  },
  
  isValid: {
    type: Boolean,
    default: true,
    index: true,
  },
  
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    index: true,
  },
  
  usedAt: {
    type: Date,
  },
  
  ipAddress: {
    type: String,
    trim: true,
  },
  
  userAgent: {
    type: String,
    trim: true,
    maxlength: [500, 'User agent cannot be longer than 500 characters'],
  },
  
  verificationAttempts: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  maxAttempts: {
    type: Number,
    default: 3,
    min: 1,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for performance and cleanup
PasswordResetSchema.index({ userId: 1, createdAt: -1 });
PasswordResetSchema.index({ email: 1, createdAt: -1 });
PasswordResetSchema.index({ hashedToken: 1 }, { unique: true });
PasswordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index
PasswordResetSchema.index({ isUsed: 1, isValid: 1 });

// Virtual properties
PasswordResetSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

PasswordResetSchema.virtual('isExpiredVirtual').get(function() {
  return new Date() > this.expiresAt;
});

PasswordResetSchema.virtual('timeRemaining').get(function() {
  const now = new Date();
  const remaining = this.expiresAt.getTime() - now.getTime();
  return Math.max(0, Math.floor(remaining / 1000)); // seconds
});

PasswordResetSchema.virtual('attemptsRemaining').get(function() {
  return Math.max(0, this.maxAttempts - this.verificationAttempts);
});

// Pre-save middleware
PasswordResetSchema.pre('save', function(next) {
  // Invalidate if expired
  if (this.isExpired()) {
    this.isValid = false;
  }
  
  // Invalidate if max attempts reached
  if (this.verificationAttempts >= this.maxAttempts) {
    this.isValid = false;
  }
  
  next();
});

// Instance methods
PasswordResetSchema.methods.validateToken = function(token: string): boolean {
  if (!this.isValid || this.isUsed || this.isExpired()) {
    return false;
  }
  
  const hashedInputToken = crypto.createHash('sha256').update(token).digest('hex');
  return hashedInputToken === this.hashedToken;
};

PasswordResetSchema.methods.markAsUsed = async function(): Promise<void> {
  return this.updateOne({
    $set: {
      isUsed: true,
      usedAt: new Date(),
      isValid: false,
    }
  });
};

PasswordResetSchema.methods.isExpired = function(): boolean {
  return new Date() > this.expiresAt;
};

PasswordResetSchema.methods.incrementAttempts = async function(): Promise<void> {
  const updates: any = {
    $inc: { verificationAttempts: 1 }
  };
  
  // Invalidate if max attempts will be reached
  if (this.verificationAttempts + 1 >= this.maxAttempts) {
    updates.$set = { isValid: false };
  }
  
  return this.updateOne(updates);
};

PasswordResetSchema.methods.canAttempt = function(): boolean {
  return this.isValid && 
         !this.isUsed && 
         !this.isExpired() && 
         this.verificationAttempts < this.maxAttempts;
};

PasswordResetSchema.methods.generateNewToken = function(): string {
  // Generate new random token
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  // Hash and store the token
  this.hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.token = resetToken; // Store unhashed version temporarily for returning
  
  // Reset attempts and validity
  this.verificationAttempts = 0;
  this.isValid = true;
  this.isUsed = false;
  
  // Extend expiry
  this.expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  
  return resetToken;
};

// Static methods
PasswordResetSchema.statics.createResetToken = async function(
  userId: string, 
  email: string, 
  ipAddress?: string, 
  userAgent?: string
): Promise<{ resetToken: string; resetRecord: IPasswordReset }> {
  
  // Invalidate any existing unused tokens for this user
  await this.updateMany(
    { userId, isUsed: false, isValid: true },
    { $set: { isValid: false } }
  );
  
  // Generate new token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  
  // Create new reset record
  const resetRecord = await this.create({
    userId,
    email,
    hashedToken,
    ipAddress,
    userAgent,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
  });
  
  return { resetToken, resetRecord };
};

PasswordResetSchema.statics.findValidToken = function(hashedToken: string) {
  return this.findOne({
    hashedToken,
    isValid: true,
    isUsed: false,
    expiresAt: { $gt: new Date() },
  });
};

PasswordResetSchema.statics.findByUser = function(userId: string) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

PasswordResetSchema.statics.findByEmail = function(email: string) {
  return this.find({ email: email.toLowerCase() }).sort({ createdAt: -1 });
};

PasswordResetSchema.statics.findActiveByUser = function(userId: string) {
  return this.find({
    userId,
    isValid: true,
    isUsed: false,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });
};

PasswordResetSchema.statics.cleanupExpired = async function() {
  const result = await this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { isUsed: true },
      { isValid: false }
    ]
  });
  
  return result.deletedCount;
};

PasswordResetSchema.statics.getResetStats = async function(userId?: string) {
  const matchCondition = userId ? { userId: new mongoose.Types.ObjectId(userId) } : {};
  
  const pipeline = [
    { $match: matchCondition },
    {
      $group: {
        _id: null,
        totalRequests: { $sum: 1 },
        usedTokens: { $sum: { $cond: ['$isUsed', 1, 0] } },
        expiredTokens: { $sum: { $cond: [{ $lt: ['$expiresAt', new Date()] }, 1, 0] } },
        validTokens: { $sum: { $cond: ['$isValid', 1, 0] } },
        averageAttempts: { $avg: '$verificationAttempts' },
        totalAttempts: { $sum: '$verificationAttempts' },
      }
    }
  ];
  
  const result = await this.aggregate(pipeline);
  return result[0] || {};
};

PasswordResetSchema.statics.hasRecentRequest = async function(
  email: string, 
  minutes: number = 5
): Promise<boolean> {
  const since = new Date(Date.now() - minutes * 60 * 1000);
  
  const count = await this.countDocuments({
    email: email.toLowerCase(),
    createdAt: { $gte: since }
  });
  
  return count > 0;
};

PasswordResetSchema.statics.getRateLimitInfo = async function(
  email: string, 
  windowMinutes: number = 60
): Promise<{ count: number; canRequest: boolean; nextAllowedAt?: Date }> {
  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);
  
  const count = await this.countDocuments({
    email: email.toLowerCase(),
    createdAt: { $gte: windowStart }
  });
  
  const maxRequestsPerWindow = 3;
  const canRequest = count < maxRequestsPerWindow;
  
  let nextAllowedAt: Date | undefined;
  if (!canRequest) {
    // Find the oldest request in the window
    const oldestRequest = await this.findOne({
      email: email.toLowerCase(),
      createdAt: { $gte: windowStart }
    }).sort({ createdAt: 1 });
    
    if (oldestRequest) {
      nextAllowedAt = new Date(oldestRequest.createdAt.getTime() + windowMinutes * 60 * 1000);
    }
  }
  
  return { count, canRequest, nextAllowedAt };
};

// Create and export the model
const PasswordReset: Model<IPasswordReset> = mongoose.models.PasswordReset || mongoose.model<IPasswordReset>('PasswordReset', PasswordResetSchema);

export default PasswordReset;