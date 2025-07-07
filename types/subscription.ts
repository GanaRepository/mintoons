// Subscription tier types
export type SubscriptionTier = 'free' | 'basic' | 'premium' | 'pro';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'unpaid' | 'paused' | 'incomplete';
export type BillingInterval = 'month' | 'year';

// Main subscription interface
export interface Subscription {
  id: string;
  userId: string;
  
  // Stripe integration
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  stripePriceId?: string;
  
  // Subscription details
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  billingInterval: BillingInterval;
  
  // Pricing
  amount: number; // in cents
  currency: string;
  
  // Dates
  startDate: Date;
  endDate?: Date;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  canceledAt?: Date;
  cancelAtPeriodEnd: boolean;
  
  // Trial information
  trialStart?: Date;
  trialEnd?: Date;
  isTrialActive: boolean;
  
  // Usage tracking
  usage: SubscriptionUsage;
  
  // Limits based on tier
  limits: SubscriptionLimits;
  
  // Payment information
  paymentMethod?: PaymentMethod;
  lastPaymentDate?: Date;
  nextPaymentDate?: Date;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

// Subscription tier configurations
export interface SubscriptionPlan {
  tier: SubscriptionTier;
  name: string;
  description: string;
  
  // Pricing
  monthlyPrice: number; // in cents
  yearlyPrice: number; // in cents
  yearlyDiscount: number; // percentage
  
  // Features and limits
  limits: SubscriptionLimits;
  features: SubscriptionFeatures;
  
  // Display information
  displayOrder: number;
  isPopular: boolean;
  badgeText?: string; // "Most Popular", "Best Value", etc.
  
  // Stripe configuration
  stripePriceIds: {
    monthly: string;
    yearly: string;
  };
  
  // Status
  isActive: boolean;
  isVisible: boolean;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// Subscription limits for different tiers
export interface SubscriptionLimits {
  // Story limits
  maxStories: number; // -1 for unlimited
  maxStoryLength: number; // in words
  maxStoriesPerDay: number;
  maxStoriesPerMonth: number;
  
  // File and export limits
  maxExportsPerMonth: number;
  maxFileSize: number; // in bytes
  exportFormats: ('pdf' | 'word' | 'txt')[];
  
  // AI assistance limits
  maxAIRequestsPerDay: number;
  maxAIRequestsPerMonth: number;
  aiModelsAccess: string[];
  
  // Mentor and feedback limits
  canAccessMentorFeedback: boolean;
  maxMentorSessions: number; // per month
  prioritySupport: boolean;
  
  // Advanced features
  canAccessAdvancedEditor: boolean;
  canUseCustomTemplates: boolean;
  canCreatePublicStories: boolean;
  canAccessAnalytics: boolean;
  
  // Storage limits
  maxStorageSpace: number; // in bytes
  retentionPeriod: number; // in days, -1 for forever
}

// Subscription features
export interface SubscriptionFeatures {
  // Core features
  storyCreation: boolean;
  aiAssistance: boolean;
  basicTemplates: boolean;
  pdfExport: boolean;
  
  // Premium features
  premiumTemplates: boolean;
  advancedEditor: boolean;
  customThemes: boolean;
  wordExport: boolean;
  bulkExport: boolean;
  
  // Pro features
  mentorAccess: boolean;
  detailedAnalytics: boolean;
  prioritySupport: boolean;
  apiAccess: boolean;
  
  // Collaboration features
  storySharing: boolean;
  publicProfiles: boolean;
  communityAccess: boolean;
  
  // AI features
  advancedAI: boolean;
  customAIPrompts: boolean;
  aiIllustrations: boolean;
  
  // Educational features
  progressTracking: boolean;
  skillAssessments: boolean;
  learningPath: boolean;
  parentDashboard: boolean;
}

// Usage tracking for subscription limits
export interface SubscriptionUsage {
  // Current period usage
  storiesCreated: number;
  storiesThisMonth: number;
  exportsThisMonth: number;
  aiRequestsToday: number;
  aiRequestsThisMonth: number;
  mentorSessionsThisMonth: number;
  storageUsed: number; // in bytes
  
  // Historical data
  totalStoriesCreated: number;
  totalExports: number;
  totalAIRequests: number;
  totalMentorSessions: number;
  
  // Reset dates
  monthlyResetDate: Date;
  dailyResetDate: Date;
  
  // Usage warnings
  warnings: UsageWarning[];
  
