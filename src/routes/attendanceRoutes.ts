import { Router } from 'express';
import express from 'express';
import { submitAttendanceController } from '../controllers/attendanceController';
import { isEmployee } from '../middleware/authMiddleware';

const router = Router();
router.post('/', isEmployee as express.RequestHandler, submitAttendanceController);

export default router;