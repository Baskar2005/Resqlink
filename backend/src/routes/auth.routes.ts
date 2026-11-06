import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/firebase-exchange', AuthController.firebaseExchange);
router.get('/me', authenticate, AuthController.getMe);
router.patch('/availability', authenticate, AuthController.updateAvailability);
router.get('/responders', AuthController.listResponders);

export default router;

