import { z } from 'zod';
import { UserRole, StoryStatus, CommentType, SubscriptionTier } from '@/types';

// User validation schemas
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  email: z
    .string()
    .email('Invalid email address')
    .toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  age: z
    .number()
    .int('Age must be a whole number')
    .min(2, 'Age must be at least 2')
    .max(18, 'Age must be 18 or younger'),
  parentEmail: z
    .string()
    .email('Invalid parent email address')
    .toLowerCase()
    .optional(),
  agreedToTerms: z
    .boolean()
    .refine((val) => val === true, 'You must agree to the terms of service'),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .toLowerCase(),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .toLowerCase(),
});

export const resetPasswordSchema = z.object({
  token: z
    .string()
    .min(1, 'Reset token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: z
    .string()
    .min(1, 'Password confirmation is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
    .optional(),
  age: z
    .number()
    .int('Age must be a whole number')
    .min(2, 'Age must be at least 2')
    .max(18, 'Age must be 18 or younger')
    .optional(),
  bio: z
    .string()
    .max(500, 'Bio must be less than 500 characters')
    .optional(),
  favoriteGenres: z
    .array(z.string())
    .max(5, 'You can select up to 5 favorite genres')
    .optional(),
});

// Story validation schemas
export const storyElementsSchema = z.object({
  genre: z.enum([
    'Adventure',
    'Fantasy',
    'Mystery',
    'Sci-Fi',
    'Comedy',
    'Drama',
    'Historical',
    'Animal Stories',
    'Fairy Tale'
  ]),
  setting: z.enum([
    'Forest',
    'Castle',
    'Ocean',
    'Space',
    'City',
    'Village',
    'Mountains',
    'Desert',
    'Cave'
  ]),
  character: z.enum([
    'Explorer',
    'Animal',
    'Wizard',
    'Robot',
    'Dragon',
    'Princess/Prince',
    'Detective',
    'Superhero',
    'Kid'
  ]),
  mood: z.enum([
    'Exciting',
    'Funny',
    'Mysterious',
    'Scary',
    'Peaceful',
    'Adventurous'
  ]),
  conflict: z.enum([
    'Lost Treasure',
    'Rescue Mission',
    'Mystery to Solve',
    'Evil to Defeat',
    'Competition',
    'Discovery'
  ]),
  theme: z.enum([
    'Friendship',
    'Courage',
    'Kindness',
    'Adventure',
    'Family',
    'Discovery'
  ]),
});

export const createStorySchema = z.object({
  title: z
    .string()
    .min(1, 'Story title is required')
    .max(100, 'Title must be less than 100 characters'),
  elements: storyElementsSchema,
});

export const updateStorySchema = z.object({
  title: z
    .string()
    .min(1, 'Story title is required')
    .max(100, 'Title must be less than 100 characters')
    .optional(),
  content: z
    .string()
    .min(50, 'Story content must be at least 50 characters')
    .max(2000, 'Story content must be less than 2000 characters')
    .optional(),
  status: z
    .enum(['draft', 'published', 'reviewed'] as const)
    .optional(),
});

export const storyContentSchema = z.object({
  content: z
    .string()
    .min(10, 'Content must be at least 10 characters')
    .max(500, 'Content must be less than 500 characters per section'),
});

// Comment validation schemas
export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(1000, 'Comment must be less than 1000 characters'),
  type: z.enum(['grammar', 'creativity', 'suggestion', 'praise', 'improvement'] as const),
  highlightedText: z
    .string()
    .max(200, 'Highlighted text must be less than 200 characters')
    .optional(),
  position: z
    .object({
      start: z.number().min(0),
      end: z.number().min(0),
    })
    .optional(),
});

export const updateCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(1000, 'Comment must be less than 1000 characters')
    .optional(),
  isResolved: z
    .boolean()
    .optional(),
});

// AI validation schemas
export const aiGenerateSchema = z.object({
  elements: storyElementsSchema,
  userAge: z
    .number()
    .int()
    .min(2)
    .max(18),
  previousContent: z
    .string()
    .max(2000)
    .optional(),
});

export const aiAssessSchema = z.object({
  content: z
    .string()
    .min(50, 'Story must be at least 50 characters for assessment')
    .max(2000, 'Story too long for assessment'),
  userAge: z
    .number()
    .int()
    .min(2)
    .max(18),
  elements: storyElementsSchema,
});

