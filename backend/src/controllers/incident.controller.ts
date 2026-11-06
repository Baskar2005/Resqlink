import { Response } from 'express';
import { uuidv4 } from '../utils/uuid';
import { store } from '../services/store.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { IIncident, IncidentType, IncidentStatus, ICSRole, CheckInStatus } from '../models/types';
import { ioServer } from '../server';

export class IncidentController {
  static async listIncidents(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const status = req.query.status as string;
      const incidents = store.getAllIncidents(status);
      res.json({ success: true, count: incidents.length, incidents });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve incidents.', error: err.message });
    }
  }

  static async getIncidentById(req: AuthenticatedRequest, res: Response): Promise<void> {
    const incident = store.getIncidentById(String(req.params.id));
    if (!incident) {
      res.status(404).json({ success: false, message: 'Incident not found.' });
      return;
    }
    const tasks = store.getTasksByIncidentId(incident.id);
    const documents = store.getDocumentsByIncidentId(incident.id);
    const messages = store.getMessagesByChannel(incident.id);

    res.json({ success: true, incident, tasks, documents, messages });
  }

  static async createIncident(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const { title, description, type, severityLevel, locationName, lat, lng, operationalPeriod, jurisdiction } = req.body;

      if (!title || !description || !type) {
        res.status(400).json({ success: false, message: 'Title, description, and incident type are required.' });
        return;
      }

      // Generate unique 6-character alphanumeric join code (like Google Classroom)
      const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const incNumber = `INC-2026-${(type as string).substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

      const newIncident: IIncident = {
        id: `inc-${uuidv4().substring(0, 8)}`,
        incidentNumber: incNumber,
        title,
        description,
        type: (type as IncidentType) || 'WILDFIRE',
        severityLevel: Math.min(5, Math.max(1, parseInt(severityLevel || '3', 10))) as any,
        status: 'ACTIVE',
        joinCode,
        operationalPeriod: operationalPeriod || 'Operational Period 01: 0600 - 1800',
        location: {
          name: locationName || 'Command Staging Area',
          lat: parseFloat(lat || '39.7392'),
          lng: parseFloat(lng || '-104.9903'),
          jurisdiction: jurisdiction || 'Regional Emergency Management'
        },
        commanderId: user.id,
        commanderName: `${user.firstName} ${user.lastName} (${user.callsign})`,
        members: [
          {
            userId: user.id,
            name: `${user.firstName} ${user.lastName}`,
            callsign: user.callsign,
            badgeNumber: user.badgeNumber,
            avatarUrl: user.avatarUrl,
            organizationName: user.organization.name,
            icsRole: 'INCIDENT_COMMANDER',
            checkInStatus: 'ON_SCENE',
            joinedAt: new Date().toISOString()
          }
        ],
        stats: {
          totalPersonnel: 1,
          activeTasks: 0,
          completedTasks: 0,
          urgentAlerts: 0
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      store.createIncident(newIncident);

      if (ioServer) {
        ioServer.emit('incident:created', newIncident);
      }

      res.status(201).json({ success: true, message: 'Incident room activated.', incident: newIncident });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to create incident.', error: err.message });
    }
  }

  static async joinByCode(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const { joinCode, icsRole } = req.body;
      if (!joinCode) {
        res.status(400).json({ success: false, message: 'Join code is required.' });
        return;
      }

      const incident = store.getIncidentByJoinCode(joinCode);
      if (!incident) {
        res.status(404).json({ success: false, message: `No active incident room matches join code "${joinCode}". Check code and retry.` });
        return;
      }

      const member = {
        userId: user.id,
        name: `${user.firstName} ${user.lastName}`,
        callsign: user.callsign,
        badgeNumber: user.badgeNumber,
        avatarUrl: user.avatarUrl,
        organizationName: user.organization.name,
        icsRole: (icsRole as ICSRole) || 'FIELD_RESPONDER',
        checkInStatus: 'CHECKED_IN' as CheckInStatus,
        joinedAt: new Date().toISOString()
      };

      const updated = store.joinIncident(incident.id, member);

      if (ioServer) {
        ioServer.to(`incident:${incident.id}`).emit('incident:member_joined', member);
      }

      res.json({ success: true, message: `Successfully joined ${incident.title}.`, incident: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to join incident room.', error: err.message });
    }
  }

  static async updateCheckInStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const { checkInStatus } = req.body;
      const validStatuses: CheckInStatus[] = ['CHECKED_IN', 'EN_ROUTE', 'ON_SCENE', 'REST_CYCLE', 'DEMOBILIZED'];
      if (!validStatuses.includes(checkInStatus)) {
        res.status(400).json({ success: false, message: `Invalid status. Must be one of: [${validStatuses.join(', ')}]` });
        return;
      }

      const incident = store.getIncidentById(String(req.params.id));
      if (!incident) {
        res.status(404).json({ success: false, message: 'Incident not found.' });
        return;
      }

      const member = incident.members.find(m => m.userId === user.id);
      if (!member) {
        res.status(403).json({ success: false, message: 'You are not enrolled in this incident room.' });
        return;
      }

      member.checkInStatus = checkInStatus;
      incident.updatedAt = new Date().toISOString();
      store.updateIncident(incident.id, { members: incident.members });

      if (ioServer) {
        ioServer.to(`incident:${incident.id}`).emit('incident:status_change', {
          userId: user.id,
          callsign: user.callsign,
          checkInStatus
        });
      }

      res.json({ success: true, message: `Status updated to ${checkInStatus}.`, incident });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to update check-in status.', error: err.message });
    }
  }
}
