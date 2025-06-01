import { Router } from 'express';
const router = Router();
import { create, getAll, getOne, update, remove } from '../controllers/client.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

// Protected routes - require authentication
router.post('/', authenticateToken, create);
router.get('/', authenticateToken, getAll);
router.get('/:id', authenticateToken, getOne);
router.put('/:id', authenticateToken, update);
router.delete('/:id', authenticateToken, remove);

export default router; 