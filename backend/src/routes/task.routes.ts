import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/incident/:incidentId', authenticate, TaskController.listTasks);
router.post('/', authenticate, TaskController.createTask);
router.patch('/:id/status', authenticate, TaskController.updateTaskStatus);
router.patch('/:id/checklist', authenticate, TaskController.toggleChecklistItem);

export default router;

