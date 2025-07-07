#!/usr/bin/env node

/**
 * Mintoons Database Setup Script
 * 
 * This script initializes the MongoDB database with:
 * - Required collections and indexes
 * - Default admin user
 * - Sample data for development
 * - AI provider configurations
 * 
 * Usage: node scripts/setup-db.js [--env=development|production] [--reset]
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const readline = require('readline');

// Import models
require('../models/User');
require('../models/Story');
require('../models/Comment');
require('../models/Achievement');
require('../models/Subscription');
require('../models/PasswordReset');
require('../models/Notification');

const User = mongoose.model('User');
const Achievement = mongoose.model('Achievement');

// Configuration
const config = {
  development: {
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/mintoons-dev',
    adminEmail: 'admin@mintoons.local',
    adminPassword: 'admin123',
  },
  production: {
    mongoUri: process.env.MONGODB_URI,
    adminEmail: process.env.ADMIN_EMAIL,
    adminPassword: process.env.ADMIN_PASSWORD,
  },
};

// Default achievements
const defaultAchievements = [
  {
    name: 'First Story',
    description: 'Complete your very first story',
    icon: '📖',
    category: 'writing',
    rarity: 'common',
    criteria: { storiesCompleted: 1 },
    rewards: { badge: 'first-story', title: 'Storyteller' },
  },
  {
    name: 'Grammar Master',
    description: 'Achieve 90+ grammar score',
    icon: '✏️',
    category: 'improvement',
    rarity: 'rare',
    criteria: { grammarScore: 90 },
    rewards: { badge: 'grammar-master', title: 'Grammar Guru' },
  },
  {
    name: 'Creative Genius',
    description: 'Achieve 95+ creativity score',
    icon: '🎨',
    category: 'creativity',
    rarity: 'epic',
    criteria: { creativityScore: 95 },
    rewards: { badge: 'creative-genius', title: 'Creative Master' },
  },
  {
    name: 'Writing Streak',
    description: 'Write for 7 consecutive days',
    icon: '🔥',
    category: 'consistency',
    rarity: 'rare',
    criteria: { consecutiveDays: 7 },
    rewards: { badge: 'streak-master', title: 'Consistent Writer' },
  },
  {
    name: 'Story Master',
    description: 'Complete 50 stories',
    icon: '👑',
    category: 'writing',
    rarity: 'legendary',
    criteria: { storiesCompleted: 50 },
    rewards: { badge: 'story-master', title: 'Master Storyteller', unlocks: ['advanced-themes'] },
  },
];

// Database indexes for performance
const indexes = [
  // User indexes
  { collection: 'users', index: { email: 1 }, options: { unique: true } },
  { collection: 'users', index: { role: 1 } },
  { collection: 'users', index: { createdAt: -1 } },
  { collection: 'users', index: { isActive: 1 } },

  // Story indexes
  { collection: 'stories', index: { authorId: 1, createdAt: -1 } },
  { collection: 'stories', index: { status: 1 } },
  { collection: 'stories', index: { 'elements.genre': 1 } },
  { collection: 'stories', index: { 'assessment.overallScore': -1 } },
  { collection: 'stories', index: { createdAt: -1 } },

  // Comment indexes
  { collection: 'comments', index: { storyId: 1, createdAt: -1 } },
  { collection: 'comments', index: { authorId: 1 } },
  { collection: 'comments', index: { type: 1 } },

  // Notification indexes
  { collection: 'notifications', index: { userId: 1, createdAt: -1 } },
  { collection: 'notifications', index: { userId: 1, read: 1 } },
  { collection: 'notifications', index: { type: 1 } },

  // Achievement indexes
  { collection: 'achievements', index: { category: 1 } },
  { collection: 'achievements', index: { rarity: 1 } },

  // Password reset indexes
  { collection: 'passwordresets', index: { token: 1 }, options: { unique: true } },
  { collection: 'passwordresets', index: { expiresAt: 1 }, options: { expireAfterSeconds: 0 } },

  // Subscription indexes
  { collection: 'subscriptions', index: { userId: 1 } },
  { collection: 'subscriptions', index: { status: 1 } },
];

// Utility functions
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    warning: '\x1b[33m', // Yellow
    error: '\x1b[31m',   // Red
    reset: '\x1b[0m',    // Reset
  };
  
  console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
}

async function connectDatabase(mongoUri) {
  try {
    log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri, {
      bufferCommands: false,
    });
    log('Connected to MongoDB successfully', 'success');
  } catch (error) {
    log(`Failed to connect to MongoDB: ${error.message}`, 'error');
    process.exit(1);
  }
}

async function createIndexes() {
  log('Creating database indexes...');
  
  for (const indexConfig of indexes) {
    try {
      const collection = mongoose.connection.db.collection(indexConfig.collection);
      await collection.createIndex(indexConfig.index, indexConfig.options || {});
      log(`Created index on ${indexConfig.collection}: ${JSON.stringify(indexConfig.index)}`, 'success');
    } catch (error) {
      if (error.code === 11000 || error.codeName === 'IndexOptionsConflict') {
        log(`Index already exists on ${indexConfig.collection}: ${JSON.stringify(indexConfig.index)}`, 'warning');
      } else {
        log(`Failed to create index on ${indexConfig.collection}: ${error.message}`, 'error');
      }
    }
  }
}

async function createAdminUser(adminEmail, adminPassword) {
  try {
    log('Creating admin user...');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      log(`Admin user already exists: ${adminEmail}`, 'warning');
      return existingAdmin;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    const adminUser = new User({
      name: 'System Administrator',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      age: 25,
      isActive: true,
      emailVerified: true,
      profileComplete: true,
    });

    await adminUser.save();
    log(`Admin user created successfully: ${adminEmail}`, 'success');
    return adminUser;
  } catch (error) {
    log(`Failed to create admin user: ${error.message}`, 'error');
    throw error;
  }
}

async function createDefaultAchievements() {
  try {
    log('Creating default achievements...');
    
    for (const achievementData of defaultAchievements) {
      const existingAchievement = await Achievement.findOne({ name: achievementData.name });
      if (!existingAchievement) {
        const achievement = new Achievement(achievementData);
        await achievement.save();
        log(`Created achievement: ${achievementData.name}`, 'success');
      } else {
        log(`Achievement already exists: ${achievementData.name}`, 'warning');
      }
    }
  } catch (error) {
    log(`Failed to create achievements: ${error.message}`, 'error');
    throw error;
  }
}

async function createGridFSBuckets() {
  try {
    log('Setting up GridFS buckets...');
    
    const db = mongoose.connection.db;
    
    // Create uploads bucket for file storage
    const uploadsBucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'uploads' });
    
    // Create indexes for GridFS
    await db.collection('uploads.files').createIndex({ filename: 1 });
    await db.collection('uploads.files').createIndex({ uploadDate: -1 });
    await db.collection('uploads.files').createIndex({ 'metadata.contentType': 1 });
    
    log('GridFS buckets configured successfully', 'success');
  } catch (error) {
    log(`Failed to setup GridFS: ${error.message}`, 'error');
    throw error;
  }
}

async function setupCollections() {
  try {
    log('Setting up collections...');
    
    // Ensure collections exist
    const collections = [
      'users', 'stories', 'comments', 'achievements', 
      'subscriptions', 'passwordresets', 'notifications',
      'uploads.files', 'uploads.chunks'
    ];
    
    for (const collectionName of collections) {
      try {
        await mongoose.connection.db.createCollection(collectionName);
        log(`Created collection: ${collectionName}`, 'success');
      } catch (error) {
        if (error.codeName === 'NamespaceExists') {
          log(`Collection already exists: ${collectionName}`, 'warning');
        } else {
          throw error;
        }
      }
    }
  } catch (error) {
    log(`Failed to setup collections: ${error.message}`, 'error');
    throw error;
  }
}

async function resetDatabase() {
  try {
    log('Resetting database...', 'warning');
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    for (const collection of collections) {
      await mongoose.connection.db.collection(collection.name).drop();
      log(`Dropped collection: ${collection.name}`, 'warning');
    }
    
    log('Database reset completed', 'warning');
  } catch (error) {
    log(`Failed to reset database: ${error.message}`, 'error');
    throw error;
  }
}

async function validateConfiguration(env) {
  const envConfig = config[env];
  
  if (!envConfig.mongoUri) {
    throw new Error(`MongoDB URI not configured for ${env} environment`);
  }
  
  if (env === 'production') {
    if (!envConfig.adminEmail || !envConfig.adminPassword) {
      throw new Error('Admin credentials not configured for production environment');
    }
  }
}

async function main() {
  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    const env = args.find(arg => arg.startsWith('--env='))?.split('=')[1] || 'development';
    const shouldReset = args.includes('--reset');
    
    log(`Starting database setup for ${env} environment`);
    
    // Validate configuration
    await validateConfiguration(env);
    const envConfig = config[env];
    
    // Confirm destructive operations
    if (shouldReset) {
      const confirm = await question(
        'WARNING: This will delete all existing data. Are you sure? (type "yes" to confirm): '
      );
      if (confirm !== 'yes') {
        log('Database reset cancelled', 'warning');
        process.exit(0);
      }
    }
    
    // Connect to database
    await connectDatabase(envConfig.mongoUri);
    
    // Reset database if requested
    if (shouldReset) {
      await resetDatabase();
    }
    
    // Setup database
    await setupCollections();
    await createIndexes();
    await createGridFSBuckets();
    await createDefaultAchievements();
    await createAdminUser(envConfig.adminEmail, envConfig.adminPassword);
    
    log('Database setup completed successfully!', 'success');
    log('');
    log('Next steps:', 'info');
    log('1. Start your application: npm run dev', 'info');
    log('2. Visit http://localhost:3000', 'info');
    log(`3. Login as admin: ${envConfig.adminEmail}`, 'info');
    log('');
    
  } catch (error) {
    log(`Setup failed: ${error.message}`, 'error');
    process.exit(1);
  } finally {
    rl.close();
    await mongoose.disconnect();
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  log(`Uncaught Exception: ${error.message}`, 'error');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  log(`Unhandled Rejection at: ${promise}, reason: ${reason}`, 'error');
  process.exit(1);
});

// Run the setup
if (require.main === module) {
  main();
}

module.exports = {
  main,
  connectDatabase,
  createIndexes,
  createAdminUser,
  createDefaultAchievements,
  createGridFSBuckets,
  setupCollections,
  resetDatabase,
};