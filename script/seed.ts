import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Task from '../lib/db/models/Task';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  process.exit(1);
}

async function seedTasks() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    // Use type assertion to tell TypeScript it's a string
    await mongoose.connect(MONGODB_URI as string);
    console.log('✅ Connected to MongoDB');

    // ... rest of the code
  } catch (error) {
    console.error('❌ Error seeding tasks:', error);
    process.exit(1);
  }
}

seedTasks();