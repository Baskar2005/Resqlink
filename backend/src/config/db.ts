import mongoose from 'mongoose';
import { ENV } from './env';

let isConnected = false;

export async function connectDatabase(): Promise<boolean> {
  if (isConnected) return true;

  try {
    const mongoUri = ENV.MONGODB_URI;
    console.log(`[Database] Attempting connection to MongoDB (${mongoUri})...`);
    
    mongoose.set('strictQuery', true);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2500, // Quick fallback if local mongod is not up
    });

    isConnected = true;
    console.log('✅ [Database] Successfully connected to MongoDB / MongoDB Atlas.');
    return true;
  } catch (err: any) {
    console.warn(`⚠️ [Database] MongoDB connection failed (${err.message}).`);
    console.log('ℹ️ [Database] Running in Local High-Fidelity Reactive Storage Engine mode.');
    return false;
  }
}

export function isDbConnected(): boolean {
  return isConnected;
}

