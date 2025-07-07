// Email template types
export type EmailTemplateType = 
  | 'welcome'
  | 'password_reset'
  | 'email_verification'
  | 'story_completed'
  | 'mentor_comment'
  | 'weekly_progress'
  | 'achievement_unlocked'
  | 'subscription_created'
  | 'subscription_canceled'
  | 'subscription_expiring'
  | 'payment_failed'
  | 'payment_succeeded'
  | 'trial_ending'
  | 'usage_limit_warning'
  | 'maintenance_notice'
  | 'new_feature_announcement';

// Main email interface
export interface Email {
  id: string;
  
  // Recipients
  to: string[];
  cc?: string[];
  bcc?: string[];
  from: string;
  replyTo?: string;
  
  // Content
  subject: string;
  htmlContent: string;
  textContent: string;
  templateType?: EmailTemplateType;
  templateData?: Record<string, any>;
  
  // Status
  status: EmailStatus;
  priority: EmailPriority;
  
  // Delivery tracking
  sentAt?: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  bouncedAt?: Date;
  complainedAt?: Date;
  
  // Attempts and errors
  attempts: number;
  maxAttempts: number;
  lastAttemptAt?: Date;
  nextAttemptAt?: Date;
  error?: string;
  
  // Metadata
  userId?: string;
  storyId?: string;
  subscriptionId?: string;
  campaignId?: string;
  tags: string[];
  
  // Personalization
  personalization: Record<string, any>;
  
  // Analytics
  opens: number;
  clicks: number;
  uniqueOpens: number;
  uniqueClicks: number;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  scheduledFor?: Date;
}

export type EmailStatus = 
  | 'draft'
  | 'queued'
  | 'sending'
  | 'sent'
  | 'delivered'
  | 'opened'
  | 'clicked'
  | 'bounced'
  | 'complained'
  | 'failed'
  | 'canceled';

export type EmailPriority = 'low' | 'normal' | 'high' | 'urgent';

// Email template system
export interface EmailTemplate {
  id: string;
  type: EmailTemplateType;
  name: string;
  description: string;
  
  // Template content
  subject: string;
  htmlTemplate: string;
  textTemplate: string;
  
  // Variables
  variables: EmailVariable[];
  requiredVariables: string[];
  
  // Settings
  isActive: boolean;
  isDefault: boolean;
  category: string;
  
  // Localization
  language: string;
  localizedVersions: string[]; // other language template IDs
  
  // Design
  designSystem: 'default' | 'branded' | 'minimal';
  colorScheme: 'light' | 'dark' | 'auto';
  
  // Testing
  testEmailAddresses: string[];
  lastTested?: Date;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // admin user ID
  version: number;
}

export interface EmailVariable {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'array' | 'object';
  description: string;
  defaultValue?: any;
  required: boolean;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
  };
}

// Email campaign management
export interface EmailCampaign {
  id: string;
  name: string;
  description?: string;
  
  // Campaign settings
  templateId: string;
  subject: string;
  
  // Recipients
  recipientList: CampaignRecipient[];
  totalRecipients: number;
  
  // Scheduling
  scheduleType: 'immediate' | 'scheduled' | 'recurring';
  scheduledAt?: Date;
  recurringPattern?: RecurringPattern;
  
  // Status
  status: CampaignStatus;
  
  // Delivery stats
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  complained: number;
  
  // Performance metrics
  openRate: number; // percentage
  clickRate: number; // percentage
  bounceRate: number; // percentage
  complaintRate: number; // percentage
  
  // A/B testing
  isABTest: boolean;
  abTestVariants?: ABTestVariant[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // admin user ID
  completedAt?: Date;
}

export type CampaignStatus = 
  | 'draft'
  | 'scheduled'
  | 'sending'
  | 'sent'
  | 'paused'
  | 'canceled'
  | 'completed';

export interface CampaignRecipient {
  userId: string;
  email: string;
  name: string;
  personalizationData: Record<string, any>;
  status: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'complained';
  sentAt?: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
}

export interface RecurringPattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  interval: number; // every N frequency units
  daysOfWeek?: number[]; // 0-6, Sunday=0
  dayOfMonth?: number; // 1-31
  endDate?: Date;
  maxOccurrences?: number;
}

