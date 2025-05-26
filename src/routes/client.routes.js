import { Router } from 'express';
const router = Router();
import { create, getAll, getOne, update, remove } from '../controllers/client.controller.js';

router.post('/', create);
router.get('/', getAll);
router.get('/:id', getOne);
router.put('/:id', update);
router.delete('/:id', remove);

export default router; 