// Subscription validation schemas
export const createSubscriptionSchema = z.object({
  tier: z.enum(['basic', 'premium', 'pro'] as const),
  paymentMethodId: z
    .string()
    .min(1, 'Payment method is required'),
});

export const updateSubscriptionSchema = z.object({
  tier: z.enum(['basic', 'premium', 'pro'] as const),
});

// Admin validation schemas
export const createMentorSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  email: z
    .string()
    .email('Invalid email address')
    .toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  qualification: z
    .string()
    .min(10, 'Qualification must be at least 10 characters')
    .max(500, 'Qualification must be less than 500 characters'),
  experience: z
    .number()
    .int()
    .min(0, 'Experience cannot be negative')
    .max(50, 'Experience must be less than 50 years'),
});

export const assignStudentSchema = z.object({
  mentorId: z
    .string()
    .min(1, 'Mentor ID is required'),
  studentIds: z
    .array(z.string().min(1))
    .min(1, 'At least one student must be selected')
    .max(20, 'Cannot assign more than 20 students at once'),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(['user', 'mentor', 'admin'] as const),
  isActive: z
    .boolean()
    .optional(),
});

// File validation schemas
export const fileUploadSchema = z.object({
  filename: z
    .string()
    .min(1, 'Filename is required')
    .max(255, 'Filename must be less than 255 characters')
    .regex(/^[^<>:"/\\|?*]+$/, 'Filename contains invalid characters'),
  contentType: z
    .string()
    .regex(/^[a-zA-Z]+\/[a-zA-Z0-9\-\+\.]+$/, 'Invalid content type'),
  size: z
    .number()
    .int()
    .min(1, 'File cannot be empty')
    .max(10 * 1024 * 1024, 'File size cannot exceed 10MB'), // 10MB limit
});

export const imageUploadSchema = fileUploadSchema.extend({
  contentType: z
    .string()
    .regex(/^image\/(jpeg|jpg|png|gif|webp)$/, 'Only JPEG, PNG, GIF, and WebP images are allowed'),
  size: z
    .number()
    .int()
    .min(1)
    .max(5 * 1024 * 1024), // 5MB limit for images
});

// Contact form validation
export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  email: z
    .string()
    .email('Invalid email address')
    .toLowerCase(),
  subject: z
    .string()
    .min(5, 'Subject must be at least 5 characters')
    .max(100, 'Subject must be less than 100 characters'),
  message: z
    .string()
    .min(20, 'Message must be at least 20 characters')
    .max(1000, 'Message must be less than 1000 characters'),
  type: z
    .enum(['general', 'support', 'bug', 'feature', 'billing'] as const)
    .default('general'),
});

// Search and filter validation
export const searchStoriesSchema = z.object({
  query: z
    .string()
    .max(100, 'Search query must be less than 100 characters')
    .optional(),
  genre: z
    .string()
    .optional(),
  status: z
    .enum(['draft', 'published', 'reviewed'] as const)
    .optional(),
  authorId: z
    .string()
    .optional(),
  limit: z
    .number()
    .int()
    .min(1)
    .max(50)
    .default(20),
  offset: z
    .number()
    .int()
    .min(0)
    .default(0),
  sortBy: z
    .enum(['createdAt', 'updatedAt', 'title'] as const)
    .default('createdAt'),
  sortOrder: z
    .enum(['asc', 'desc'] as const)
    .default('desc'),
});

export const searchUsersSchema = z.object({
  query: z
    .string()
    .max(100, 'Search query must be less than 100 characters')
    .optional(),
  role: z
    .enum(['user', 'mentor', 'admin'] as const)
    .optional(),
  isActive: z
    .boolean()
    .optional(),
  ageGroup: z
    .enum(['early-childhood', 'elementary-early', 'elementary-late', 'middle-school', 'high-school'] as const)
    .optional(),
  limit: z
    .number()
    .int()
    .min(1)
    .max(50)
    .default(20),
  offset: z
    .number()
    .int()
    .min(0)
    .default(0),
  sortBy: z
    .enum(['name', 'email', 'createdAt', 'lastLoginAt'] as const)
    .default('createdAt'),
  sortOrder: z
    .enum(['asc', 'desc'] as const)
    .default('desc'),
});

// Analytics validation
export const analyticsDateRangeSchema = z.object({
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format'),
  granularity: z
    .enum(['day', 'week', 'month'] as const)
    .default('day'),
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return start <= end;
}, {
  message: 'Start date must be before or equal to end date',
  path: ['endDate'],
});

