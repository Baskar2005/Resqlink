import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, NotificationController.getMyNotifications);
router.patch('/:id/read', authenticate, NotificationController.markAsRead);

export default router;

