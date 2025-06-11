import { Router } from 'express';
import express from 'express';
import { submitOvertimeController, updateOvertimeController } from '../controllers/overtimeController';
import { isEmployee, isAdmin } from '../middleware/authMiddleware';

const router = Router();
router.post('/', isEmployee as express.RequestHandler, submitOvertimeController);
router.put('/:id', updateOvertimeController);

export default router;