// Notification validation
export const createNotificationSchema = z.object({
  userId: z
    .string()
    .min(1, 'User ID is required'),
  type: z
    .enum(['story_completed', 'mentor_comment', 'achievement_unlocked', 'subscription_updated'] as const),
  title: z
    .string()
    .min(1, 'Notification title is required')
    .max(100, 'Title must be less than 100 characters'),
  message: z
    .string()
    .min(1, 'Notification message is required')
    .max(500, 'Message must be less than 500 characters'),
  actionUrl: z
    .string()
    .url('Invalid action URL')
    .optional(),
  priority: z
    .enum(['low', 'medium', 'high'] as const)
    .default('medium'),
});

// Batch operations validation
export const batchUpdateSchema = z.object({
  ids: z
    .array(z.string().min(1))
    .min(1, 'At least one ID must be provided')
    .max(100, 'Cannot update more than 100 items at once'),
  updates: z
    .record(z.any())
    .refine((data) => Object.keys(data).length > 0, 'At least one update field must be provided'),
});

// Export validation
export const exportRequestSchema = z.object({
  format: z
    .enum(['pdf', 'docx'] as const),
  storyIds: z
    .array(z.string().min(1))
    .min(1, 'At least one story must be selected')
    .max(10, 'Cannot export more than 10 stories at once'),
  includeComments: z
    .boolean()
    .default(false),
  includeAssessments: z
    .boolean()
    .default(false),
});

// Rate limiting validation
export const rateLimitSchema = z.object({
  action: z
    .string()
    .min(1, 'Action is required'),
  identifier: z
    .string()
    .min(1, 'Identifier is required'),
});

// Custom validation helpers
export function validateAge(age: number): boolean {
  return age >= 2 && age <= 18;
}

export function validateStoryLength(content: string, userAge: number): boolean {
  const wordCount = content.split(/\s+/).length;
  
  // Age-appropriate word count limits
  if (userAge >= 2 && userAge <= 5) return wordCount <= 100;
  if (userAge >= 6 && userAge <= 8) return wordCount <= 200;
  if (userAge >= 9 && userAge <= 12) return wordCount <= 400;
  if (userAge >= 13 && userAge <= 15) return wordCount <= 600;
  if (userAge >= 16 && userAge <= 18) return wordCount <= 800;
  
  return false;
}

export function validateContentAppropriate(content: string): boolean {
  // Basic inappropriate content detection
  const inappropriateWords = [
    // Add inappropriate words list (simplified for example)
    'violence', 'hate', 'inappropriate'
  ];
  
  const lowerContent = content.toLowerCase();
  return !inappropriateWords.some(word => lowerContent.includes(word));
}

export function validateImageDimensions(width: number, height: number): boolean {
  // Maximum dimensions for uploaded images
  const maxWidth = 2048;
  const maxHeight = 2048;
  const minWidth = 100;
  const minHeight = 100;
  
  return width >= minWidth && 
         width <= maxWidth && 
         height >= minHeight && 
         height <= maxHeight;
}

// Validation error formatter
export function formatValidationErrors(error: z.ZodError): Record<string, string> {
  const formatted: Record<string, string> = {};
  
  error.errors.forEach((err) => {
    const path = err.path.join('.');
    formatted[path] = err.message;
  });
  
  return formatted;
}

// Schema type exports
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type StoryElementsInput = z.infer<typeof storyElementsSchema>;
export type CreateStoryInput = z.infer<typeof createStorySchema>;
export type UpdateStoryInput = z.infer<typeof updateStorySchema>;
export type StoryContentInput = z.infer<typeof storyContentSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
export type AIGenerateInput = z.infer<typeof aiGenerateSchema>;
export type AIAssessInput = z.infer<typeof aiAssessSchema>;
export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>;
export type CreateMentorInput = z.infer<typeof createMentorSchema>;
export type AssignStudentInput = z.infer<typeof assignStudentSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type ContactFormInput = z.infer<typeof contactFormSchema>;
export type SearchStoriesInput = z.infer<typeof searchStoriesSchema>;
export type SearchUsersInput = z.infer<typeof searchUsersSchema>;
export type AnalyticsDateRangeInput = z.infer<typeof analyticsDateRangeSchema>;
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type ExportRequestInput = z.infer<typeof exportRequestSchema>;