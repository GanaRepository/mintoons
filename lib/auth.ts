import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';
import { authOptions } from '@/utils/authOptions';
import { UserRole } from '@/types/auth';
import User from '@/models/User';
import { connectToDatabase } from '@/utils/db';

// Server-side authentication utilities
export async function getSession() {
  return await getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user || null;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) {
    throw new Error('Authentication required');
  }
  return session.user;
}

export async function requireRole(requiredRole: UserRole) {
  const user = await requireAuth();
  if (user.role !== requiredRole) {
    throw new Error(`Role '${requiredRole}' required`);
  }
  return user;
}

export async function requireAdmin() {
  return await requireRole('admin');
}

export async function requireMentor() {
  const user = await requireAuth();
  if (user.role !== 'mentor' && user.role !== 'admin') {
    throw new Error('Mentor or admin role required');
  }
  return user;
}

// API route authentication helpers
export async function requireAuthApi() {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return {
        error: 'Authentication required',
        status: 401 as const
      };
    }

    return {
      user: session.user
    };
  } catch (error) {
    return {
      error: 'Authentication failed',
      status: 500 as const
    };
  }
}

export async function requireRoleApi(requiredRole: UserRole) {
  const authResult = await requireAuthApi();
  
  if ('error' in authResult) {
    return authResult;
  }

  if (authResult.user.role !== requiredRole) {
    return {
      error: `Role '${requiredRole}' required`,
      status: 403 as const
    };
  }

  return authResult;
}

export async function requireAdminApi() {
  return await requireRoleApi('admin');
}

export async function requireMentorApi() {
  const authResult = await requireAuthApi();
  
  if ('error' in authResult) {
    return authResult;
  }

  if (authResult.user.role !== 'mentor' && authResult.user.role !== 'admin') {
    return {
      error: 'Mentor or admin role required',
      status: 403 as const
    };
  }

  return authResult;
}

// User validation and verification
export async function validateUserAccess(userId: string) {
  const currentUser = await requireAuth();
  
  // Admin can access any user
  if (currentUser.role === 'admin') {
    return true;
  }
  
  // Users can only access their own data
  if (currentUser.id === userId) {
    return true;
  }
  
  // Mentors can access their assigned students
  if (currentUser.role === 'mentor') {
    await connectToDatabase();
    const user = await User.findById(userId);
    return user && user.mentorId?.toString() === currentUser.id;
  }
  
  return false;
}

export async function validateStoryAccess(storyOwnerId: string) {
  const currentUser = await requireAuth();
  
  // Admin can access any story
  if (currentUser.role === 'admin') {
    return true;
  }
  
  // Users can access their own stories
  if (currentUser.id === storyOwnerId) {
    return true;
  }
  
  // Mentors can access their students' stories
  if (currentUser.role === 'mentor') {
    await connectToDatabase();
    const storyOwner = await User.findById(storyOwnerId);
    return storyOwner && storyOwner.mentorId?.toString() === currentUser.id;
  }
  
  return false;
}

// Permission checking utilities
export function hasPermission(userRole: UserRole, action: string): boolean {
  const permissions = {
    admin: [
      'read_all_users',
      'write_all_users',
      'delete_all_users',
      'read_all_stories',
      'write_all_stories',
      'delete_all_stories',
      'manage_mentors',
      'manage_subscriptions',
      'access_analytics',
      'moderate_content'
    ],
    mentor: [
      'read_assigned_students',
      'read_student_stories',
      'write_comments',
      'view_student_progress'
    ],
    user: [
      'read_own_profile',
      'write_own_profile',
      'create_stories',
      'read_own_stories',
      'delete_own_stories'
    ]
  };

  return permissions[userRole]?.includes(action) || false;
}

export function canAccessUserData(currentUserRole: UserRole, targetUserId: string, currentUserId: string): boolean {
  // Admin can access all user data
  if (currentUserRole === 'admin') {
    return true;
  }
  
  // Users can only access their own data
  return currentUserId === targetUserId;
}

export function canAccessStoryData(currentUserRole: UserRole, currentUserId: string, storyOwnerId: string): boolean {
  // Admin can access all stories
  if (currentUserRole === 'admin') {
    return true;
  }
  
  // Users can access their own stories
  return currentUserId === storyOwnerId;
}

// Rate limiting helpers
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

export function checkRateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  const current = rateLimitMap.get(identifier) || { count: 0, lastReset: now };
  
  // Reset if window has passed
  if (current.lastReset < windowStart) {
    current.count = 0;
    current.lastReset = now;
  }
  
  current.count++;
  rateLimitMap.set(identifier, current);
  
  const allowed = current.count <= limit;
  const remaining = Math.max(0, limit - current.count);
  
  return { allowed, remaining };
}

// Session utilities
export async function invalidateUserSessions(userId: string) {
  // In a production environment, you might want to maintain
  // a blacklist of tokens or user sessions in Redis/Database
  console.log(`Invalidating sessions for user: ${userId}`);
  // Implementation depends on your session storage strategy
}

export async function refreshUserSession(userId: string) {
  await connectToDatabase();
  const user = await User.findById(userId).select('-password');
  return user;
}

// Security helpers
export function sanitizeUserData(user: any) {
  const { password, ...sanitized } = user;
  return sanitized;
}

export function generateSecureToken(length = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Age verification utilities
export function calculateAge(birthDate: Date): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

export function requireParentalConsent(age: number): boolean {
  // COPPA compliance: require parental consent for children under 13
  return age < 13;
}

export function getAgeGroup(age: number): string {
  if (age >= 2 && age <= 5) return 'early-childhood';
  if (age >= 6 && age <= 8) return 'elementary-early';
  if (age >= 9 && age <= 12) return 'elementary-late';
  if (age >= 13 && age <= 15) return 'middle-school';
  if (age >= 16 && age <= 18) return 'high-school';
  return 'unknown';
}

// Input validation
export function validateAuthInput(input: any) {
  const errors: string[] = [];
  
  if (!input.email || typeof input.email !== 'string') {
    errors.push('Valid email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    errors.push('Invalid email format');
  }
  
  if (!input.password || typeof input.password !== 'string') {
    errors.push('Password is required');
  } else if (input.password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Auth middleware helper
export async function withAuth<T>(
  handler: (user: any) => Promise<T>,
  options: {
    requireRole?: UserRole;
    allowRoles?: UserRole[];
  } = {}
) {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      throw new Error('Authentication required');
    }
    
    const { requireRole, allowRoles } = options;
    
    if (requireRole && session.user.role !== requireRole) {
      throw new Error(`Role '${requireRole}' required`);
    }
    
    if (allowRoles && !allowRoles.includes(session.user.role)) {
      throw new Error(`One of roles [${allowRoles.join(', ')}] required`);
    }
    
    return await handler(session.user);
  } catch (error) {
    throw error;
  }
}