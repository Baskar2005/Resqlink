import { Response } from 'express';
import { store } from '../services/store.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class NotificationController {
  static async getMyNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }
    const notifs = store.getUserNotifications(user.id);
    res.json({ success: true, count: notifs.length, notifications: notifs });
  }

  static async markAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }
    const success = store.markNotificationAsRead(user.id, String(req.params.id));
    res.json({ success, message: success ? 'Marked as read.' : 'Notification not found.' });
  }
}
