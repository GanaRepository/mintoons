// utils/constants.ts
export const APP_CONFIG = {
    name: 'Mintoons',
    description: 'AI-Powered Story Writing Platform for Children',
    version: '1.0.0',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    supportEmail: 'support@mintoons.com',
    contactEmail: 'hello@mintoons.com'
  };
  
  // User roles
  export const USER_ROLES = {
    CHILD: 'child',
    MENTOR: 'mentor', 
    ADMIN: 'admin'
  } as const;
  
  // Story elements
  export const STORY_ELEMENTS = {
    GENRES: [
      'adventure',
      'fantasy', 
      'mystery',
      'sci-fi',
      'comedy',
      'drama',
      'historical',
      'animal-stories',
      'fairy-tale'
    ],
    SETTINGS: [
      'forest',
      'castle', 
      'ocean',
      'space',
      'city',
      'village',
      'mountains',
      'desert',
      'cave'
    ],
    CHARACTERS: [
      'explorer',
      'animal',
      'wizard',
      'robot',
      'dragon',
      'princess-prince',
      'detective',
      'superhero',
      'kid'
    ],
    MOODS: [
      'exciting',
      'funny',
      'mysterious',
      'scary',
      'peaceful',
      'adventurous'
    ],
    CONFLICTS: [
      'lost-treasure',
      'rescue-mission',
      'mystery-to-solve',
      'evil-to-defeat',
      'competition',
      'discovery'
    ],
    THEMES: [
      'friendship',
      'courage',
      'kindness',
      'adventure',
      'family',
      'discovery'
    ]
  };
  
  // Subscription tiers
  export const SUBSCRIPTION_TIERS = {
    FREE: {
      name: 'free',
      price: 0,
      storyLimit: 50,
      pageLimit: 2,
      features: {
        aiIllustrations: false,
        prioritySupport: false,
        advancedAnalytics: false,
        exportFormats: ['pdf']
      }
    },
    BASIC: {
      name: 'basic',
      price: 9.99,
      storyLimit: 100,
      pageLimit: 4,
      features: {
        aiIllustrations: true,
        prioritySupport: false,
        advancedAnalytics: false,
        exportFormats: ['pdf', 'word']
      }
    },
    PREMIUM: {
      name: 'premium',
      price: 19.99,
      storyLimit: 200,
      pageLimit: 4,
      features: {
        aiIllustrations: true,
        prioritySupport: true,
        advancedAnalytics: true,
        exportFormats: ['pdf', 'word', 'epub']
      }
    },
    PRO: {
      name: 'pro',
      price: 39.99,
      storyLimit: 300,
      pageLimit: 4,
      features: {
        aiIllustrations: true,
        prioritySupport: true,
        advancedAnalytics: true,
        exportFormats: ['pdf', 'word', 'epub']
      }
    }
  };
  
  // AI providers
  export const AI_PROVIDERS = {
    OPENAI: {
      name: 'openai',
      models: [
        {
          id: 'gpt-4o',
          name: 'GPT-4o',
          costPerToken: 0.00005,
          maxTokens: 128000
        },
        {
          id: 'gpt-4o-mini',
          name: 'GPT-4o Mini',
          costPerToken: 0.000015,
          maxTokens: 128000
        }
      ]
    },
    ANTHROPIC: {
      name: 'anthropic',
      models: [
        {
          id: 'claude-3-5-sonnet-20241022',
          name: 'Claude 3.5 Sonnet',
          costPerToken: 0.00003,
          maxTokens: 200000
        },
        {
          id: 'claude-3-haiku-20240307',
          name: 'Claude 3 Haiku',
          costPerToken: 0.00000025,
          maxTokens: 200000
        }
      ]
    },
    GOOGLE: {
      name: 'google',
      models: [
        {
          id: 'gemini-1.5-pro',
          name: 'Gemini 1.5 Pro',
          costPerToken: 0.0000035,
          maxTokens: 2000000
        },
        {
          id: 'gemini-1.5-flash',
          name: 'Gemini 1.5 Flash',
          costPerToken: 0.000000075,
          maxTokens: 1000000
        }
      ]
    }
  };
  
  // Rate limits
  export const RATE_LIMITS = {
    API_REQUESTS_PER_MINUTE: 60,
    AI_REQUESTS_PER_DAY: 100,
    STORIES_PER_HOUR: 5,
    COMMENTS_PER_MINUTE: 10,
    UPLOADS_PER_HOUR: 20
  };
  
  // Time constants
  export const TIME_CONSTANTS = {
    MINUTE: 60 * 1000,
    HOUR: 60 * 60 * 1000,
    DAY: 24 * 60 * 60 * 1000,
    WEEK: 7 * 24 * 60 * 60 * 1000,
    MONTH: 30 * 24 * 60 * 60 * 1000
  };
  
  // Achievement types
  export const ACHIEVEMENT_TYPES = {
    WRITING: 'writing',
    CREATIVITY: 'creativity', 
    CONSISTENCY: 'consistency',
    IMPROVEMENT: 'improvement',
    SOCIAL: 'social'
  };
  
  // Notification types
  export const NOTIFICATION_TYPES = {
    COMMENT: 'comment',
    ACHIEVEMENT: 'achievement',
    STORY: 'story',
    REMINDER: 'reminder',
    SYSTEM: 'system',
    MENTOR: 'mentor',
    PROGRESS: 'progress'
  };
  
  // File limits
  export const FILE_LIMITS = {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  };
  
  // Story limits
  export const STORY_LIMITS = {
    MIN_WORDS: 50,
    MAX_WORDS_FREE: 600,
    MAX_WORDS_PAID: 2000,
    MIN_TITLE_LENGTH: 3,
    MAX_TITLE_LENGTH: 100
  };
  
  // Age groups for COPPA compliance
  export const AGE_GROUPS = {
    UNDER_13: 'under-13',
    TEEN_13_17: '13-17',
    ADULT_18_PLUS: '18-plus'
  };
  
  export default {
    APP_CONFIG,
    USER_ROLES,
    STORY_ELEMENTS,
    SUBSCRIPTION_TIERS,
    AI_PROVIDERS,
    RATE_LIMITS,
    TIME_CONSTANTS,
    ACHIEVEMENT_TYPES,
    NOTIFICATION_TYPES,
    FILE_LIMITS,
    STORY_LIMITS,
    AGE_GROUPS
  };