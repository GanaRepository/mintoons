#!/usr/bin/env node

/**
 * Mintoons Sample Data Seeding Script
 * 
 * This script creates sample data for development and demo purposes:
 * - Sample users (students, mentors, parents)
 * - Sample stories with AI collaboration
 * - Sample comments and feedback
 * - Sample notifications and achievements
 * 
 * Usage: node scripts/seed-data.js [--env=development] [--count=50]
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');

// Import models
require('../models/User');
require('../models/Story');
require('../models/Comment');
require('../models/Achievement');
require('../models/Notification');

const User = mongoose.model('User');
const Story = mongoose.model('Story');
const Comment = mongoose.model('Comment');
const Achievement = mongoose.model('Achievement');
const Notification = mongoose.model('Notification');

// Sample data configurations
const STORY_ELEMENTS = {
  genres: ['Adventure', 'Fantasy', 'Mystery', 'Sci-Fi', 'Comedy', 'Drama', 'Historical', 'Animal Stories', 'Fairy Tale'],
  settings: ['Forest', 'Castle', 'Ocean', 'Space', 'City', 'Village', 'Mountains', 'Desert', 'Cave'],
  characters: ['Explorer', 'Animal', 'Wizard', 'Robot', 'Dragon', 'Princess/Prince', 'Detective', 'Superhero', 'Kid'],
  moods: ['Exciting', 'Funny', 'Mysterious', 'Scary', 'Peaceful', 'Adventurous'],
  conflicts: ['Lost Treasure', 'Rescue Mission', 'Mystery to Solve', 'Evil to Defeat', 'Competition', 'Discovery'],
  themes: ['Friendship', 'Courage', 'Kindness', 'Adventure', 'Family', 'Discovery'],
};

const SAMPLE_STORY_CONTENT = [
  {
    title: "The Magic Crystal Adventure",
    content: `Once upon a time, in a mystical forest, there lived a young explorer named Alex. One sunny morning, Alex discovered a glowing crystal hidden beneath an ancient oak tree.

    The crystal sparkled with all the colors of the rainbow, and when Alex touched it, magical things began to happen. The trees started whispering secrets, and the flowers began to dance in the wind.

    Suddenly, a wise old owl appeared and said, "That crystal holds the power to help others. Use it wisely, young one." Alex knew this was the beginning of an incredible adventure.

    With the magic crystal in hand, Alex set off to help the forest creatures solve their problems and bring happiness back to their magical home.`,
    wordCount: 124,
  },
  {
    title: "Robot Friends in Space",
    content: `Captain Zara was the youngest space explorer in the galaxy. Her spaceship, the Star Runner, was equipped with the smartest robot assistant named Bolt.

    One day, while traveling through the Nebula of Wonders, they received a distress signal from a distant planet. "Someone needs our help, Bolt!" Zara exclaimed.

    When they landed on the colorful planet, they discovered a group of friendly alien children whose playground had been destroyed by a meteor shower.

    Zara and Bolt worked together with the alien children to build an even better playground, using space technology and creative ideas. The new playground could float in the air and change colors!

    The alien children were so happy that they threw a celebration party and made Zara and Bolt honorary citizens of their planet.`,
    wordCount: 142,
  },
  {
    title: "The Dragon Who Loved Books",
    content: `In a castle high on a mountain lived a dragon named Ember, but she wasn't like other dragons. Instead of breathing fire, Ember breathed beautiful, colorful words that turned into butterflies.

    Ember's greatest treasure wasn't gold or jewels – it was her enormous library filled with thousands of books. She spent her days reading stories about brave knights, clever princesses, and magical adventures.

    One day, a young knight came to the castle, expecting to fight a fierce dragon. But when he saw Ember peacefully reading under a rainbow of word-butterflies, he was amazed.

    "Would you like to hear a story?" Ember asked kindly. The knight put down his sword and sat down to listen. From that day on, they became the best of friends, sharing stories and creating new adventures together.`,
    wordCount: 138,
  },
];

const COMMENT_TEMPLATES = {
  grammar: [
    "Great job with your sentence structure! Try adding a comma here: {suggestion}",
    "Excellent use of descriptive words! Remember to capitalize the first letter of {word}.",
    "Your story flows really well! Consider breaking this long sentence into two shorter ones.",
    "Nice work on your dialogue! Don't forget to start a new paragraph when someone new speaks.",
  ],
  creativity: [
    "I love how you made the {character} so unique! What a creative idea!",
    "Your imagination really shines through in this story! The {setting} sounds magical.",
    "What an interesting twist! I didn't expect the {character} to {action}.",
    "Your description of {element} really helps me picture the scene. Great job!",
  ],
  encouragement: [
    "You're becoming such a talented storyteller! Keep up the amazing work!",
    "I can see how much your writing has improved. This story is fantastic!",
    "Your creativity continues to amaze me. I can't wait to read your next story!",
    "You have such a wonderful imagination! This story made me smile.",
  ],
  suggestion: [
    "What do you think would happen if {character} tried a different approach?",
    "Consider adding more details about how {character} felt in this moment.",
    "What sounds, smells, or sights might {character} notice in the {setting}?",
    "How might other characters react to what {character} just did?",
  ],
};

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    warning: '\x1b[33m',
    error: '\x1b[31m',
    reset: '\x1b[0m',
  };
  
  console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
}

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

async function createSampleUsers(count) {
  log(`Creating ${count} sample users...`);
  
  const users = [];
  const password = await bcrypt.hash('password123', 12);
  
  // Create students (70%)
  const studentCount = Math.floor(count * 0.7);
  for (let i = 0; i < studentCount; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const age = faker.number.int({ min: 6, max: 17 });
    
    const user = new User({
      name: `${firstName} ${lastName}`,
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      password,
      role: 'student',
      age,
      isActive: true,
      emailVerified: true,
      profileComplete: true,
      preferences: {
        favoriteGenres: getRandomElements(STORY_ELEMENTS.genres, 3),
        writingGoals: faker.helpers.arrayElement([
          'Improve grammar',
          'Be more creative',
          'Write longer stories',
          'Get better feedback',
        ]),
      },
      stats: {
        storiesCompleted: faker.number.int({ min: 0, max: 25 }),
        averageGrammarScore: faker.number.int({ min: 65, max: 95 }),
        averageCreativityScore: faker.number.int({ min: 70, max: 98 }),
        writingStreak: faker.number.int({ min: 0, max: 30 }),
        totalWords: faker.number.int({ min: 500, max: 15000 }),
      },
    });
    
    users.push(user);
  }
  
  // Create mentors (20%)
  const mentorCount = Math.floor(count * 0.2);
  for (let i = 0; i < mentorCount; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    
    const user = new User({
      name: `${firstName} ${lastName}`,
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      password,
      role: 'mentor',
      age: faker.number.int({ min: 25, max: 65 }),
      isActive: true,
      emailVerified: true,
      profileComplete: true,
      mentorProfile: {
        bio: faker.lorem.paragraph(),
        experience: `${faker.number.int({ min: 2, max: 20 })} years of teaching experience`,
        specialties: getRandomElements([
          'Creative Writing',
          'Grammar',
          'Poetry',
          'Storytelling',
          'Reading Comprehension',
        ], 2),
        education: faker.helpers.arrayElement([
          'B.A. in English',
          'M.Ed. in Elementary Education',
          'B.A. in Creative Writing',
          'M.A. in Literature',
        ]),
      },
    });
    
    users.push(user);
  }
  
  // Create parents (10%)
  const parentCount = count - studentCount - mentorCount;
  for (let i = 0; i < parentCount; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    
    const user = new User({
      name: `${firstName} ${lastName}`,
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      password,
      role: 'parent',
      age: faker.number.int({ min: 28, max: 55 }),
      isActive: true,
      emailVerified: true,
      profileComplete: true,
    });
    
    users.push(user);
  }
  
  await User.insertMany(users);
  log(`Created ${users.length} sample users`, 'success');
  
  return users;
}

async function createSampleStories(users, count) {
  log(`Creating ${count} sample stories...`);
  
  const students = users.filter(user => user.role === 'student');
  const stories = [];
  
  for (let i = 0; i < count; i++) {
    const author = getRandomElement(students);
    const storyTemplate = getRandomElement(SAMPLE_STORY_CONTENT);
    const elements = {
      genre: getRandomElement(STORY_ELEMENTS.genres),
      setting: getRandomElement(STORY_ELEMENTS.settings),
      character: getRandomElement(STORY_ELEMENTS.characters),
      mood: getRandomElement(STORY_ELEMENTS.moods),
      conflict: getRandomElement(STORY_ELEMENTS.conflicts),
      theme: getRandomElement(STORY_ELEMENTS.themes),
    };
    
    const story = new Story({
      title: storyTemplate.title,
      content: storyTemplate.content,
      authorId: author._id,
      elements,
      status: faker.helpers.arrayElement(['draft', 'published', 'archived']),
      wordCount: storyTemplate.wordCount,
      collaborationData: {
        aiPrompts: [
          "Tell me about your main character's biggest dream.",
          "What magical power would help solve this problem?",
          "Describe the most beautiful place in your story.",
        ],
        childResponses: [
          "My character wants to help everyone in the forest be happy.",
          "A crystal that makes everything colorful and bright!",
          "The rainbow waterfall where all the animals come to drink.",
        ],
      },
      assessment: {
        grammarScore: faker.number.int({ min: 70, max: 98 }),
        creativityScore: faker.number.int({ min: 75, max: 100 }),
        overallScore: faker.number.int({ min: 78, max: 96 }),
        feedback: "Wonderful creativity and imagination! Your story has great characters and an exciting adventure.",
        suggestions: [
          "Try using more descriptive words",
          "Add dialogue between characters",
          "Describe the setting in more detail",
        ],
        strengths: [
          "Creative plot",
          "Engaging characters",
          "Good story structure",
        ],
        improvements: [
          "Paragraph organization",
          "Sentence variety",
        ],
      },
      createdAt: faker.date.past({ years: 1 }),
    });
    
    stories.push(story);
  }
  
  await Story.insertMany(stories);
  log(`Created ${stories.length} sample stories`, 'success');
  
  return stories;
}

async function createSampleComments(users, stories, count) {
  log(`Creating ${count} sample comments...`);
  
  const mentors = users.filter(user => user.role === 'mentor');
  const publishedStories = stories.filter(story => story.status === 'published');
  const comments = [];
  
  for (let i = 0; i < count && i < publishedStories.length * 3; i++) {
    const story = getRandomElement(publishedStories);
    const mentor = getRandomElement(mentors);
    const commentType = getRandomElement(['grammar', 'creativity', 'encouragement', 'suggestion']);
    const template = getRandomElement(COMMENT_TEMPLATES[commentType]);
    
    // Replace placeholders in template
    let content = template;
    content = content.replace('{character}', getRandomElement(STORY_ELEMENTS.characters));
    content = content.replace('{setting}', getRandomElement(STORY_ELEMENTS.settings));
    content = content.replace('{element}', getRandomElement(['plot', 'characters', 'setting', 'dialogue']));
    content = content.replace('{action}', getRandomElement(['help the other characters', 'solve the mystery', 'discover the secret']));
    content = content.replace('{word}', getRandomElement(['princess', 'dragon', 'castle', 'forest']));
    content = content.replace('{suggestion}', '"Hello," said the character.');
    
    const comment = new Comment({
      storyId: story._id,
      authorId: mentor._id,
      content,
      type: commentType,
      highlightedText: faker.helpers.maybe(() => 
        story.content.slice(
          faker.number.int({ min: 0, max: story.content.length - 50 }),
          faker.number.int({ min: 50, max: Math.min(story.content.length, 100) })
        ), { probability: 0.3 }
      ),
      position: faker.helpers.maybe(() => ({
        start: faker.number.int({ min: 0, max: 100 }),
        end: faker.number.int({ min: 100, max: 200 }),
      }), { probability: 0.3 }),
      createdAt: faker.date.between({ from: story.createdAt, to: new Date() }),
    });
    
    comments.push(comment);
  }
  
  await Comment.insertMany(comments);
  log(`Created ${comments.length} sample comments`, 'success');
  
  return comments;
}

async function createSampleNotifications(users, count) {
  log(`Creating ${count} sample notifications...`);
  
  const students = users.filter(user => user.role === 'student');
  const notifications = [];
  
  for (let i = 0; i < count; i++) {
    const user = getRandomElement(students);
    const notificationType = getRandomElement(['comment', 'achievement', 'story', 'reminder']);
    
    let title, message, actionUrl;
    
    switch (notificationType) {
      case 'comment':
        title = 'New Feedback on Your Story';
        message = 'Your teacher left helpful comments on your latest story!';
        actionUrl = `/my-stories/${faker.string.uuid()}`;
        break;
      case 'achievement':
        title = 'Achievement Unlocked!';
        message = `Congratulations! You've earned the "${getRandomElement(['First Story', 'Grammar Master', 'Creative Genius'])}" badge!`;
        actionUrl = '/progress';
        break;
      case 'story':
        title = 'Story Published Successfully';
        message = 'Your story has been published and is ready for teacher feedback!';
        actionUrl = `/my-stories/${faker.string.uuid()}`;
        break;
      case 'reminder':
        title = 'Time to Write!';
        message = "It's been a few days since your last story. Ready for your next adventure?";
        actionUrl = '/create-stories';
        break;
    }
    
    const notification = new Notification({
      userId: user._id,
      type: notificationType,
      title,
      message,
      actionUrl,
      read: faker.datatype.boolean({ probability: 0.3 }),
      priority: getRandomElement(['low', 'normal', 'high']),
      metadata: {
        relatedId: faker.string.uuid(),
        category: notificationType,
      },
      createdAt: faker.date.past({ years: 0.5 }),
    });
    
    notifications.push(notification);
  }
  
  await Notification.insertMany(notifications);
  log(`Created ${notifications.length} sample notifications`, 'success');
  
  return notifications;
}

async function connectDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mintoons-dev';
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

async function main() {
  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    const userCount = parseInt(args.find(arg => arg.startsWith('--count='))?.split('=')[1]) || 50;
    const storyCount = Math.floor(userCount * 2); // 2 stories per user on average
    const commentCount = Math.floor(storyCount * 1.5); // 1.5 comments per story on average
    const notificationCount = Math.floor(userCount * 3); // 3 notifications per user on average
    
    log('Starting sample data generation...');
    log(`Target counts: ${userCount} users, ${storyCount} stories, ${commentCount} comments, ${notificationCount} notifications`);
    
    // Connect to database
    await connectDatabase();
    
    // Check if data already exists
    const existingUserCount = await User.countDocuments();
    if (existingUserCount > 5) { // Allow for admin and a few test users
      log(`Database already contains ${existingUserCount} users. Skipping seed data generation.`, 'warning');
      log('Use --reset flag with setup-db.js to clear existing data first.', 'info');
      return;
    }
    
    // Create sample data
    const users = await createSampleUsers(userCount);
    const stories = await createSampleStories(users, storyCount);
    const comments = await createSampleComments(users, stories, commentCount);
    const notifications = await createSampleNotifications(users, notificationCount);
    
    log('Sample data generation completed successfully!', 'success');
    log('');
    log('Sample data summary:', 'info');
    log(`- Users: ${users.length} (${users.filter(u => u.role === 'student').length} students, ${users.filter(u => u.role === 'mentor').length} mentors, ${users.filter(u => u.role === 'parent').length} parents)`, 'info');
    log(`- Stories: ${stories.length}`, 'info');
    log(`- Comments: ${comments.length}`, 'info');
    log(`- Notifications: ${notifications.length}`, 'info');
    log('');
    log('Sample login credentials:', 'info');
    log('Email: any generated email address', 'info');
    log('Password: password123', 'info');
    
  } catch (error) {
    log(`Seed data generation failed: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  } finally {
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

// Run the seeding
if (require.main === module) {
  main();
}

module.exports = {
  main,
  createSampleUsers,
  createSampleStories,
  createSampleComments,
  createSampleNotifications,
};