// utils/validation.ts
import { z } from 'zod';
import { USER_ROLES, STORY_ELEMENTS, AGE_GROUPS } from './constants';

// User validation schemas
export const userRegistrationSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  
  email: z.string()
    .email('Please enter a valid email address')
    .toLowerCase(),
  
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  confirmPassword: z.string(),
  
  age: z.number()
    .min(2, 'Age must be at least 2')
    .max(18, 'This platform is for children aged 2-18'),
  
  role: z.enum([USER_ROLES.CHILD, USER_ROLES.MENTOR, USER_ROLES.ADMIN]),
  
  ageGroup: z.enum([AGE_GROUPS.UNDER_13, AGE_GROUPS.TEEN_13_17, AGE_GROUPS.ADULT_18_PLUS]),
  
  // COPPA compliance fields
  parentEmail: z.string().email().optional(),
  parentConsent: z.boolean().optional(),
  
  // Terms acceptance
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions'
  }),
  
  agreeToPrivacy: z.boolean().refine(val => val === true, {
    message: 'You must agree to the privacy policy'
  })
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
}).refine(data => {
  // COPPA compliance: require parent email for under 13
  if (data.ageGroup === AGE_GROUPS.UNDER_13) {
    return data.parentEmail && data.parentConsent;
  }
  return true;
}, {
  message: "Parent email and consent required for children under 13",
  path: ["parentEmail"]
});

// Login validation
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required')
});

// Password reset validation
export const passwordResetSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase()
});

export const passwordUpdateSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// Story validation schemas
export const storyElementsSchema = z.object({
  genre: z.enum(STORY_ELEMENTS.GENRES as [string, ...string[]]),
  setting: z.enum(STORY_ELEMENTS.SETTINGS as [string, ...string[]]),
  character: z.enum(STORY_ELEMENTS.CHARACTERS as [string, ...string[]]),
  mood: z.enum(STORY_ELEMENTS.MOODS as [string, ...string[]]),
  conflict: z.enum(STORY_ELEMENTS.CONFLICTS as [string, ...string[]]),
  theme: z.enum(STORY_ELEMENTS.THEMES as [string, ...string[]])
});

export const storyCreationSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters')
    .trim(),
  
  elements: storyElementsSchema,
  
  content: z.string()
    .min(50, 'Story must be at least 50 words')
    .max(2000, 'Story must be less than 2000 words')
    .trim(),
  
  tags: z.array(z.string()).optional(),
  
  isPublic: z.boolean().default(false)
});

export const storyUpdateSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters')
    .trim()
    .optional(),
  
  content: z.string()
    .min(50, 'Story must be at least 50 words')
    .max(2000, 'Story must be less than 2000 words')
    .trim()
    .optional(),
  
  tags: z.array(z.string()).optional(),
  
  isPublic: z.boolean().optional(),
  
  status: z.enum(['draft', 'published', 'archived']).optional()
});

// Comment validation
export const commentSchema = z.object({
  content: z.string()
    .min(1, 'Comment cannot be empty')
    .max(500, 'Comment must be less than 500 characters')
    .trim(),
  
  storyId: z.string().min(1, 'Story ID is required'),
  
  commentType: z.enum(['grammar', 'creativity', 'suggestion', 'praise', 'improvement']),
  
  highlightedText: z.string().optional(),
  
  position: z.object({
    start: z.number(),
    end: z.number()
  }).optional()
});

// Contact form validation
export const contactSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  
  email: z.string().email('Please enter a valid email address'),
  
  role: z.enum(['parent', 'teacher', 'student', 'other']),
  
  subject: z.string()
    .min(5, 'Subject must be at least 5 characters')
    .max(100, 'Subject must be less than 100 characters'),
  
  message: z.string()
    .min(20, 'Message must be at least 20 characters')
    .max(1000, 'Message must be less than 1000 characters')
});

// Profile update validation
export const profileUpdateSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .optional(),
  
  age: z.number()
    .min(2, 'Age must be at least 2')
    .max(18, 'This platform is for children aged 2-18')
    .optional(),
  
  bio: z.string()
    .max(200, 'Bio must be less than 200 characters')
    .optional(),
  
  preferences: z.object({
    favoriteGenres: z.array(z.enum(STORY_ELEMENTS.GENRES as [string, ...string[]])).optional(),
    writingGoals: z.array(z.string()).optional(),
    emailNotifications: z.boolean().optional(),
    publicProfile: z.boolean().optional()
  }).optional()
});

// File upload validation
export const fileUploadSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  contentType: z.string().min(1, 'Content type is required'),
  size: z.number()
    .min(1, 'File cannot be empty')
    .max(10 * 1024 * 1024, 'File must be less than 10MB')
});

// AI collaboration validation
export const aiCollaborationSchema = z.object({
  storyId: z.string().min(1, 'Story ID is required'),
  
  userInput: z.string()
    .min(10, 'Input must be at least 10 characters')
    .max(500, 'Input must be less than 500 characters')
    .trim(),
  
  requestType: z.enum(['continue', 'suggest', 'improve', 'complete']),
  
  context: z.object({
    currentWordCount: z.number(),
    targetWordCount: z.number(),
    storyElements: storyElementsSchema
  }).optional()
});

// Search and filter validation
export const searchSchema = z.object({
  query: z.string().max(100, 'Search query must be less than 100 characters').optional(),
  genre: z.enum(STORY_ELEMENTS.GENRES as [string, ...string[]]).optional(),
  setting: z.enum(STORY_ELEMENTS.SETTINGS as [string, ...string[]]).optional(),
  character: z.enum(STORY_ELEMENTS.CHARACTERS as [string, ...string[]]).optional(),
  mood: z.enum(STORY_ELEMENTS.MOODS as [string, ...string[]]).optional(),
  sortBy: z.enum(['newest', 'oldest', 'popular', 'title']).default('newest'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(10)
});

// Subscription validation
export const subscriptionSchema = z.object({
  tier: z.enum(['free', 'basic', 'premium', 'pro']),
  paymentMethodId: z.string().optional(),
  billingInterval: z.enum(['month', 'year']).default('month')
});

// Admin validation schemas
export const userManagementSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  action: z.enum(['activate', 'deactivate', 'delete', 'changeRole']),
  newRole: z.enum([USER_ROLES.CHILD, USER_ROLES.MENTOR, USER_ROLES.ADMIN]).optional(),
  reason: z.string().max(200, 'Reason must be less than 200 characters').optional()
});

export const contentModerationSchema = z.object({
  contentId: z.string().min(1, 'Content ID is required'),
  contentType: z.enum(['story', 'comment', 'profile']),
  action: z.enum(['approve', 'reject', 'flag', 'delete']),
  reason: z.string().max(200, 'Reason must be less than 200 characters').optional(),
  moderatorNotes: z.string().max(500, 'Notes must be less than 500 characters').optional()
});

// Export all schemas
export const schemas = {
  userRegistration: userRegistrationSchema,
  login: loginSchema,
  passwordReset: passwordResetSchema,
  passwordUpdate: passwordUpdateSchema,
  storyElements: storyElementsSchema,
  storyCreation: storyCreationSchema,
  storyUpdate: storyUpdateSchema,
  comment: commentSchema,
  contact: contactSchema,
  profileUpdate: profileUpdateSchema,
  fileUpload: fileUploadSchema,
  aiCollaboration: aiCollaborationSchema,
  search: searchSchema,
  subscription: subscriptionSchema,
  userManagement: userManagementSchema,
  contentModeration: contentModerationSchema
};

export default schemas;