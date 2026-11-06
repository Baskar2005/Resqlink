import { Router } from 'express';
import { PagerController } from '../controllers/pager.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/devices', PagerController.listDevices);
router.get('/devices/:id', PagerController.getDeviceById);
router.post('/devices/register', authenticate, PagerController.registerDevice);
router.post('/devices/:id/telemetry', PagerController.updateTelemetry);

router.get('/alerts', PagerController.listAlerts);
router.post('/alerts/dispatch', authenticate, PagerController.sendAlert);
router.post('/alerts/acknowledge', PagerController.acknowledgeAlert);

export default router;

