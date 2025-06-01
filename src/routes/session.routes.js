import express from 'express';
import { create, getAll, getOne, update, remove } from '../controllers/session.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Protected routes - require authentication
router.post('/', authenticateToken, create);
router.get('/', authenticateToken, getAll);
router.get('/:id', authenticateToken, getOne);
router.put('/:id', authenticateToken, update);
router.delete('/:id', authenticateToken, remove);

export default router; 