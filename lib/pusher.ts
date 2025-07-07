import Pusher from 'pusher';
import PusherClient from 'pusher-js';

// Server-side Pusher configuration
const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER || 'us2',
  useTLS: true,
});

// Client-side Pusher configuration (for frontend)
export const pusherClient = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2',
  enabledTransports: ['ws', 'wss'],
});

// Event types for type safety
export interface PusherEventData {
  'mentor-typing': {
    storyId: string;
    mentorId: string;
    mentorName: string;
    isTyping: boolean;
  };
  'comment-added': {
    storyId: string;
    comment: {
      id: string;
      content: string;
      type: string;
      commenterName: string;
      timestamp: string;
    };
  };
  'story-updated': {
    storyId: string;
    userId: string;
    updateType: 'content' | 'status' | 'assessment';
    timestamp: string;
  };
  'achievement-unlocked': {
    userId: string;
    achievement: {
      id: string;
      name: string;
      description: string;
      icon: string;
    };
  };
  'mentor-online': {
    mentorId: string;
    mentorName: string;
    status: 'online' | 'offline';
  };
  'notification': {
    userId: string;
    notification: {
      id: string;
      type: string;
      title: string;
      message: string;
      actionUrl?: string;
    };
  };
}

// Real-time service for server-side operations
export class RealTimeService {
  private static instance: RealTimeService;

  static getInstance(): RealTimeService {
    if (!RealTimeService.instance) {
      RealTimeService.instance = new RealTimeService();
    }
    return RealTimeService.instance;
  }

  // Send typing indicators for mentors
  async sendMentorTyping(
    storyId: string,
    mentorId: string,
    mentorName: string,
    isTyping: boolean
  ): Promise<void> {
    try {
      await pusherServer.trigger(
        `story-${storyId}`,
        'mentor-typing',
        {
          storyId,
          mentorId,
          mentorName,
          isTyping,
        }
      );
    } catch (error) {
      console.error('Failed to send typing indicator:', error);
    }
  }

  // Notify when a comment is added
  async notifyCommentAdded(
    storyId: string,
    userId: string,
    comment: any
  ): Promise<void> {
    try {
      // Notify on story channel
      await pusherServer.trigger(
        `story-${storyId}`,
        'comment-added',
        {
          storyId,
          comment: {
            id: comment._id?.toString(),
            content: comment.content,
            type: comment.type,
            commenterName: comment.commenterName,
            timestamp: comment.createdAt,
          },
        }
      );

      // Also notify the user directly
      await pusherServer.trigger(
        `user-${userId}`,
        'notification',
        {
          userId,
          notification: {
            id: Date.now().toString(),
            type: 'comment',
            title: 'New Comment!',
            message: `${comment.commenterName} left a comment on your story`,
            actionUrl: `/my-stories/${storyId}`,
          },
        }
      );
    } catch (error) {
      console.error('Failed to notify comment added:', error);
    }
  }

  // Notify when a story is updated
  async notifyStoryUpdated(
    storyId: string,
    userId: string,
    updateType: 'content' | 'status' | 'assessment'
  ): Promise<void> {
    try {
      await pusherServer.trigger(
        `story-${storyId}`,
        'story-updated',
        {
          storyId,
          userId,
          updateType,
          timestamp: new Date().toISOString(),
        }
      );
    } catch (error) {
      console.error('Failed to notify story updated:', error);
    }
  }

  // Notify when an achievement is unlocked
  async notifyAchievementUnlocked(
    userId: string,
    achievement: any
  ): Promise<void> {
    try {
      await pusherServer.trigger(
        `user-${userId}`,
        'achievement-unlocked',
        {
          userId,
          achievement: {
            id: achievement._id?.toString(),
            name: achievement.name,
            description: achievement.description,
            icon: achievement.icon,
          },
        }
      );

      // Also send a general notification
      await pusherServer.trigger(
        `user-${userId}`,
        'notification',
        {
          userId,
          notification: {
            id: Date.now().toString(),
            type: 'achievement',
            title: 'Achievement Unlocked! 🏆',
            message: `You've earned the "${achievement.name}" achievement!`,
            actionUrl: '/progress',
          },
        }
      );
    } catch (error) {
      console.error('Failed to notify achievement unlocked:', error);
    }
  }

  // Update mentor online status
  async updateMentorStatus(
    mentorId: string,
    mentorName: string,
    status: 'online' | 'offline',
    assignedStudents: string[]
  ): Promise<void> {
    try {
      // Notify all assigned students
      const triggerPromises = assignedStudents.map(studentId =>
        pusherServer.trigger(
          `user-${studentId}`,
          'mentor-online',
          {
            mentorId,
            mentorName,
            status,
          }
        )
      );

      await Promise.all(triggerPromises);
    } catch (error) {
      console.error('Failed to update mentor status:', error);
    }
  }

