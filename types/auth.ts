import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';

// User roles in the system
export type UserRole = 'child' | 'mentor' | 'admin';

// Extend NextAuth types
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
      isActive: boolean;
      age?: number;
      school?: string;
      subscriptionTier?: SubscriptionTier;
      mentorId?: string;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    role: UserRole;
    isActive: boolean;
    age?: number;
    school?: string;
    subscriptionTier?: SubscriptionTier;
    mentorId?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    role: UserRole;
    isActive: boolean;
    age?: number;
    school?: string;
    subscriptionTier?: SubscriptionTier;
    mentorId?: string;
  }
}

// Authentication forms
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  age: number;
  school: string;
  parentEmail?: string; // Required for users under 13
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  marketingOptIn?: boolean;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Profile management
export interface ProfileUpdateData {
  name?: string;
  email?: string;
  age?: number;
  school?: string;
  bio?: string;
  avatar?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
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
}

// Permission and role management
export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
}

export interface RolePermissions {
  child: Permission[];
  mentor: Permission[];
  admin: Permission[];
}

// Authentication responses
export interface AuthResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    isActive: boolean;
  };
  token?: string;
  message?: string;
  error?: string;
}

export interface PasswordResetResponse {
  success: boolean;
  message: string;
  error?: string;
}

// Session management
export interface SessionData {
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    isActive: boolean;
    lastLogin: Date;
    sessionId: string;
  };
  expires: string;
}

// Security types
export interface SecurityLog {
  id: string;
  userId: string;
  event: 'login' | 'logout' | 'password_change' | 'failed_login' | 'account_locked';
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  success: boolean;
  details?: Record<string, any>;
}

export interface LoginAttempt {
  email: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  timestamp: Date;
  failureReason?: string;
}

// Account status
export type AccountStatus = 'active' | 'inactive' | 'suspended' | 'pending_verification';

// Subscription tiers
export type SubscriptionTier = 'free' | 'basic' | 'premium' | 'pro';

// Age groups for content filtering
export type AgeGroup = '2-5' | '6-8' | '9-12' | '13-15' | '16-18';

// Parent/Guardian types (for COPPA compliance)
export interface ParentConsent {
  childId: string;
  parentEmail: string;
  parentName: string;
  consentGiven: boolean;
  consentDate: Date;
  ipAddress: string;
  verificationMethod: 'email' | 'phone' | 'document';
  verificationStatus: 'pending' | 'verified' | 'rejected';
}

// Two-factor authentication (future feature)
export interface TwoFactorAuth {
  userId: string;
  secret: string;
  isEnabled: boolean;
  backupCodes: string[];
  lastUsed?: Date;
}

// OAuth provider types
export type OAuthProvider = 'google' | 'github' | 'discord';

export interface OAuthAccount {
  provider: OAuthProvider;
  providerAccountId: string;
  userId: string;
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
}

// Account verification
export interface EmailVerification {
  userId: string;
  token: string;
  email: string;
  expiresAt: Date;
  verified: boolean;
  verifiedAt?: Date;
}

// Rate limiting
export interface RateLimit {
  identifier: string; // IP address or user ID
  count: number;
  resetTime: Date;
  action: 'login' | 'register' | 'password_reset' | 'api_request';
}