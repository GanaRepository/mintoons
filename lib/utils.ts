// lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { TIME_CONSTANTS } from '@/utils/constants';

// Utility function for merging Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// String utilities
export const capitalizeFirst = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const capitalizeWords = (str: string): string => {
  if (!str) return '';
  return str.split(' ').map(capitalizeFirst).join(' ');
};

export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const truncate = (str: string, length: number): string => {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
};

// Date utilities
export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatDateTime = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatRelativeTime = (date: Date | string): string => {
  const now = new Date();
  const past = new Date(date);
  const diffInMs = now.getTime() - past.getTime();

  if (diffInMs < TIME_CONSTANTS.MINUTE) {
    return 'just now';
  } else if (diffInMs < TIME_CONSTANTS.HOUR) {
    const minutes = Math.floor(diffInMs / TIME_CONSTANTS.MINUTE);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInMs < TIME_CONSTANTS.DAY) {
    const hours = Math.floor(diffInMs / TIME_CONSTANTS.HOUR);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInMs < TIME_CONSTANTS.WEEK) {
    const days = Math.floor(diffInMs / TIME_CONSTANTS.DAY);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return formatDate(date);
  }
};

export const isToday = (date: Date | string): boolean => {
  const today = new Date();
  const checkDate = new Date(date);
  return today.toDateString() === checkDate.toDateString();
};

export const isThisWeek = (date: Date | string): boolean => {
  const now = new Date();
  const checkDate = new Date(date);
  const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
  weekStart.setHours(0, 0, 0, 0);
  return checkDate >= weekStart;
};

// Number utilities
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

export const formatPercentage = (value: number, decimals = 1): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

// Array utilities
export const uniqueBy = <T>(array: T[], key: keyof T): T[] => {
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
};

export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const group = String(item[key]);
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

export const shuffle = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

// Object utilities
export const pick = <T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
};

export const omit = <T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach(key => {
    delete result[key];
  });
  return result;
};

export const isEmpty = (value: any): boolean => {
  if (value == null) return true;
  if (Array.isArray(value) || typeof value === 'string') return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

// Validation utilities
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isStrongPassword = (password: string): boolean => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
};

// Random utilities
export const generateId = (length = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const generateSlug = (title: string): string => {
  const slug = slugify(title);
  const randomSuffix = generateId(4);
  return `${slug}-${randomSuffix}`;
};

// File utilities
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

export const isImageFile = (filename: string): boolean => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  const extension = getFileExtension(filename).toLowerCase();
  return imageExtensions.includes(extension);
};

// Color utilities
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

export const generateRandomColor = (): string => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Local storage utilities
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Silently fail
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Silently fail
    }
  }
};

// Debounce utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T => {
  let timeout: NodeJS.Timeout;
  return ((...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  }) as T;
};

// Throttle utility
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T => {
  let inThrottle: boolean;
  return ((...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  }) as T;
};

// Age group utilities
export const getAgeGroup = (age: number): string => {
  if (age < 13) return 'under-13';
  if (age <= 17) return '13-17';
  return '18-plus';
};

export const requiresParentalConsent = (age: number): boolean => {
  return age < 13;
};

// Story utilities
export const countWords = (text: string): number => {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

export const estimateReadingTime = (text: string, wordsPerMinute = 200): number => {
  const wordCount = countWords(text);
  return Math.ceil(wordCount / wordsPerMinute);
};

export const getReadingLevel = (wordCount: number, age: number): string => {
  const avgWordsPerAge = {
    2: 50, 3: 75, 4: 100, 5: 150, 6: 200,
    7: 250, 8: 300, 9: 400, 10: 500,
    11: 600, 12: 700, 13: 800, 14: 900,
    15: 1000, 16: 1100, 17: 1200, 18: 1500
  };
  
  const expectedWords = avgWordsPerAge[age as keyof typeof avgWordsPerAge] || 1500;
  
  if (wordCount < expectedWords * 0.5) return 'Below Level';
  if (wordCount < expectedWords * 0.8) return 'Approaching Level';
  if (wordCount <= expectedWords * 1.2) return 'At Level';
  return 'Above Level';
};

// Error handling utilities
export const safeJsonParse = <T>(json: string, fallback: T): T => {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
};

export const createErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
};

// Export all utilities
export default {
  cn,
  capitalizeFirst,
  capitalizeWords,
  slugify,
  truncate,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  isToday,
  isThisWeek,
  formatNumber,
  formatCurrency,
  formatPercentage,
  clamp,
  uniqueBy,
  groupBy,
  shuffle,
  chunk,
  pick,
  omit,
  isEmpty,
  isValidEmail,
  isValidURL,
  isStrongPassword,
  generateId,
  generateSlug,
  formatFileSize,
  getFileExtension,
  isImageFile,
  hexToRgb,
  generateRandomColor,
  safeLocalStorage,
  debounce,
  throttle,
  getAgeGroup,
  requiresParentalConsent,
  countWords,
  estimateReadingTime,
  getReadingLevel,
  safeJsonParse,
  createErrorMessage
};