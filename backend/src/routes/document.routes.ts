import { Router } from 'express';
import { DocumentController } from '../controllers/document.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/incident/:incidentId', authenticate, DocumentController.listDocuments);
router.post('/', authenticate, DocumentController.createDocument);

export default router;

