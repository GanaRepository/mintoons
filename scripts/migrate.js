// File 105: scripts/migrate.js - Database Migration Script
#!/usr/bin/env node

const mongoose = require('mongoose');
require('dotenv').config();

async function runMigrations() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔗 Connected to MongoDB');

    // Migration 1: Add streak fields to users
    console.log('📈 Adding streak fields to users...');
    await mongoose.connection.db.collection('users').updateMany(
      { dailyStreak: { $exists: false } },
      {
        $set: {
          dailyStreak: 0,
          longestStreak: 0,
          lastActivityDate: new Date(),
        }
      }
    );

    // Migration 2: Add content moderation fields
    console.log('🛡️ Adding content moderation fields...');
    await mongoose.connection.db.collection('stories').updateMany(
      { moderationStatus: { $exists: false } },
      {
        $set: {
          moderationStatus: 'approved',
          moderationNotes: [],
        }
      }
    );

    // Migration 3: Add XP and level fields
    console.log('🎮 Adding gamification fields...');
    await mongoose.connection.db.collection('users').updateMany(
      { xp: { $exists: false } },
      {
        $set: {
          xp: 0,
          level: 1,
          achievements: [],
        }
      }
    );

    console.log('✅ All migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.connection.close();
  }
}

runMigrations();
