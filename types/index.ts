// types/index.ts - Main Type Definitions
export interface Story {
    _id: string;
    title: string;
    content: string;
    genre: 'adventure' | 'fantasy' | 'mystery' | 'comedy' | 'sci-fi' | 'friendship';
    setting: 'school' | 'home' | 'forest' | 'space' | 'castle' | 'beach' | 'city';
    character: 'child' | 'animal' | 'robot' | 'wizard' | 'superhero' | 'princess' | 'alien';
    mood: 'exciting' | 'funny' | 'mysterious' | 'magical' | 'heartwarming' | 'dramatic';
    conflict: 'problem-solving' | 'friendship' | 'adventure' | 'mystery' | 'competition' | 'helping-others';
    theme: 'courage' | 'friendship' | 'kindness' | 'honesty' | 'perseverance' | 'creativity';
    author: {
      _id: string;
      username: string;
      age?: number;
      avatar?: string;
    };
    collaborations: AICollaboration[];
    comments: Comment[];
    likes: number;
    views: number;
    status: 'draft' | 'published' | 'archived';
    moderationStatus: 'pending' | 'approved' | 'rejected' | 'flagged';
    moderationNotes?: ModerationNote[];
    tags: string[];
    readingTime: number;
    wordCount: number;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface AICollaboration {
    _id: string;
    prompt: string;
    response: string;
    provider: 'openai' | 'anthropic' | 'google';
    model: string;
    tokens: number;
    cost: number;
    timestamp: string;
    feedback?: {
      helpful: boolean;
      rating: number;
      notes?: string;
    };
  }
  
  export interface Comment {
    _id: string;
    content: string;
    author: {
      _id: string;
      username: string;
      role: string;
      avatar?: string;
    };
    type: 'general' | 'grammar' | 'creativity' | 'suggestion' | 'encouragement';
    position?: {
      start: number;
      end: number;
    };
    replies: Comment[];
    likes: number;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface User {
    _id: string;
    username: string;
    email: string;
    role: 'student' | 'parent' | 'mentor' | 'teacher' | 'admin';
    age?: number;
    parentId?: string;
    children?: string[];
    subscription: {
      plan: 'free' | 'premium' | 'family';
      status: 'active' | 'inactive' | 'cancelled';
      expiresAt?: Date;
    };
    preferences: {
      theme: 'light' | 'dark' | 'auto';
      notifications: boolean;
      emailUpdates: boolean;
    };
    gamification: {
      level: number;
      xp: number;
      streak: number;
      longestStreak: number;
      achievements: string[];
    };
    stats: {
      storiesCreated: number;
      wordsWritten: number;
      timeSpent: number;
      lastActivityDate: Date;
    };
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Achievement {
    _id: string;
    name: string;
    description: string;
    category: 'writing' | 'creativity' | 'consistency' | 'collaboration' | 'milestone';
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
    icon: string;
    requirements: {
      type: 'stories_created' | 'words_written' | 'streak_days' | 'comments_received';
      count: number;
    };
    xpReward: number;
    unlockedBy: string[];
    createdAt: string;
  }
  
  export interface Notification {
    _id: string;
    userId: string;
    type: 'comment' | 'achievement' | 'story' | 'reminder' | 'system' | 'mentor' | 'progress';
    title: string;
    message: string;
    data?: any;
    read: boolean;
    actionUrl?: string;
    createdAt: string;
  }
  
  export interface ModerationNote {
    moderator: string;
    action: 'approved' | 'rejected' | 'flagged';
    notes: string;
    timestamp: Date;
  }
  
  export interface AnalyticsEvent {
    eventType: string;
    category: 'user' | 'story' | 'ai' | 'mentor' | 'system' | 'subscription' | 'engagement';
    userId?: string;
    metadata: Record<string, any>;
    timestamp: Date;
  }
  
  export interface APIResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }
  
