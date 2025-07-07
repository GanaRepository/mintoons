import mongoose, { Schema, Document, Model } from 'mongoose';
import { NotificationType } from '@/types';

// Notification interface extending mongoose Document
export interface INotification extends Document {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  
  // Actions
  actionUrl?: string;
  actionText?: string;
  
  // Status
  isRead: boolean;
  readAt?: Date;
  
  // Scheduling
  scheduledFor?: Date;
  expiresAt?: Date;
  
  // Delivery
  deliveryMethod: 'push' | 'email' | 'in_app' | 'all';
  deliveredAt?: Date;
  deliveryStatus: 'pending' | 'sent' | 'delivered' | 'failed';
  deliveryError?: string;
  
  // Priority and appearance
  priority: 'low' | 'normal' | 'high' | 'urgent';
  variant: 'info' | 'success' | 'warning' | 'error';
  icon?: string;
  
  // Grouping and categorization
  category?: string;
  groupId?: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  markAsRead(): Promise<void>;
  markAsUnread(): Promise<void>;
  deliver(): Promise<void>;
  isExpired(): boolean;
  canBeDelivered(): boolean;
}

// Notification schema definition
const NotificationSchema = new Schema<INotification>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  
  type: {
    type: String,
    enum: [
      'story_completed',
      'mentor_comment',
      'achievement_unlocked',
      'story_published',
      'mentor_online',
      'progress_milestone',
      'subscription_update',
      'system_announcement',
      'maintenance_alert',
      'welcome',
      'reminder',
      'export_ready'
    ],
    required: true,
    index: true,
  },
  
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be longer than 200 characters'],
  },
  
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true,
    maxlength: [1000, 'Message cannot be longer than 1000 characters'],
  },
  
  data: {
    type: Schema.Types.Mixed,
    default: {},
  },
  
  actionUrl: {
    type: String,
    trim: true,
    maxlength: [500, 'Action URL cannot be longer than 500 characters'],
  },
  
  actionText: {
    type: String,
    trim: true,
    maxlength: [100, 'Action text cannot be longer than 100 characters'],
  },
  
  isRead: {
    type: Boolean,
    default: false,
    index: true,
  },
  
  readAt: {
    type: Date,
    index: true,
  },
  
  scheduledFor: {
    type: Date,
    index: true,
  },
  
  expiresAt: {
    type: Date,
    index: true,
  },
  
  deliveryMethod: {
    type: String,
    enum: ['push', 'email', 'in_app', 'all'],
    default: 'in_app',
    required: true,
  },
  
  deliveredAt: {
    type: Date,
    index: true,
  },
  
  deliveryStatus: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'failed'],
    default: 'pending',
    index: true,
  },
  
  deliveryError: {
    type: String,
    trim: true,
  },
  
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal',
    index: true,
  },
  
  variant: {
    type: String,
    enum: ['info', 'success', 'warning', 'error'],
    default: 'info',
    index: true,
  },
  
  icon: {
    type: String,
    trim: true,
  },
  
  category: {
    type: String,
    trim: true,
    index: true,
  },
  
  groupId: {
    type: String,
    trim: true,
    index: true,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for performance
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ type: 1, createdAt: -1 });
NotificationSchema.index({ deliveryStatus: 1, scheduledFor: 1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index
NotificationSchema.index({ priority: 1, createdAt: -1 });
NotificationSchema.index({ groupId: 1, createdAt: -1 });

// Compound indexes
NotificationSchema.index({ userId: 1, type: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, deliveryStatus: 1, scheduledFor: 1 });

// Virtual properties
NotificationSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

NotificationSchema.virtual('isNew').get(function() {
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
  return this.createdAt > hourAgo && !this.isRead;
});

NotificationSchema.virtual('isScheduled').get(function() {
  return this.scheduledFor && this.scheduledFor > new Date();
});

NotificationSchema.virtual('timeUntilDelivery').get(function() {
  if (!this.scheduledFor) return 0;
  const now = new Date();
  return Math.max(0, this.scheduledFor.getTime() - now.getTime());
});

NotificationSchema.virtual('timeUntilExpiry').get(function() {
  if (!this.expiresAt) return -1;
  const now = new Date();
  return Math.max(0, this.expiresAt.getTime() - now.getTime());
});

// Pre-save middleware
NotificationSchema.pre('save', function(next) {
  // Set default category based on type
  if (!this.category) {
    this.category = this.getCategoryFromType();
  }
  
  // Set default icon based on type
  if (!this.icon) {
    this.icon = this.getIconFromType();
  }
  
  // Auto-set expiry for certain types
  if (!this.expiresAt) {
    this.expiresAt = this.getDefaultExpiry();
  }
  
  next();
});

// Instance methods
NotificationSchema.methods.markAsRead = async function(): Promise<void> {
  return this.updateOne({
    $set: {
      isRead: true,
      readAt: new Date(),
    }
  });
};

NotificationSchema.methods.markAsUnread = async function(): Promise<void> {
  return this.updateOne({
    $set: {
      isRead: false,
    },
    $unset: {
      readAt: 1,
    }
  });
};

NotificationSchema.methods.deliver = async function(): Promise<void> {
  // Check if notification can be delivered
  if (!this.canBeDelivered()) {
    throw new Error('Notification cannot be delivered');
  }
  
  try {
    // Here you would implement actual delivery logic
    // For now, just mark as delivered
    await this.updateOne({
      $set: {
        deliveryStatus: 'delivered',
        deliveredAt: new Date(),
      }
    });
  } catch (error) {
    await this.updateOne({
      $set: {
        deliveryStatus: 'failed',
        deliveryError: error instanceof Error ? error.message : 'Unknown error',
      }
    });
    throw error;
  }
};

NotificationSchema.methods.isExpired = function(): boolean {
  return this.expiresAt ? new Date() > this.expiresAt : false;
};

NotificationSchema.methods.canBeDelivered = function(): boolean {
  if (this.isExpired()) return false;
  if (this.deliveryStatus === 'delivered') return false;
  if (this.scheduledFor && this.scheduledFor > new Date()) return false;
  
  return true;
};

NotificationSchema.methods.getCategoryFromType = function(): string {
  const categoryMap: Record<string, string> = {
    story_completed: 'writing',
    story_published: 'writing',
    mentor_comment: 'feedback',
    mentor_online: 'social',
    achievement_unlocked: 'achievement',
    progress_milestone: 'progress',
    subscription_update: 'account',
    system_announcement: 'system',
    maintenance_alert: 'system',
    welcome: 'onboarding',
    reminder: 'system',
    export_ready: 'system',
  };
  
  return categoryMap[this.type] || 'general';
};

NotificationSchema.methods.getIconFromType = function(): string {
  const iconMap: Record<string, string> = {
    story_completed: '📖',
    story_published: '🎉',
    mentor_comment: '💬',
    mentor_online: '👨‍🏫',
    achievement_unlocked: '🏆',
    progress_milestone: '📈',
    subscription_update: '💳',
    system_announcement: '📢',
    maintenance_alert: '🔧',
    welcome: '👋',
    reminder: '⏰',
    export_ready: '📄',
  };
  
  return iconMap[this.type] || '🔔';
};

NotificationSchema.methods.getDefaultExpiry = function(): Date {
  const expiryMap: Record<string, number> = {
    story_completed: 7, // 7 days
    story_published: 30, // 30 days
    mentor_comment: 14, // 14 days
    mentor_online: 1, // 1 day
    achievement_unlocked: 30, // 30 days
    progress_milestone: 14, // 14 days
    subscription_update: 7, // 7 days
    system_announcement: 30, // 30 days
    maintenance_alert: 3, // 3 days
    welcome: 7, // 7 days
    reminder: 1, // 1 day
    export_ready: 3, // 3 days
  };
  
  const days = expiryMap[this.type] || 7;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
};

// Static methods
NotificationSchema.statics.findByUser = function(userId: string, options: any = {}) {
  const query = { userId };
  
  if (options.unreadOnly) {
    query.isRead = false;
  }
  
  if (options.category) {
    query.category = options.category;
  }
  
  if (options.type) {
    query.type = options.type;
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(options.limit || 50);
};

NotificationSchema.statics.findUnreadByUser = function(userId: string) {
  return this.find({ userId, isRead: false })
    .sort({ createdAt: -1 });
};

NotificationSchema.statics.getUnreadCount = function(userId: string) {
  return this.countDocuments({ userId, isRead: false });
};

NotificationSchema.statics.markAllAsRead = function(userId: string) {
  return this.updateMany(
    { userId, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );
};

NotificationSchema.statics.findPendingDelivery = function() {
  return this.find({
    deliveryStatus: 'pending',
    $or: [
      { scheduledFor: { $exists: false } },
      { scheduledFor: { $lte: new Date() } }
    ],
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ]
  }).sort({ priority: -1, createdAt: 1 });
};

NotificationSchema.statics.createNotification = async function(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  options: any = {}
) {
  const notification = await this.create({
    userId,
    type,
    title,
    message,
    data: options.data || {},
    actionUrl: options.actionUrl,
    actionText: options.actionText,
    scheduledFor: options.scheduledFor,
    expiresAt: options.expiresAt,
    deliveryMethod: options.deliveryMethod || 'in_app',
    priority: options.priority || 'normal',
    variant: options.variant || 'info',
    icon: options.icon,
    category: options.category,
    groupId: options.groupId,
  });
  
  // Auto-deliver if not scheduled
  if (!notification.scheduledFor || notification.scheduledFor <= new Date()) {
    await notification.deliver();
  }
  
  return notification;
};

NotificationSchema.statics.createBulkNotifications = async function(
  notifications: Array<{
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    options?: any;
  }>
) {
  const docs = notifications.map(({ userId, type, title, message, options = {} }) => ({
    userId,
    type,
    title,
    message,
    data: options.data || {},
    actionUrl: options.actionUrl,
    actionText: options.actionText,
    scheduledFor: options.scheduledFor,
    expiresAt: options.expiresAt,
    deliveryMethod: options.deliveryMethod || 'in_app',
    priority: options.priority || 'normal',
    variant: options.variant || 'info',
    icon: options.icon,
    category: options.category,
    groupId: options.groupId,
  }));
  
  return this.insertMany(docs);
};

NotificationSchema.statics.getNotificationStats = async function(userId?: string) {
  const matchCondition = userId ? { userId: new mongoose.Types.ObjectId(userId) } : {};
  
  const pipeline = [
    { $match: matchCondition },
    {
      $group: {
        _id: null,
        totalNotifications: { $sum: 1 },
        readNotifications: { $sum: { $cond: ['$isRead', 1, 0] } },
        unreadNotifications: { $sum: { $cond: ['$isRead', 0, 1] } },
        deliveredNotifications: { $sum: { $cond: [{ $eq: ['$deliveryStatus', 'delivered'] }, 1, 0] } },
        failedNotifications: { $sum: { $cond: [{ $eq: ['$deliveryStatus', 'failed'] }, 1, 0] } },
        notificationsByType: { $push: '$type' },
        notificationsByPriority: { $push: '$priority' },
      }
    }
  ];
  
  const result = await this.aggregate(pipeline);
  return result[0] || {};
};

NotificationSchema.statics.cleanupExpired = async function() {
  const result = await this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
  
  return result.deletedCount;
};

NotificationSchema.statics.findByGroup = function(groupId: string) {
  return this.find({ groupId }).sort({ createdAt: -1 });
};

NotificationSchema.statics.deleteGroup = function(groupId: string) {
  return this.deleteMany({ groupId });
};

// Create and export the model
const Notification: Model<INotification> = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;