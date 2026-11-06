import { Router } from 'express';
import { MessageController } from '../controllers/message.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/:channelKey', authenticate, MessageController.getChannelMessages);
router.post('/', authenticate, MessageController.sendMessage);

export default router;

