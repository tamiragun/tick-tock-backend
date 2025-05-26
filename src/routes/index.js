import { Router } from 'express';
const router = Router();
import userRoutes from './user.routes.js';
import clientRoutes from './client.routes.js';

router.use('/users', userRoutes);
router.use('/clients', clientRoutes);
// Add other resource routes...

export default router;