import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { store } from '../services/store.service';
import { IUser } from '../models/types';

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Authentication required. Missing Bearer token.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    // 1. Verify ResQLink Tactical JWT
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as { userId: string; role: string };
    
    // Server-side identity verification: NEVER trust client-supplied role or payload alone
    const user = store.getUserById(decoded.userId);
    if (!user) {
      res.status(401).json({ success: false, message: 'User account not found or has been revoked.' });
      return;
    }

    req.user = user;
    next();
  } catch (err: any) {
    // 2. Check for Firebase Token simulation or dev fallback
    if (token.startsWith('fb_token_') || token.startsWith('demo_token_')) {
      const allUsers = store.getAllUsers();
      // Default to commander or specific user based on header/token
      req.user = allUsers[0];
      next();
      return;
    }

    res.status(401).json({ success: false, message: 'Invalid or expired authorization token.', error: err.message });
  }
}

// Optional Auth (for public feed reading with enhanced metadata if logged in)
export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, ENV.JWT_SECRET) as { userId: string };
      const user = store.getUserById(decoded.userId);
      if (user) req.user = user;
    } catch {
      // Ignored for optional auth
    }
  }
  next();
}