  // Last updated
  lastCalculated: Date;
}

export interface UsageWarning {
  type: 'stories' | 'exports' | 'ai_requests' | 'storage';
  threshold: number; // percentage of limit
  currentUsage: number;
  limit: number;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  createdAt: Date;
}

// Payment method information
export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'paypal';
  
  // Card details (if type is card)
  cardBrand?: string; // visa, mastercard, etc.
  cardLast4?: string;
  cardExpMonth?: number;
  cardExpYear?: number;
  cardCountry?: string;
  
  // Bank details (if type is bank)
  bankName?: string;
  bankLast4?: string;
  
  // Status
  isDefault: boolean;
  isValid: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Billing and invoice types
export interface Invoice {
  id: string;
  subscriptionId: string;
  userId: string;
  
  // Stripe integration
  stripeInvoiceId?: string;
  
  // Invoice details
  invoiceNumber: string;
  amount: number; // in cents
  currency: string;
  tax?: number; // in cents
  total: number; // in cents
  
  // Status
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  
  // Dates
  issueDate: Date;
  dueDate: Date;
  paidAt?: Date;
  voidedAt?: Date;
  
  // Line items
  lineItems: InvoiceLineItem[];
  
  // Payment
  paymentMethod?: PaymentMethod;
  paymentAttempts: number;
  
  // Files
  pdfUrl?: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number; // in cents
  amount: number; // in cents
  period: {
    start: Date;
    end: Date;
  };
  prorated: boolean;
}

// Subscription analytics and metrics
export interface SubscriptionMetrics {
  // Overview
  totalSubscriptions: number;
  activeSubscriptions: number;
  canceledSubscriptions: number;
  
  // By tier
  subscriptionsByTier: Record<SubscriptionTier, number>;
  revenueByTier: Record<SubscriptionTier, number>;
  
  // Revenue metrics
  monthlyRecurringRevenue: number;
  annualRecurringRevenue: number;
  averageRevenuePerUser: number;
  
  // Growth metrics
  newSubscriptions: number;
  upgrades: number;
  downgrades: number;
  churnRate: number; // percentage
  growthRate: number; // percentage
  
  // Retention metrics
  retentionRate: number; // percentage
  lifetimeValue: number;
  averageSubscriptionLength: number; // in months
  
  // Trial metrics
  trialConversionRate: number; // percentage
  averageTrialLength: number; // in days
  
  // Payment metrics
  failedPayments: number;
  retrySuccessRate: number; // percentage
  
  // Date range
  periodStart: Date;
  periodEnd: Date;
  lastCalculated: Date;
}

// Subscription events and webhooks
export interface SubscriptionEvent {
  id: string;
  subscriptionId: string;
  userId: string;
  
  // Event details
  type: SubscriptionEventType;
  data: Record<string, any>;
  
  // Processing
  processed: boolean;
  processedAt?: Date;
  error?: string;
  retryCount: number;
  
  // Source
  source: 'stripe' | 'manual' | 'system';
  sourceEventId?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export type SubscriptionEventType = 
  | 'subscription_created'
  | 'subscription_updated'
  | 'subscription_canceled'
  | 'subscription_reactivated'
  | 'tier_upgraded'
  | 'tier_downgraded'
  | 'payment_succeeded'
  | 'payment_failed'
  | 'invoice_created'
  | 'invoice_paid'
  | 'trial_started'
  | 'trial_ended'
  | 'usage_limit_reached'
  | 'renewal_reminder';

// Subscription change requests
export interface SubscriptionChangeRequest {
  id: string;
  subscriptionId: string;
  userId: string;
  
  // Change details
  changeType: 'upgrade' | 'downgrade' | 'cancel' | 'pause' | 'resume';
  fromTier: SubscriptionTier;
  toTier?: SubscriptionTier;
  
  // Timing
  effectiveDate: Date;
  immediateChange: boolean;
  
  // Pricing
  proratedAmount?: number; // in cents
  refundAmount?: number; // in cents
  additionalCharge?: number; // in cents
  
  // Status
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'failed' | 'canceled';
  
  // Processing
  processedBy?: string; // admin user ID
  processedAt?: Date;
  error?: string;
  
  // Customer communication
  customerNotified: boolean;
  notificationSentAt?: Date;
  
  // Reason
  reason?: string;
  customerNote?: string;
  internalNote?: string;
  