export interface ABTestVariant {
  id: string;
  name: string;
  subject: string;
  htmlTemplate: string;
  textTemplate: string;
  percentage: number; // 0-100
  recipientCount: number;
  
  // Performance
  sent: number;
  opened: number;
  clicked: number;
  openRate: number;
  clickRate: number;
  
  isWinner: boolean;
}

// Email preferences and subscription management
export interface EmailPreferences {
  userId: string;
  
  // Global settings
  emailEnabled: boolean;
  preferredLanguage: string;
  timeZone: string;
  
  // Content preferences
  categories: EmailCategoryPreference[];
  
  // Frequency preferences
  digestFrequency: 'never' | 'daily' | 'weekly' | 'monthly';
  marketingEmails: boolean;
  productUpdates: boolean;
  
  // Delivery preferences
  preferredTimeOfDay: string; // HH:MM format
  preferredDaysOfWeek: number[]; // 0-6
  
  // Unsubscribe tracking
  unsubscribedCategories: string[];
  globalUnsubscribe: boolean;
  unsubscribedAt?: Date;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailCategoryPreference {
  category: string;
  enabled: boolean;
  frequency: 'immediate' | 'daily' | 'weekly' | 'never';
  lastEmailSent?: Date;
}

// Email analytics and tracking
export interface EmailAnalytics {
  // Overview metrics
  totalEmailsSent: number;
  totalEmailsDelivered: number;
  totalOpens: number;
  totalClicks: number;
  totalBounces: number;
  totalComplaints: number;
  
  // Rates
  deliveryRate: number; // percentage
  openRate: number; // percentage
  clickRate: number; // percentage
  bounceRate: number; // percentage
  complaintRate: number; // percentage
  unsubscribeRate: number; // percentage
  
  // By template type
  performanceByTemplate: Record<EmailTemplateType, TemplatePerformance>;
  
  // By time period
  dailyMetrics: DailyEmailMetrics[];
  weeklyMetrics: WeeklyEmailMetrics[];
  monthlyMetrics: MonthlyEmailMetrics[];
  
  // Top performers
  topPerformingSubjects: SubjectPerformance[];
  topPerformingTemplates: TemplatePerformance[];
  
  // Engagement insights
  bestSendTimes: TimeSlot[];
  bestSendDays: DayPerformance[];
  
  // Device and client analysis
  deviceBreakdown: DeviceStats[];
  emailClientBreakdown: EmailClientStats[];
  
  // Geographic data
  countryPerformance: CountryPerformance[];
  
  // Date range
  periodStart: Date;
  periodEnd: Date;
  lastCalculated: Date;
}

export interface TemplatePerformance {
  templateType: EmailTemplateType;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  openRate: number;
  clickRate: number;
  averageTimeToOpen: number; // in minutes
}

export interface SubjectPerformance {
  subject: string;
  sent: number;
  openRate: number;
  clickRate: number;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface DailyEmailMetrics {
  date: Date;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  complained: number;
  openRate: number;
  clickRate: number;
}

export interface WeeklyEmailMetrics {
  weekStart: Date;
  weekEnd: Date;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  openRate: number;
  clickRate: number;
  growth: number; // percentage change from previous week
}

export interface MonthlyEmailMetrics {
  month: number;
  year: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  openRate: number;
  clickRate: number;
  revenue: number; // attributed to email campaigns
}

export interface TimeSlot {
  hour: number; // 0-23
  openRate: number;
  clickRate: number;
  volume: number;
}

export interface DayPerformance {
  dayOfWeek: number; // 0-6
  openRate: number;
  clickRate: number;
  volume: number;
}

export interface DeviceStats {
  deviceType: 'desktop' | 'mobile' | 'tablet';
  count: number;
  percentage: number;
  openRate: number;
  clickRate: number;
}

export interface EmailClientStats {
  client: string; // Gmail, Outlook, Apple Mail, etc.
  count: number;
  percentage: number;
  openRate: number;
  clickRate: number;
}

export interface CountryPerformance {
  country: string;
  sent: number;
  openRate: number;
  clickRate: number;
}

// Email list management
export interface EmailList {
  id: string;
  name: string;
  description?: string;
  
