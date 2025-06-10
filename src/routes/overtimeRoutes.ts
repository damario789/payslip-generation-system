import { Router } from 'express';
import express from 'express';
import { submitOvertimeController } from '../controllers/overtimeController';
import { isEmployee } from '../middleware/authMiddleware';

const router = Router();
router.post('/', isEmployee as express.RequestHandler, submitOvertimeController);

export default router;