  // Timestamps
  requestedAt: Date;
  updatedAt: Date;
}

// Coupon and discount types
export interface Coupon {
  id: string;
  code: string;
  name: string;
  description?: string;
  
  // Discount details
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  currency?: string; // required if fixed_amount
  
  // Validity
  validFrom: Date;
  validUntil?: Date;
  maxRedemptions?: number;
  currentRedemptions: number;
  
  // Restrictions
  applicableTiers: SubscriptionTier[];
  firstTimeCustomersOnly: boolean;
  minimumAmount?: number; // in cents
  
  // Status
  isActive: boolean;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // admin user ID
}

export interface CouponRedemption {
  id: string;
  couponId: string;
  userId: string;
  subscriptionId: string;
  
  // Redemption details
  discountAmount: number; // in cents
  appliedToInvoice?: string;
  
  // Timestamps
  redeemedAt: Date;
  expiresAt?: Date;
  
  // Status
  isActive: boolean;
  canceledAt?: Date;
}

// Gift subscription types
export interface GiftSubscription {
  id: string;
  gifterId: string; // user who purchased the gift
  recipientId?: string; // user who received the gift
  recipientEmail?: string; // if recipient not yet registered
  
  // Gift details
  tier: SubscriptionTier;
  duration: number; // in months
  personalMessage?: string;
  
  // Status
  status: 'pending' | 'claimed' | 'expired' | 'canceled';
  
  // Dates
  purchasedAt: Date;
  claimedAt?: Date;
  expiresAt: Date;
  
  // Payment
  amount: number; // in cents
  currency: string;
  paymentMethod: PaymentMethod;
  
  // Delivery
  deliveryMethod: 'email' | 'physical_card';
  deliveryDate?: Date;
  deliveredAt?: Date;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// Subscription history and audit trail
export interface SubscriptionHistory {
  id: string;
  subscriptionId: string;
  userId: string;
  
  // Change details
  changeType: string;
  previousValues: Record<string, any>;
  newValues: Record<string, any>;
  
  // Context
  reason?: string;
  triggeredBy: 'user' | 'admin' | 'system' | 'stripe';
  triggeredById?: string;
  
  // Impact
  financialImpact?: number; // in cents
  usageImpact?: Record<string, number>;
  
  // Timestamps
  effectiveDate: Date;
  recordedAt: Date;
}

// Dunning management (failed payment recovery)
export interface DunningAttempt {
  id: string;
  subscriptionId: string;
  invoiceId: string;
  
  // Attempt details
  attemptNumber: number;
  maxAttempts: number;
  retryDate: Date;
  
  // Communication
  emailSent: boolean;
  emailTemplate: string;
  notificationSentAt?: Date;
  
  // Status
  status: 'scheduled' | 'attempted' | 'succeeded' | 'failed' | 'abandoned';
  
  // Results
  paymentSucceeded: boolean;
  error?: string;
  
  // Next steps
  nextAttemptDate?: Date;
  escalationLevel: number;
  
  // Timestamps
  createdAt: Date;
  processedAt?: Date;
}

// Subscription preferences
export interface SubscriptionPreferences {
  userId: string;
  
  // Billing preferences
  preferredBillingInterval: BillingInterval;
  autoRenew: boolean;
  invoiceEmail: string;
  
  // Communication preferences
  renewalReminders: boolean;
  usageAlerts: boolean;
  promotionalEmails: boolean;
  
  // Payment preferences
  preferredPaymentMethod?: string;
  backupPaymentMethod?: string;
  
  // Feature preferences
  autoUpgradeOnLimitReach: boolean;
  downgradePrevention: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Subscription reports
export interface SubscriptionReport {
  id: string;
  type: 'revenue' | 'churn' | 'growth' | 'usage' | 'retention';
  
  // Report parameters
  periodStart: Date;
  periodEnd: Date;
  filters: Record<string, any>;
  
  // Report data
  data: Record<string, any>;
  summary: Record<string, number>;
  charts: ChartData[];
  
  // Generation info
  generatedBy: string; // admin user ID
  generatedAt: Date;
  format: 'json' | 'csv' | 'pdf';
  
  // File storage
  fileUrl?: string;
  fileSize?: number;
  expiresAt?: Date;
  
  // Status
  status: 'generating' | 'completed' | 'failed';
  error?: string;
}

export interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'area';
  title: string;
  data: Array<{
    label: string;
    value: number;
    date?: Date;
  }>;
  options?: Record<string, any>;
}