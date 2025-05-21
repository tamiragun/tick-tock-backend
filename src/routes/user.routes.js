import { Router } from 'express';
const router = Router();
import { register } from '../controllers/user.controller.js';

router.post('/register', register);

export default router;