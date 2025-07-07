// types/next-auth.d.ts - NextAuth Type Extensions
import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'student' | 'parent' | 'mentor' | 'teacher' | 'admin';
      age?: number;
      parentId?: string;
      subscription?: {
        plan: 'free' | 'premium' | 'family';
        status: 'active' | 'inactive' | 'cancelled';
        expiresAt?: Date;
      };
      preferences?: {
        theme: 'light' | 'dark' | 'auto';
        notifications: boolean;
        emailUpdates: boolean;
      };
      gamification?: {
        level: number;
        xp: number;
        streak: number;
        achievements: string[];
      };
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    role: 'student' | 'parent' | 'mentor' | 'teacher' | 'admin';
    age?: number;
    parentId?: string;
    subscription?: {
      plan: 'free' | 'premium' | 'family';
      status: 'active' | 'inactive' | 'cancelled';
      expiresAt?: Date;
    };
    preferences?: {
      theme: 'light' | 'dark' | 'auto';
      notifications: boolean;
      emailUpdates: boolean;
    };
    gamification?: {
      level: number;
      xp: number;
      streak: number;
      achievements: string[];
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    role: 'student' | 'parent' | 'mentor' | 'teacher' | 'admin';
    age?: number;
    parentId?: string;
    subscription?: {
      plan: 'free' | 'premium' | 'family';
      status: 'active' | 'inactive' | 'cancelled';
      expiresAt?: Date;
    };
  }
}