  // List settings
  isActive: boolean;
  isPublic: boolean;
  requiresDoubleOptIn: boolean;
  
  // Subscribers
  subscriberCount: number;
  activeSubscribers: number;
  unsubscribedSubscribers: number;
  
  // Segmentation
  segments: ListSegment[];
  tags: string[];
  
  // Performance
  averageOpenRate: number;
  averageClickRate: number;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // admin user ID
}

export interface ListSegment {
  id: string;
  name: string;
  description?: string;
  conditions: SegmentCondition[];
  subscriberCount: number;
  isActive: boolean;
  createdAt: Date;
}

export interface SegmentCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

// Email deliverability and reputation
export interface EmailDeliverability {
  // Reputation scores
  senderScore: number; // 0-100
  domainReputation: number; // 0-100
  ipReputation: number; // 0-100
  
  // Authentication
  spfStatus: 'pass' | 'fail' | 'neutral' | 'none';
  dkimStatus: 'pass' | 'fail' | 'neutral' | 'none';
  dmarcStatus: 'pass' | 'fail' | 'neutral' | 'none';
  
  // Blacklist monitoring
  blacklistStatus: BlacklistStatus[];
  
  // ISP feedback
  ispFeedback: ISPFeedback[];
  
  // Recommendations
  recommendations: DeliverabilityRecommendation[];
  
  // Last checked
  lastChecked: Date;
}

export interface BlacklistStatus {
  listName: string;
  isListed: boolean;
  detectedAt?: Date;
  resolvedAt?: Date;
  reason?: string;
}

export interface ISPFeedback {
  isp: string; // Gmail, Outlook, Yahoo, etc.
  deliveryRate: number;
  spamFolderRate: number;
  blockedRate: number;
  feedback?: string;
  lastUpdated: Date;
}

export interface DeliverabilityRecommendation {
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  actionRequired: string;
  priority: number; // 1-10
  estimatedImpact: 'high' | 'medium' | 'low';
}

// Email automation and workflows
export interface EmailWorkflow {
  id: string;
  name: string;
  description?: string;
  
  // Trigger
  trigger: WorkflowTrigger;
  
  // Steps
  steps: WorkflowStep[];
  
  // Settings
  isActive: boolean;
  maxExecutions?: number;
  currentExecutions: number;
  
  // Performance
  totalRuns: number;
  successfulRuns: number;
  averageCompletionTime: number; // in minutes
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // admin user ID
}

export interface WorkflowTrigger {
  type: 'event' | 'date' | 'user_action' | 'api';
  conditions: TriggerCondition[];
  delay?: number; // in minutes
}

export interface TriggerCondition {
  event: 'user_registered' | 'story_completed' | 'subscription_created' | 'payment_failed' | 'login' | 'custom';
  filters?: Record<string, any>;
}

export interface WorkflowStep {
  id: string;
  type: 'email' | 'wait' | 'condition' | 'action';
  order: number;
  
  // Email step
  templateId?: string;
  personalization?: Record<string, any>;
  
  // Wait step
  waitDuration?: number; // in minutes
  waitUntil?: Date;
  
  // Condition step
  condition?: WorkflowCondition;
  
  // Action step
  action?: WorkflowAction;
  
  // Flow control
  nextStepId?: string;
  alternativeStepId?: string; // for condition branches
}

export interface WorkflowCondition {
  field: string;
  operator: string;
  value: any;
}

export interface WorkflowAction {
  type: 'update_user' | 'add_tag' | 'remove_tag' | 'api_call';
  parameters: Record<string, any>;
}