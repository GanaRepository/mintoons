import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole, SubscriptionTier, AgeGroup } from '@/types';

// User interface extending mongoose Document
export interface IUser extends Document {
  _id: string;
  email: string;
  name: string;
  password: string;
  role: UserRole;

  // Basic info
  age: number;
  ageGroup: AgeGroup;
  school?: string;
  grade?: string;
  bio?: string;
  avatar?: string;

  // Account status
  isActive: boolean;
  emailVerified: boolean;
  accountStatus: 'active' | 'inactive' | 'suspended' | 'pending_verification';

  // Subscription
  subscriptionTier: SubscriptionTier;
  subscriptionStatus: 'active' | 'canceled' | 'past_due' | 'unpaid';
  subscriptionStartDate?: Date;
  subscriptionEndDate?: Date;
  stripeCustomerId?: string;

  // Mentor relationship
  mentorId?: string;
  mentorAssignedAt?: Date;

  // Parent/Guardian info (COPPA compliance)
  parentEmail?: string;
  parentConsent?: boolean;
  parentConsentDate?: Date;

  // User preferences
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    emailNotifications: {
      storyCompleted: boolean;
      mentorComments: boolean;
      weeklyProgress: boolean;
      achievements: boolean;
      marketing: boolean;
    };
    privacySettings: {
      showProfile: boolean;
      showProgress: boolean;
      allowMentorContact: boolean;
    };
    writingSettings: {
      autoSave: boolean;
      showWordCount: boolean;
      aiAssistanceLevel: 'minimal' | 'normal' | 'maximum';
      preferredGenres: string[];
    };
  };

  // Statistics
  stats: {
    storiesCreated: number;
    storiesPublished: number;
    totalWordCount: number;
    averageGrammarScore: number;
    averageCreativityScore: number;
    currentWritingStreak: number;
    longestWritingStreak: number;
    achievementsUnlocked: string[];
    currentLevel: number;
    experiencePoints: number;
    lastWritingDate?: Date;
  };

  // Security
  passwordChangedAt?: Date;
  loginAttempts: number;
  lockedUntil?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  lastActiveAt?: Date;

  // Instance methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  generatePasswordResetToken(): string;
  generateEmailVerificationToken(): string;
  isPasswordResetTokenValid(token: string): boolean;
  isEmailVerificationTokenValid(token: string): boolean;
  incrementLoginAttempts(): Promise<void>;
  lockAccount(): Promise<void>;
  unlockAccount(): Promise<void>;
  updateLastActive(): Promise<void>;
  calculateAgeGroup(): AgeGroup;
  canCreateStory(): boolean;
  canExportStory(): boolean;
  getRemainingStoryLimit(): number;
  updateStats(updates: Partial<IUser['stats']>): Promise<void>;
}

