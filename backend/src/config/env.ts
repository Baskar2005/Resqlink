import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: parseInt(process.env.PORT || '4000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/resqlink',
  JWT_SECRET: process.env.JWT_SECRET || 'resqlink-hyper-secure-tactical-jwt-key-2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || 'resqlink-firebase',
  STORAGE_DRIVER: process.env.STORAGE_DRIVER || 'local',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  PAGER_HEARTBEAT_TIMEOUT_MS: 90000, // 90 seconds before marking device offline
  DEADMAN_MOTION_TIMEOUT_MS: 180000, // 3 minutes stationary before triggering man-down alert
};

