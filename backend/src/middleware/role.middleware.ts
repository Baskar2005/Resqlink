import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { ResponderRole, ICSRole } from '../models/types';
import { store } from '../services/store.service';

export function requireRole(allowedRoles: ResponderRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ 
        success: false, 
        message: `Forbidden. Action requires one of the following responder roles: [${allowedRoles.join(', ')}]. Current role: ${req.user.role}` 
      });
      return;
    }

    next();
  };
}

export function requireIncidentRole(allowedIcsRoles: ICSRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const incidentId = req.params.incidentId || req.body.incidentId;
    if (!incidentId) {
      res.status(400).json({ success: false, message: 'Incident ID required in request parameters or body.' });
      return;
    }

    const incident = store.getIncidentById(incidentId);
    if (!incident) {
      res.status(404).json({ success: false, message: 'Incident room not found.' });
      return;
    }

    // Check if user is Incident Commander
    if (incident.commanderId === req.user.id) {
      next();
      return;
    }

    // Check member's assigned ICS role in the room
    const member = incident.members.find(m => m.userId === req.user?.id);
    if (!member || !allowedIcsRoles.includes(member.icsRole)) {
      res.status(403).json({
        success: false,
        message: `Action requires ICS role: [${allowedIcsRoles.join(', ')}] within incident ${incident.incidentNumber}.`
      });
      return;
    }

    next();
  };
}

