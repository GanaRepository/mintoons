// Real-time event types
export type RealtimeEventType = 
  | 'typing_started'
  | 'typing_stopped'
  | 'comment_added'
  | 'comment_updated'
  | 'comment_resolved'
  | 'story_saved'
  | 'story_published'
  | 'user_joined'
  | 'user_left'
  | 'achievement_unlocked'
  | 'mentor_online'
  | 'mentor_offline'
  | 'notification_received'
  | 'progress_updated'
  | 'ai_response_ready'
  | 'export_completed';

// Main real-time event interface
export interface RealtimeEvent {
  id: string;
  type: RealtimeEventType;
  channel: string;
  userId: string;
  userName?: string;
  userRole?: string;
  
  // Event data
  data: Record<string, any>;
  
  // Targeting
  targetUsers?: string[]; // specific user IDs
  excludeUsers?: string[]; // exclude specific user IDs
  roleFilter?: string[]; // only send to specific roles
  
  // Metadata
  timestamp: Date;
  expiresAt?: Date;
  priority: 'low' | 'normal' | 'high';
  
  // Delivery tracking
  deliveredTo: string[];
  failedDelivery: string[];
}

// Channel types for organizing real-time events
export type ChannelType = 
  | 'story'
  | 'user'
  | 'mentor'
  | 'global'
  | 'notification'
  | 'progress';

export interface Channel {
  id: string;
  type: ChannelType;
  name: string;
  
  // Access control
  isPublic: boolean;
  allowedRoles: string[];
  allowedUsers: string[];
  
  // Participants
  activeUsers: ChannelParticipant[];
  subscriberCount: number;
  
  // Settings
  maxParticipants?: number;
  messageRetention: number; // in hours
  rateLimitPerMinute: number;
  
  // Metadata
  createdAt: Date;
  lastActivity: Date;
  isActive: boolean;
}

export interface ChannelParticipant {
  userId: string;
  userName: string;
  userRole: string;
  joinedAt: Date;
  lastSeen: Date;
  isActive: boolean;
  permissions: ChannelPermission[];
}

export type ChannelPermission = 
  | 'read'
  | 'write'
  | 'moderate'
  | 'admin';

// Typing indicators for collaborative editing
export interface TypingIndicator {
  id: string;
  storyId: string;
  userId: string;
  userName: string;
  userRole: string;
  
  // Typing details
  isTyping: boolean;
  position?: number; // cursor position in text
  selection?: {
    start: number;
    end: number;
  };
  
  // Timing
  startedAt: Date;
  lastUpdateAt: Date;
  expiresAt: Date;
  
  // Visual indicators
  cursorColor?: string;
  highlightColor?: string;
  avatar?: string;
  userInitials?: string;
}

// WebSocket connection management
export interface WSConnection {
  id: string;
  userId: string;
  userRole: string;
  channels: string[];
  connectedAt: Date;
  lastPing: Date;
  isActive: boolean;
  clientInfo?: {
    userAgent: string;
    ip: string;
    device: 'desktop' | 'tablet' | 'mobile';
  };
}

// Presence system for user status
export interface UserPresence {
  userId: string;
  userName: string;
  userRole: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen: Date;
  currentActivity?: {
    type: 'writing' | 'reading' | 'commenting' | 'browsing';
    storyId?: string;
    storyTitle?: string;
  };
  avatar?: string;
}

// Real-time story collaboration session
export interface CollaborationSession {
  storyId: string;
  participants: SessionParticipant[];
  activeTyping: TypingIndicator[];
  lastActivity: Date;
  version: number;
  lockHolder?: {
    userId: string;
    lockedAt: Date;
    expiresAt: Date;
  };
}

export interface SessionParticipant {
  userId: string;
  userName: string;
  userRole: string;
  joinedAt: Date;
  lastActivity: Date;
  permissions: {
    canEdit: boolean;
    canComment: boolean;
    canView: boolean;
  };
  cursorPosition?: number;
  isActive: boolean;
}

// Server-Sent Events (SSE) management
export interface SSEConnection {
  id: string;
  userId: string;
  userRole: string;
  connectedAt: Date;
  lastHeartbeat: Date;
  channels: string[];
  isActive: boolean;
}

export interface SSEMessage {
  id: string;
  event: string;
  data: any;
  retry?: number;
  timestamp: Date;
}

// Real-time notification events
export interface NotificationEvent {
  id: string;
  type: 'notification_received' | 'notification_read' | 'notification_cleared';
  userId: string;
  notificationId: string;
  timestamp: Date;
  channel: string;
}

// Real-time metrics for monitoring
export interface RealtimeMetrics {
  timestamp: Date;
  activeConnections: number;
  totalConnections: number;
  connectionsPerMinute: number;
  eventsPerSecond: number;
  totalEventsSent: number;
  failedEvents: number;
  activeChannels: number;
  averageLatency: number;
  memoryUsage: number;
}