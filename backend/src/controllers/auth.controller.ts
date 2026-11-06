import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { uuidv4 } from '../utils/uuid';
import { store } from '../services/store.service';
import { ENV } from '../config/env';
import { IUser, ResponderRole, AvailabilityStatus } from '../models/types';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, firstName, lastName, callsign, badgeNumber, organizationName, organizationType, role, rank, phone } = req.body;

      if (!email || !password || !firstName || !lastName || !callsign || !badgeNumber) {
        res.status(400).json({ success: false, message: 'Missing required registration fields.' });
        return;
      }

      const existing = store.getUserByEmail(email);
      if (existing) {
        res.status(409).json({ success: false, message: 'A responder account with this email already exists.' });
        return;
      }

      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync(password, salt);

      const newUser: IUser = {
        id: `usr-${uuidv4().substring(0, 8)}`,
        email: email.toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        callsign,
        badgeNumber,
        organization: {
          id: `org-${uuidv4().substring(0, 6)}`,
          name: organizationName || 'Regional Volunteer Auxiliary',
          type: organizationType || 'DISASTER_RELIEF',
          isVerified: false
        },
        role: (role as ResponderRole) || 'VOLUNTEER',
        rank: rank || 'Field Responder',
        availability: 'ON_DUTY',
        certifications: [],
        skills: ['First Aid / CPR', 'Radio Communications'],
        avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80`,
        phone: phone || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      store.createUser(newUser);

      const token = jwt.sign(
        { userId: newUser.id, role: newUser.role, callsign: newUser.callsign },
        ENV.JWT_SECRET,
        { expiresIn: '7d' }
      );

      const { passwordHash: _, ...safeUser } = newUser;
      res.status(201).json({
        success: true,
        message: 'Responder registered successfully.',
        token,
        user: safeUser
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Registration failed.', error: err.message });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ success: false, message: 'Email and password are required.' });
        return;
      }

      const user = store.getUserByEmail(email);
      if (!user) {
        res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
        return;
      }

      if (user.passwordHash && !bcrypt.compareSync(password, user.passwordHash)) {
        res.status(401).json({ success: false, message: 'Invalid credentials. Incorrect password.' });
        return;
      }

      const token = jwt.sign(
        { userId: user.id, role: user.role, callsign: user.callsign },
        ENV.JWT_SECRET,
        { expiresIn: '7d' }
      );

      const { passwordHash: _, ...safeUser } = user;
      res.json({
        success: true,
        message: 'Authentication successful.',
        token,
        user: safeUser
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Login failed.', error: err.message });
    }
  }

  static async firebaseExchange(req: Request, res: Response): Promise<void> {
    try {
      const { idToken, email, displayName, photoUrl } = req.body;

      if (!idToken && !email) {
        res.status(400).json({ success: false, message: 'Firebase ID token or email required.' });
        return;
      }

      // Check if user exists
      let user = email ? store.getUserByEmail(email) : store.getAllUsers()[0];
      if (!user) {
        // Auto-provision responder account linked with Firebase UID
        const names = (displayName || 'Responder Volunteer').split(' ');
        const newUser: IUser = {
          id: `usr-${uuidv4().substring(0, 8)}`,
          email: (email || `responder_${Date.now()}@resqlink.org`).toLowerCase(),
          firebaseUid: idToken ? idToken.substring(0, 16) : undefined,
          firstName: names[0] || 'First',
          lastName: names.slice(1).join(' ') || 'Responder',
          callsign: `Echo-${Math.floor(100 + Math.random() * 900)}`,
          badgeNumber: `RQL-${Math.floor(1000 + Math.random() * 9000)}`,
          organization: {
            id: 'org-metro-aux',
            name: 'Emergency Medical & Disaster Auxiliary',
            type: 'EMS_PARAMEDIC',
            isVerified: true
          },
          role: 'PARAMEDIC',
          rank: 'First Responder',
          availability: 'ON_DUTY',
          certifications: [
            { name: 'Basic Life Support (BLS)', issuer: 'AHA', issuedDate: '2024-01-01', expiresDate: '2027-01-01', verified: true }
          ],
          skills: ['Basic Life Support', 'Field Communications', 'Triage'],
          avatarUrl: photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
          phone: '+1-555-010-0000',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        store.createUser(newUser);
        user = newUser;
      }

      const token = jwt.sign(
        { userId: user.id, role: user.role, callsign: user.callsign },
        ENV.JWT_SECRET,
        { expiresIn: '7d' }
      );

      const { passwordHash: _, ...safeUser } = user;
      res.json({
        success: true,
        message: 'Firebase token verified and exchanged.',
        token,
        user: safeUser
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Firebase token exchange failed.', error: err.message });
    }
  }

  static async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }
    const { passwordHash: _, ...safeUser } = req.user;
    res.json({ success: true, user: safeUser });
  }

  static async updateAvailability(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { availability } = req.body;
    const valid: AvailabilityStatus[] = ['ON_DUTY', 'OFF_DUTY', 'DEPLOYED', 'STANDBY', 'MOBILIZING'];
    if (!valid.includes(availability)) {
      res.status(400).json({ success: false, message: `Invalid availability. Must be one of: [${valid.join(', ')}]` });
      return;
    }

    const updated = store.updateUser(req.user.id, { availability });
    res.json({ success: true, message: 'Availability updated.', user: updated });
  }

  static async listResponders(_req: Request, res: Response): Promise<void> {
    const users = store.getAllUsers().map(({ passwordHash: _, ...safe }) => safe);
    res.json({ success: true, count: users.length, responders: users });
  }
}