// User schema definition
const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email',
      ],
      index: true,
    },

    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot be longer than 100 characters'],
      minlength: [2, 'Name must be at least 2 characters'],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Don't include password in queries by default
    },

    role: {
      type: String,
      enum: ['child', 'mentor', 'admin'],
      default: 'child',
      required: true,
      index: true,
    },

    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [2, 'Age must be at least 2'],
      max: [18, 'Age must be at most 18'],
    },

    ageGroup: {
      type: String,
      enum: ['2-5', '6-8', '9-12', '13-15', '16-18'],
      required: true,
    },

    school: {
      type: String,
      trim: true,
      maxlength: [200, 'School name cannot be longer than 200 characters'],
    },

    grade: {
      type: String,
      trim: true,
      maxlength: [50, 'Grade cannot be longer than 50 characters'],
    },

    bio: {
      type: String,
      trim: true,
      maxlength: [500, 'Bio cannot be longer than 500 characters'],
    },

    avatar: {
      type: String,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    emailVerified: {
      type: Boolean,
      default: false,
      index: true,
    },

    accountStatus: {
      type: String,
      enum: ['active', 'inactive', 'suspended', 'pending_verification'],
      default: 'pending_verification',
      index: true,
    },

    subscriptionTier: {
      type: String,
      enum: ['free', 'basic', 'premium', 'pro'],
      default: 'free',
      index: true,
    },

    subscriptionStatus: {
      type: String,
      enum: ['active', 'canceled', 'past_due', 'unpaid'],
      default: 'active',
      index: true,
    },

    subscriptionStartDate: {
      type: Date,
    },

    subscriptionEndDate: {
      type: Date,
    },

    stripeCustomerId: {
      type: String,
      trim: true,
      index: true,
    },

    mentorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },

    mentorAssignedAt: {
      type: Date,
    },

    parentEmail: {
      type: String,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid parent email',
      ],
    },

    parentConsent: {
      type: Boolean,
      default: false,
    },

    parentConsentDate: {
      type: Date,
    },

    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'system',
      },
      language: {
        type: String,
        default: 'en',
      },
      emailNotifications: {
        storyCompleted: { type: Boolean, default: true },
        mentorComments: { type: Boolean, default: true },
        weeklyProgress: { type: Boolean, default: true },
        achievements: { type: Boolean, default: true },
        marketing: { type: Boolean, default: false },
      },
      privacySettings: {
        showProfile: { type: Boolean, default: true },
        showProgress: { type: Boolean, default: true },
        allowMentorContact: { type: Boolean, default: true },
      },
      writingSettings: {
        autoSave: { type: Boolean, default: true },
        showWordCount: { type: Boolean, default: true },
        aiAssistanceLevel: {
          type: String,
          enum: ['minimal', 'normal', 'maximum'],
          default: 'normal',
        },
        preferredGenres: [{ type: String }],
      },
    },

    stats: {
      storiesCreated: { type: Number, default: 0 },
      storiesPublished: { type: Number, default: 0 },
      totalWordCount: { type: Number, default: 0 },
      averageGrammarScore: { type: Number, default: 0 },
      averageCreativityScore: { type: Number, default: 0 },
      currentWritingStreak: { type: Number, default: 0 },
      longestWritingStreak: { type: Number, default: 0 },
      achievementsUnlocked: [{ type: String }],
      currentLevel: { type: Number, default: 1 },
      experiencePoints: { type: Number, default: 0 },
      lastWritingDate: { type: Date },
    },

    passwordChangedAt: {
      type: Date,
    },

    loginAttempts: {
      type: Number,
      default: 0,
    },

    lockedUntil: {
      type: Date,
    },

    resetPasswordToken: {
      type: String,
      select: false,
    },

    resetPasswordExpires: {
      type: Date,
      select: false,
    },

    emailVerificationToken: {
      type: String,
      select: false,
    },

    emailVerificationExpires: {
      type: Date,
      select: false,
    },

    lastLoginAt: {
      type: Date,
    },

    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1, isActive: 1 });
UserSchema.index({ subscriptionTier: 1, subscriptionStatus: 1 });
UserSchema.index({ mentorId: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ lastActiveAt: -1 });
UserSchema.index({ ageGroup: 1, role: 1 });

// Virtual properties
UserSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

UserSchema.virtual('isLocked').get(function () {
  return !!(this.lockedUntil && this.lockedUntil > new Date());
});

UserSchema.virtual('fullName').get(function () {
  return this.name;
});

// Pre-save middleware
UserSchema.pre('save', async function (next) {
  // Only hash password if it was modified
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);

    // Set password changed timestamp
    this.passwordChangedAt = new Date();

    next();
  } catch (error) {
    next(error);
  }
});

UserSchema.pre('save', function (next) {
  // Calculate age group based on age
  this.ageGroup = this.calculateAgeGroup();

  // Update last active
  this.lastActiveAt = new Date();

  // Ensure parent email is provided for children under 13
  if (this.age < 13 && this.role === 'child' && !this.parentEmail) {
    return next(new Error('Parent email is required for children under 13'));
  }

  next();
});

// Instance methods
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

UserSchema.methods.generatePasswordResetToken = function (): string {
  const crypto = require('crypto');
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  return resetToken;
};

UserSchema.methods.generateEmailVerificationToken = function (): string {
  const crypto = require('crypto');
  const verificationToken = crypto.randomBytes(32).toString('hex');

  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  return verificationToken;
};

UserSchema.methods.isPasswordResetTokenValid = function (
  token: string
): boolean {
  const crypto = require('crypto');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  return (
    hashedToken === this.resetPasswordToken &&
    this.resetPasswordExpires &&
    this.resetPasswordExpires > new Date()
  );
};

UserSchema.methods.isEmailVerificationTokenValid = function (
  token: string
): boolean {
  const crypto = require('crypto');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  return (
    hashedToken === this.emailVerificationToken &&
    this.emailVerificationExpires &&
    this.emailVerificationExpires > new Date()
  );
};

UserSchema.methods.incrementLoginAttempts = async function (): Promise<void> {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockedUntil && this.lockedUntil < new Date()) {
    return this.updateOne({
      $unset: { lockedUntil: 1 },
      $set: { loginAttempts: 1 },
    });
  }

  const updates: any = { $inc: { loginAttempts: 1 } };

  // Lock account after 5 failed attempts
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockedUntil: new Date(Date.now() + 2 * 60 * 60 * 1000) }; // 2 hours
  }

  return this.updateOne(updates);
};