  // Send general notification
  async sendNotification(
    userId: string,
    notification: {
      type: string;
      title: string;
      message: string;
      actionUrl?: string;
    }
  ): Promise<void> {
    try {
      await pusherServer.trigger(
        `user-${userId}`,
        'notification',
        {
          userId,
          notification: {
            id: Date.now().toString(),
            ...notification,
          },
        }
      );
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  // Bulk notify multiple users
  async bulkNotify(
    userIds: string[],
    notification: {
      type: string;
      title: string;
      message: string;
      actionUrl?: string;
    }
  ): Promise<void> {
    try {
      const channels = userIds.map(userId => `user-${userId}`);
      
      await pusherServer.triggerBatch(
        channels.map(channel => ({
          channel,
          name: 'notification',
          data: {
            notification: {
              id: Date.now().toString(),
              ...notification,
            },
          },
        }))
      );
    } catch (error) {
      console.error('Failed to send bulk notifications:', error);
    }
  }

  // Authentication for private channels
  async authenticateUser(socketId: string, channel: string, userId: string): Promise<any> {
    try {
      // Verify user has permission to access this channel
      if (channel.startsWith('private-user-')) {
        const channelUserId = channel.replace('private-user-', '');
        if (channelUserId !== userId) {
          throw new Error('Unauthorized access to user channel');
        }
      } else if (channel.startsWith('private-story-')) {
        // Add story access verification logic here
        // Check if user owns the story or is assigned mentor
      }

      const authData = pusherServer.authorizeChannel(socketId, channel);
      return authData;
    } catch (error) {
      console.error('Failed to authenticate user for channel:', error);
      throw error;
    }
  }
}

// Client-side hooks and utilities
export class ClientRealTimeService {
  private pusher: PusherClient;
  private channels: Map<string, any> = new Map();

  constructor() {
    this.pusher = pusherClient;
  }

  // Subscribe to user-specific channel
  subscribeToUser(userId: string, callbacks: {
    onNotification?: (data: PusherEventData['notification']) => void;
    onAchievement?: (data: PusherEventData['achievement-unlocked']) => void;
    onMentorStatus?: (data: PusherEventData['mentor-online']) => void;
  }): void {
    const channelName = `user-${userId}`;
    
    if (this.channels.has(channelName)) {
      return; // Already subscribed
    }

    const channel = this.pusher.subscribe(channelName);
    
    if (callbacks.onNotification) {
      channel.bind('notification', callbacks.onNotification);
    }
    
    if (callbacks.onAchievement) {
      channel.bind('achievement-unlocked', callbacks.onAchievement);
    }
    
    if (callbacks.onMentorStatus) {
      channel.bind('mentor-online', callbacks.onMentorStatus);
    }

    this.channels.set(channelName, channel);
  }

  // Subscribe to story-specific channel
  subscribeToStory(storyId: string, callbacks: {
    onCommentAdded?: (data: PusherEventData['comment-added']) => void;
    onMentorTyping?: (data: PusherEventData['mentor-typing']) => void;
    onStoryUpdated?: (data: PusherEventData['story-updated']) => void;
  }): void {
    const channelName = `story-${storyId}`;
    
    if (this.channels.has(channelName)) {
      return; // Already subscribed
    }

    const channel = this.pusher.subscribe(channelName);
    
    if (callbacks.onCommentAdded) {
      channel.bind('comment-added', callbacks.onCommentAdded);
    }
    
    if (callbacks.onMentorTyping) {
      channel.bind('mentor-typing', callbacks.onMentorTyping);
    }
    
    if (callbacks.onStoryUpdated) {
      channel.bind('story-updated', callbacks.onStoryUpdated);
    }

    this.channels.set(channelName, channel);
  }

  // Unsubscribe from channel
  unsubscribe(channelName: string): void {
    if (this.channels.has(channelName)) {
      this.pusher.unsubscribe(channelName);
      this.channels.delete(channelName);
    }
  }

  // Unsubscribe from all channels
  unsubscribeAll(): void {
    this.channels.forEach((_, channelName) => {
      this.pusher.unsubscribe(channelName);
    });
    this.channels.clear();
  }

  // Get connection state
  getConnectionState(): string {
    return this.pusher.connection.state;
  }

  // Trigger client event (for presence channels)
  triggerClientEvent(channelName: string, eventName: string, data: any): void {
    const channel = this.channels.get(channelName);
    if (channel) {
      channel.trigger(`client-${eventName}`, data);
    }
  }
}

// React hooks for easier integration
export function usePusherSubscription() {
  const realTimeService = new ClientRealTimeService();

  return {
    subscribeToUser: realTimeService.subscribeToUser.bind(realTimeService),
    subscribeToStory: realTimeService.subscribeToStory.bind(realTimeService),
    unsubscribe: realTimeService.unsubscribe.bind(realTimeService),
    unsubscribeAll: realTimeService.unsubscribeAll.bind(realTimeService),
    connectionState: realTimeService.getConnectionState(),
  };
}

// Helper functions for common operations
export async function notifyMentorTyping(
  storyId: string,
  mentorId: string,
  mentorName: string,
  isTyping: boolean
): Promise<void> {
  const realTimeService = RealTimeService.getInstance();
  await realTimeService.sendMentorTyping(storyId, mentorId, mentorName, isTyping);
}

export async function notifyNewComment(
  storyId: string,
  userId: string,
  comment: any
): Promise<void> {
  const realTimeService = RealTimeService.getInstance();
  await realTimeService.notifyCommentAdded(storyId, userId, comment);
}

export async function notifyStoryUpdate(
  storyId: string,
  userId: string,
  updateType: 'content' | 'status' | 'assessment'
): Promise<void> {
  const realTimeService = RealTimeService.getInstance();
  await realTimeService.notifyStoryUpdated(storyId, userId, updateType);
}

export async function notifyAchievement(
  userId: string,
  achievement: any
): Promise<void> {
  const realTimeService = RealTimeService.getInstance();
  await realTimeService.notifyAchievementUnlocked(userId, achievement);
}

export async function updateMentorOnlineStatus(
  mentorId: string,
  mentorName: string,
  status: 'online' | 'offline',
  assignedStudents: string[]
): Promise<void> {
  const realTimeService = RealTimeService.getInstance();
  await realTimeService.updateMentorStatus(mentorId, mentorName, status, assignedStudents);
}

// Typing indicator manager for client-side
export class TypingIndicatorManager {
  private typingTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private readonly TYPING_TIMEOUT = 3000; // 3 seconds

  startTyping(storyId: string, mentorId: string, mentorName: string): void {
    const key = `${storyId}-${mentorId}`;
    
    // Clear existing timeout
    if (this.typingTimeouts.has(key)) {
      clearTimeout(this.typingTimeouts.get(key)!);
    }

    // Send typing start
    notifyMentorTyping(storyId, mentorId, mentorName, true);

    // Set timeout to automatically stop typing
    const timeout = setTimeout(() => {
      this.stopTyping(storyId, mentorId, mentorName);
    }, this.TYPING_TIMEOUT);

    this.typingTimeouts.set(key, timeout);
  }

  stopTyping(storyId: string, mentorId: string, mentorName: string): void {
    const key = `${storyId}-${mentorId}`;
    
    // Clear timeout
    if (this.typingTimeouts.has(key)) {
      clearTimeout(this.typingTimeouts.get(key)!);
      this.typingTimeouts.delete(key);
    }

    // Send typing stop
    notifyMentorTyping(storyId, mentorId, mentorName, false);
  }

  cleanup(): void {
    this.typingTimeouts.forEach(timeout => clearTimeout(timeout));
    this.typingTimeouts.clear();
  }
}

// Presence management for online/offline status
export class PresenceManager {
  private presenceChannel: any = null;
  private userId: string;
  private userRole: string;

  constructor(userId: string, userRole: string) {
    this.userId = userId;
    this.userRole = userRole;
  }

  connect(): void {
    if (this.presenceChannel) {
      return; // Already connected
    }

    this.presenceChannel = pusherClient.subscribe(`presence-users`);

    this.presenceChannel.bind('pusher:subscription_succeeded', (members: any) => {
      console.log('Connected to presence channel');
      this.handlePresenceUpdate(members);
    });

    this.presenceChannel.bind('pusher:member_added', (member: any) => {
      console.log('Member added:', member);
      this.handleMemberAdded(member);
    });

    this.presenceChannel.bind('pusher:member_removed', (member: any) => {
      console.log('Member removed:', member);
      this.handleMemberRemoved(member);
    });
  }

  disconnect(): void {
    if (this.presenceChannel) {
      pusherClient.unsubscribe('presence-users');
      this.presenceChannel = null;
    }
  }

  private handlePresenceUpdate(members: any): void {
    // Handle initial presence data
    const onlineMembers = Object.values(members.members);
    console.log('Online members:', onlineMembers);
  }

  private handleMemberAdded(member: any): void {
    // Handle when someone comes online
    if (member.info.role === 'mentor') {
      // Notify students about mentor coming online
      // This would be handled server-side in a real implementation
    }
  }

  private handleMemberRemoved(member: any): void {
    // Handle when someone goes offline
    if (member.info.role === 'mentor') {
      // Notify students about mentor going offline
      // This would be handled server-side in a real implementation
    }
  }
}

// Auto-save functionality using real-time events
export class AutoSaveManager {
  private saveTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private readonly SAVE_DELAY = 2000; // 2 seconds

  scheduleAutoSave(
    storyId: string,
    content: string,
    onSave: (content: string) => Promise<void>
  ): void {
    // Clear existing timeout
    if (this.saveTimeouts.has(storyId)) {
      clearTimeout(this.saveTimeouts.get(storyId)!);
    }

    // Schedule new save
    const timeout = setTimeout(async () => {
      try {
        await onSave(content);
        console.log('Auto-saved story:', storyId);
        
        // Notify about the update
        await notifyStoryUpdate(storyId, 'current-user-id', 'content');
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        this.saveTimeouts.delete(storyId);
      }
    }, this.SAVE_DELAY);

    this.saveTimeouts.set(storyId, timeout);
  }

  cancelAutoSave(storyId: string): void {
    if (this.saveTimeouts.has(storyId)) {
      clearTimeout(this.saveTimeouts.get(storyId)!);
      this.saveTimeouts.delete(storyId);
    }
  }

  cleanup(): void {
    this.saveTimeouts.forEach(timeout => clearTimeout(timeout));
    this.saveTimeouts.clear();
  }
}

// Connection manager to handle reconnections and state
export class ConnectionManager {
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor() {
    this.setupConnectionHandlers();
  }

  private setupConnectionHandlers(): void {
    pusherClient.connection.bind('connected', () => {
      console.log('Pusher connected');
      this.reconnectAttempts = 0;
    });

    pusherClient.connection.bind('disconnected', () => {
      console.log('Pusher disconnected');
    });

    pusherClient.connection.bind('failed', () => {
      console.log('Pusher connection failed');
      this.handleReconnect();
    });

    pusherClient.connection.bind('unavailable', () => {
      console.log('Pusher unavailable');
      this.handleReconnect();
    });
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * this.reconnectAttempts;
      
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
      
      setTimeout(() => {
        pusherClient.connect();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  getConnectionState(): string {
    return pusherClient.connection.state;
  }

  isConnected(): boolean {
    return pusherClient.connection.state === 'connected';
  }
}

// Export singleton instances
export const realTimeService = RealTimeService.getInstance();
export const typingManager = new TypingIndicatorManager();
export const autoSaveManager = new AutoSaveManager();
export const connectionManager = new ConnectionManager();

// Utility function to initialize client-side real-time features
export function initializeRealTime(userId: string, userRole: string) {
  const clientService = new ClientRealTimeService();
  const presenceManager = new PresenceManager(userId, userRole);

  // Connect to presence
  presenceManager.connect();

  // Subscribe to user-specific events
  clientService.subscribeToUser(userId, {
    onNotification: (data) => {
      console.log('Received notification:', data);
      // Handle notification display
    },
    onAchievement: (data) => {
      console.log('Achievement unlocked:', data);
      // Show achievement popup
    },
    onMentorStatus: (data) => {
      console.log('Mentor status update:', data);
      // Update UI to show mentor online/offline
    },
  });

  // Cleanup function
  return () => {
    presenceManager.disconnect();
    clientService.unsubscribeAll();
    typingManager.cleanup();
    autoSaveManager.cleanup();
  };
}

// Server-side authentication for Pusher channels
export async function authenticatePusherUser(
  socketId: string,
  channel: string,
  userId: string,
  userRole: string
): Promise<any> {
  const realTimeService = RealTimeService.getInstance();
  return await realTimeService.authenticateUser(socketId, channel, userId);
}

// Batch operations for efficiency
export async function sendBulkNotifications(
  notifications: Array<{
    userId: string;
    type: string;
    title: string;
    message: string;
    actionUrl?: string;
  }>
): Promise<void> {
  const realTimeService = RealTimeService.getInstance();
  
  // Group by notification content to optimize API calls
  const groupedNotifications = new Map<string, string[]>();
  
  notifications.forEach(notification => {
    const key = `${notification.type}-${notification.title}-${notification.message}`;
    if (!groupedNotifications.has(key)) {
      groupedNotifications.set(key, []);
    }
    groupedNotifications.get(key)!.push(notification.userId);
  });

  // Send bulk notifications for each group
  const promises = Array.from(groupedNotifications.entries()).map(([key, userIds]) => {
    const [type, title, message] = key.split('-');
    const actionUrl = notifications.find(n => n.userId === userIds[0])?.actionUrl;
    
    return realTimeService.bulkNotify(userIds, {
      type,
      title,
      message,
      actionUrl,
    });
  });

  await Promise.all(promises);
}