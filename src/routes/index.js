import { Router } from 'express';
const router = Router();
import userRoutes from './user.routes.js';
import clientRoutes from './client.routes.js';
import projectRoutes from './project.routes.js';
import sessionRoutes from './session.routes.js';

router.use('/users', userRoutes);
router.use('/clients', clientRoutes);
router.use('/projects', projectRoutes);
router.use('/sessions', sessionRoutes);

export default router;