UserSchema.methods.lockAccount = async function (): Promise<void> {
  return this.updateOne({
    $set: {
      lockedUntil: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
      loginAttempts: 5,
    },
  });
};

UserSchema.methods.unlockAccount = async function (): Promise<void> {
  return this.updateOne({
    $unset: { lockedUntil: 1 },
    $set: { loginAttempts: 0 },
  });
};

UserSchema.methods.updateLastActive = async function (): Promise<void> {
  return this.updateOne({
    $set: { lastActiveAt: new Date() },
  });
};

UserSchema.methods.calculateAgeGroup = function (): AgeGroup {
  if (this.age >= 2 && this.age <= 5) return '2-5';
  if (this.age >= 6 && this.age <= 8) return '6-8';
  if (this.age >= 9 && this.age <= 12) return '9-12';
  if (this.age >= 13 && this.age <= 15) return '13-15';
  if (this.age >= 16 && this.age <= 18) return '16-18';
  return '9-12'; // default
};

UserSchema.methods.canCreateStory = function (): boolean {
  // Check if account is active and not locked
  if (!this.isActive || this.isLocked || this.accountStatus !== 'active') {
    return false;
  }

  // Check subscription limits (to be implemented based on subscription tier)
  const limits = this.getSubscriptionLimits();
  return this.stats.storiesCreated < limits.maxStories;
};

UserSchema.methods.canExportStory = function (): boolean {
  // Check if account is active
  if (!this.isActive || this.accountStatus !== 'active') {
    return false;
  }

  // Free tier can export as PDF only
  return this.subscriptionTier !== 'free' || true; // Allow PDF for free tier
};

UserSchema.methods.getRemainingStoryLimit = function (): number {
  const limits = this.getSubscriptionLimits();
  return Math.max(0, limits.maxStories - this.stats.storiesCreated);
};

UserSchema.methods.getSubscriptionLimits = function () {
  const limits = {
    free: { maxStories: 50, maxExportsPerMonth: 5 },
    basic: { maxStories: 100, maxExportsPerMonth: 20 },
    premium: { maxStories: 200, maxExportsPerMonth: 50 },
    pro: { maxStories: 300, maxExportsPerMonth: -1 }, // unlimited
  };

  return limits[this.subscriptionTier] || limits.free;
};

UserSchema.methods.updateStats = async function (
  updates: Partial<IUser['stats']>
): Promise<void> {
  const updateQuery: any = {};

  Object.keys(updates).forEach((key) => {
    updateQuery[`stats.${key}`] = updates[key as keyof IUser['stats']];
  });

  return this.updateOne({ $set: updateQuery });
};

// Static methods
UserSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email: email.toLowerCase() }).select('+password');
};

UserSchema.statics.findActiveUsers = function () {
  return this.find({ isActive: true, accountStatus: 'active' });
};

UserSchema.statics.findByRole = function (role: UserRole) {
  return this.find({ role, isActive: true });
};

UserSchema.statics.findChildren = function () {
  return this.find({ role: 'child', isActive: true });
};

UserSchema.statics.findMentors = function () {
  return this.find({ role: 'mentor', isActive: true });
};

UserSchema.statics.findByMentor = function (mentorId: string) {
  return this.find({ mentorId, isActive: true });
};

UserSchema.statics.findBySubscriptionTier = function (tier: SubscriptionTier) {
  return this.find({ subscriptionTier: tier, isActive: true });
};

UserSchema.statics.findByAgeGroup = function (ageGroup: AgeGroup) {
  return this.find({ ageGroup, role: 'child', isActive: true });
};

UserSchema.statics.getActiveUserCount = async function () {
  return this.countDocuments({ isActive: true, accountStatus: 'active' });
};

UserSchema.statics.getUserStats = async function () {
  const pipeline = [
    {
      $match: { isActive: true },
    },
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        children: { $sum: { $cond: [{ $eq: ['$role', 'child'] }, 1, 0] } },
        mentors: { $sum: { $cond: [{ $eq: ['$role', 'mentor'] }, 1, 0] } },
        admins: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
        verifiedUsers: { $sum: { $cond: ['$emailVerified', 1, 0] } },
        averageAge: { $avg: '$age' },
        totalStories: { $sum: '$stats.storiesCreated' },
        totalWords: { $sum: '$stats.totalWordCount' },
      },
    },
  ];

  const result = await this.aggregate(pipeline);
  return result[0] || {};
};

// Create indexes after schema definition
UserSchema.index({ 'stats.lastWritingDate': -1 });
UserSchema.index({ 'stats.currentWritingStreak': -1 });
UserSchema.index({ 'stats.experiencePoints': -1 });

// Ensure email uniqueness
UserSchema.index({ email: 1 }, { unique: true });

// Create and export the model
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