  export interface EmailTemplate {
    to: string;
    subject: string;
    html: string;
    text?: string;
    attachments?: Array<{
      filename: string;
      content: Buffer;
      contentType: string;
    }>;
  }
  
  // Additional common utility types
  export interface PaginationParams {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }
  
  export interface PaginatedResponse<T> extends APIResponse<T[]> {
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }
  
  export interface FileInfo {
    id: string;
    filename: string;
    contentType: string;
    size: number;
    uploadDate: Date;
  }
  
  export interface UploadResult {
    fileId: string;
    filename: string;
    size: number;
    url: string;
  }
  
  // UI Component types
  export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
    icon?: React.ComponentType;
  }
  
  export interface TabItem {
    id: string;
    label: string;
    content: React.ReactNode;
    disabled?: boolean;
    badge?: string | number;
  }
  
  export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    closeOnOverlayClick?: boolean;
    showCloseButton?: boolean;
  }
  
  export interface ToastOptions {
    type: 'success' | 'error' | 'warning' | 'info';
    title?: string;
    message: string;
    duration?: number;
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  }
  
  // Form types
  export interface FormField {
    name: string;
    label: string;
    type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio';
    placeholder?: string;
    required?: boolean;
    validation?: {
      min?: number;
      max?: number;
      pattern?: RegExp;
      custom?: (value: any) => string | null;
    };
    options?: SelectOption[];
  }
  
  export interface SearchParams {
    q?: string;
    category?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    tags?: string[];
  }
  
  // Error types
  export interface AppError extends Error {
    code?: string;
    statusCode?: number;
    details?: any;
  }
  
  export interface ValidationError {
    field: string;
    message: string;
    code?: string;
  }
  
  // Feature flags
  export interface FeatureFlags {
    enableRealTime: boolean;
    enableAIIllustrations: boolean;
    enableExportFeatures: boolean;
    enableAnalytics: boolean;
    enableComments: boolean;
    enableAchievements: boolean;
    maintenanceMode: boolean;
  }
  
  // Metrics and Analytics
  export interface MetricsData {
    label: string;
    value: number;
    change?: number;
    changeType?: 'increase' | 'decrease' | 'neutral';
    format?: 'number' | 'percentage' | 'currency' | 'duration';
  }
  
  // Configuration types
  export interface AppConfig {
    name: string;
    version: string;
    apiUrl: string;
    cdnUrl: string;
    features: FeatureFlags;
    limits: {
      maxFileSize: number;
      maxStoryLength: number;
      maxStoriesPerUser: number;
    };
    social: {
      twitter?: string;
      facebook?: string;
      instagram?: string;
      youtube?: string;
    };
  }
  
  // Real-time types
  export interface TypingIndicator {
    userId: string;
    username: string;
    storyId: string;
    isTyping: boolean;
    timestamp: Date;
  }
  
  export interface RealTimeEvent {
    type: 'typing' | 'story_update' | 'comment_added' | 'notification';
    userId: string;
    data: any;
    timestamp: Date;
  }
  
  // Subscription types
  export interface SubscriptionPlan {
    id: string;
    name: string;
    price: number;
    currency: string;
    interval: 'month' | 'year';
    features: string[];
    limits: {
      storiesPerMonth: number;
      aiCollaborations: number;
      exportFormats: string[];
    };
  }
  
  export interface PaymentMethod {
    id: string;
    type: 'card' | 'paypal';
    last4?: string;
    brand?: string;
    expiryMonth?: number;
    expiryYear?: number;
    isDefault: boolean;
  }
  
  // Utility types
  export type UserRole = 'student' | 'parent' | 'mentor' | 'teacher' | 'admin';
  export type StoryStatus = 'draft' | 'published' | 'archived';
  export type ModerationStatus = 'pending' | 'approved' | 'rejected' | 'flagged';
  export type SubscriptionPlan = 'free' | 'premium' | 'family';
  export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled';
  export type Theme = 'light' | 'dark' | 'auto';
  export type AIProvider = 'openai' | 'anthropic' | 'google';
  
  export {};