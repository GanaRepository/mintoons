import { UserRole, AgeGroup, SubscriptionTier, UserPreferences } from './auth';

// Main user interface
export interface User {
  id: string;
  email: string;
  name: string;
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
  
  // Mentor relationship (for children)
  mentorId?: string;
  mentorAssignedAt?: Date;
  
  // Parent/Guardian info (for COPPA compliance)
  parentEmail?: string;
  parentConsent?: boolean;
  parentConsentDate?: Date;
  
  // Preferences and settings
  preferences: UserPreferences;
  
  // Statistics and progress
  stats: UserStats;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  lastActiveAt?: Date;
  
  // Security
  passwordChangedAt?: Date;
  loginAttempts: number;
  lockedUntil?: Date;
  
  // Feature flags for user
  features: UserFeatures;
}

// User statistics and progress tracking
export interface UserStats {
  // Story statistics
  storiesCreated: number;
  storiesPublished: number;
  storiesInProgress: number;
  totalWordCount: number;
  averageWordsPerStory: number;
  
  // Quality metrics
  averageGrammarScore: number;
  averageCreativityScore: number;
  averageOverallScore: number;
  improvementRate: number; // percentage
  
  // Time tracking
  totalWritingTime: number; // in minutes
  averageSessionTime: number; // in minutes
  sessionsCount: number;
  
  // Streaks and consistency
  currentWritingStreak: number; // days
  longestWritingStreak: number; // days
  writingDaysThisMonth: number;
  lastWritingDate?: Date;
  
  // Engagement
  commentsReceived: number;
  commentsResolved: number;
  mentorInteractions: number;
  
  // Achievements
  achievementsUnlocked: string[];
  badgesEarned: string[];
  currentLevel: number;
  experiencePoints: number;
  
  // Stage progression
  currentStage: number;
  storiesCompletedInCurrentStage: number;
  storiesNeededForNextStage: number;
  
  // Last updated
  lastCalculated: Date;
}

// User feature flags
export interface UserFeatures {
  canCreateStories: boolean;
  canExportStories: boolean;
  canAccessAIAssistance: boolean;
  canReceiveMentorFeedback: boolean;
  canViewAnalytics: boolean;
  hasUnlimitedStories: boolean;
  canAccessPremiumTemplates: boolean;
  canUseAdvancedEditor: boolean;
  hasCustomThemes: boolean;
  canSharePublicly: boolean;
}

// Child-specific user data
export interface ChildUser extends User {
  role: 'child';
  mentorId: string;
  parentEmail: string;
  
  // Learning data
  learningGoals: LearningGoal[];
  skillLevels: SkillLevels;
  
  // Safety features
  contentFilter: ContentFilter;
  supervisionLevel: 'minimal' | 'moderate' | 'strict';
  
  // Parent dashboard access
  parentDashboardAccess: boolean;
  shareProgressWithParent: boolean;
}

// Mentor-specific user data
export interface MentorUser extends User {
  role: 'mentor';
  
  // Professional info
  teachingExperience: number; // years
  specializations: string[];
  certifications: string[];
  bio: string;
  
  // Mentor assignment
  assignedStudents: string[]; // user IDs
  maxStudents: number;
  currentStudentCount: number;
  
  // Performance metrics
  mentorStats: MentorStats;
  
  // Availability
  isAcceptingNewStudents: boolean;
  workingHours: WorkingHours;
  timezone: string;
}

// Admin-specific user data
export interface AdminUser extends User {
  role: 'admin';
  
  // Admin permissions
  permissions: AdminPermission[];
  isSuperAdmin: boolean;
  
  // Admin activity
  lastAdminAction?: Date;
  adminActionsCount: number;
}

// Learning goals for children
export interface LearningGoal {
  id: string;
  title: string;
  description: string;
  category: 'grammar' | 'creativity' | 'vocabulary' | 'structure' | 'confidence';
  targetValue: number;
  currentValue: number;
  deadline?: Date;
  isCompleted: boolean;
  completedAt?: Date;
  priority: 'low' | 'medium' | 'high';
}

// Skill levels tracking
export interface SkillLevels {
  grammar: number; // 1-10
  vocabulary: number; // 1-10
  creativity: number; // 1-10
  structure: number; // 1-10
  dialogue: number; // 1-10
  description: number; // 1-10
  characterDevelopment: number; // 1-10
  plotDevelopment: number; // 1-10
  
  // Overall assessment
  overallLevel: number; // 1-10
  lastAssessed: Date;
  assessmentHistory: SkillAssessment[];
}

export interface SkillAssessment {
  date: Date;
  skills: Record<string, number>;
  notes?: string;
  assessorId?: string; // mentor or AI
  assessorType: 'ai' | 'mentor' | 'self';
}

