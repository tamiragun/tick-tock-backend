import { Router } from 'express';
const router = Router();
import userRoutes from './user.routes.js';

router.use('/users', userRoutes);
// Add other resource routes...

export default router;