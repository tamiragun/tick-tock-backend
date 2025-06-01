import { Router } from 'express';
const router = Router();
import { register, login } from '../controllers/user.controller.js';

// Public routes; no auth needed
router.post('/register', register);
router.post('/login', login);

export default router;