// Content filtering for age-appropriate content
export interface ContentFilter {
  ageGroup: AgeGroup;
  allowedThemes: string[];
  blockedWords: string[];
  maxViolenceLevel: number; // 0-5
  maxScareLevel: number; // 0-5
  requireParentalApproval: boolean;
  customRestrictions: string[];
}

// Mentor performance statistics
export interface MentorStats {
  // Student metrics
  totalStudentsAssigned: number;
  activeStudents: number;
  studentsGraduated: number; // moved to next stage
  
  // Feedback metrics
  commentsProvided: number;
  averageResponseTime: number; // in hours
  feedbackQuality: number; // 1-5 rating from students
  
  // Engagement metrics
  studentEngagementRate: number; // percentage
  studentImprovementRate: number; // percentage
  studentRetentionRate: number; // percentage
  
  // Time tracking
  totalMentoringTime: number; // in hours
  averageTimePerStudent: number; // in hours
  
  // Performance ratings
  overallRating: number; // 1-5
  communicationRating: number; // 1-5
  helpfulnessRating: number; // 1-5
  
  // Last updated
  lastCalculated: Date;
}

// Working hours for mentors
export interface WorkingHours {
  monday: TimeSlot[];
  tuesday: TimeSlot[];
  wednesday: TimeSlot[];
  thursday: TimeSlot[];
  friday: TimeSlot[];
  saturday: TimeSlot[];
  sunday: TimeSlot[];
}

export interface TimeSlot {
  start: string; // HH:MM format
  end: string; // HH:MM format
  isAvailable: boolean;
}

// Admin permissions
export type AdminPermission = 
  | 'manage_users'
  | 'manage_mentors'
  | 'manage_content'
  | 'view_analytics'
  | 'manage_subscriptions'
  | 'moderate_content'
  | 'manage_settings'
  | 'view_logs'
  | 'manage_ai_providers'
  | 'manage_templates';

// User activity tracking
export interface UserActivity {
  id: string;
  userId: string;
  activity: ActivityType;
  description: string;
  metadata?: Record<string, any>;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

export type ActivityType = 
  | 'login'
  | 'logout'
  | 'story_created'
  | 'story_published'
  | 'story_exported'
  | 'comment_added'
  | 'comment_resolved'
  | 'achievement_unlocked'
  | 'subscription_changed'
  | 'profile_updated'
  | 'password_changed';

// User notifications
export interface UserNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  
  // Status
  isRead: boolean;
  readAt?: Date;
  
  // Actions
  actionUrl?: string;
  actionText?: string;
  
  // Scheduling
  scheduledFor?: Date;
  expiresAt?: Date;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export type NotificationType = 
  | 'story_completed'
  | 'mentor_comment'
  | 'achievement_unlocked'
  | 'subscription_expiring'
  | 'new_feature'
  | 'maintenance'
  | 'welcome'
  | 'progress_report';

// User search and filtering
export interface UserFilters {
  role?: UserRole[];
  ageGroup?: AgeGroup[];
  subscriptionTier?: SubscriptionTier[];
  isActive?: boolean;
  hasmentor?: boolean;
  dateJoined?: {
    from: Date;
    to: Date;
  };
  lastActive?: {
    from: Date;
    to: Date;
  };
  storiesCount?: {
    min: number;
    max: number;
  };
}

export interface UserSearchParams extends UserFilters {
  query?: string;
  sortBy?: 'createdAt' | 'lastActiveAt' | 'name' | 'storiesCount' | 'averageScore';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Bulk user operations
export interface BulkUserOperation {
  userIds: string[];
  operation: 'activate' | 'deactivate' | 'delete' | 'assign_mentor' | 'change_tier';
  parameters?: Record<string, any>;
  performedBy: string;
  performedAt: Date;
  results: BulkOperationResult[];
}

export interface BulkOperationResult {
  userId: string;
  success: boolean;
  error?: string;
}

// User profile customization
export interface ProfileCustomization {
  userId: string;
  theme: 'default' | 'forest' | 'ocean' | 'space' | 'rainbow';
  avatarStyle: 'realistic' | 'cartoon' | 'abstract';
  badgeDisplay: BadgeDisplaySettings;
  privacySettings: ProfilePrivacySettings;
  customBio?: string;
  favoriteQuote?: string;
  writingGoals?: string[];
}

export interface BadgeDisplaySettings {
  showAchievements: boolean;
  showLevel: boolean;
  showStreak: boolean;
  maxBadgesToShow: number;
  displayStyle: 'grid' | 'list' | 'carousel';
}

export interface ProfilePrivacySettings {
  showEmail: boolean;
  showAge: boolean;
  showSchool: boolean;
  showStats: boolean;
  showStories: boolean;
  allowMentorContact: boolean;
  allowParentAccess: boolean;
} 