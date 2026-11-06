import { Router } from 'express';
import { IncidentController } from '../controllers/incident.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.get('/', authenticate, IncidentController.listIncidents);
router.get('/:id', authenticate, IncidentController.getIncidentById);
// Only COMMANDER or OFFICER roles can establish new multi-agency Incident Command rooms
router.post('/', authenticate, requireRole(['COMMANDER', 'OFFICER']), IncidentController.createIncident);
router.post('/join', authenticate, IncidentController.joinByCode);
router.patch('/:id/check-in', authenticate, IncidentController.updateCheckInStatus);

export default router;

