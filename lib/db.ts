import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Use global variable in development to prevent multiple connections
declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = globalThis.mongoose || {
  conn: null,
  promise: null,
};

if (!globalThis.mongoose) {
  globalThis.mongoose = cached;
}

async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) {
    console.log('🟢 Using existing database connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    };

    console.log('🟡 Creating new database connection...');
    cached.promise = mongoose.connect(MONGODB_URI!, opts);
  }

  try {
    cached.conn = await cached.promise;
    console.log('🟢 Database connected successfully');
    console.log(`🏛️  Connected to: ${cached.conn.connection.name}`);
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    console.error('🔴 Database connection failed:', e);
    throw e;
  }
}

export default connectToDatabase;