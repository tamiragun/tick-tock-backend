import express from 'express';
import { create, getAll, getOne, update, remove } from '../controllers/project.controller.js';

const router = express.Router();

// Create a new project
router.post('/', create);

// Get all projects
router.get('/', getAll);

// Get a single project by ID
router.get('/:id', getOne);

// Update a project
router.put('/:id', update);

// Delete a project
router.delete('/:id', remove);

export default router; 