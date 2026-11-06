import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { ENV } from './config/env';
import { setupSwagger } from './config/swagger';

import authRoutes from './routes/auth.routes';
import postRoutes from './routes/post.routes';
import incidentRoutes from './routes/incident.routes';
import taskRoutes from './routes/task.routes';
import pagerRoutes from './routes/pager.routes';
import messageRoutes from './routes/message.routes';
import documentRoutes from './routes/document.routes';
import notificationRoutes from './routes/notification.routes';
import mediaRoutes from './routes/media.routes';

const app = express();

// Security and middleware
app.use(cors({ origin: ENV.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
const publicDir = fs.existsSync(path.join(__dirname, 'public')) 
  ? path.join(__dirname, 'public') 
  : path.join(__dirname, '../src/public');

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(express.static(publicDir));

// Swagger API Documentation
setupSwagger(app);

// API Routing
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/pager', pagerRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/media', mediaRoutes);

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
    system: 'ResQLink Tactical Core',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: ENV.NODE_ENV
  });
});

// 404 Route handler for API
app.use('/api', (_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'API tactical endpoint not found.' });
});

// Single Page Application fallback for companion web portal
app.use((_req: Request, res: Response) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Error] Uncaught tactical exception:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Tactical Exception',
    error: ENV.NODE_ENV === 'development' ? err.stack : undefined
  });
});

export default app;
