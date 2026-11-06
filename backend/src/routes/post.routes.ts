import { Router } from 'express';
import { PostController } from '../controllers/post.controller';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/', optionalAuth, PostController.getFeed);
router.get('/:id', optionalAuth, PostController.getPostById);
router.post('/', authenticate, PostController.createPost);
router.post('/:id/react', authenticate, PostController.toggleReaction);
router.post('/:id/comments', authenticate, PostController.addComment);

export default router;

