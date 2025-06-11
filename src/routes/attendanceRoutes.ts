import { Router } from 'express';
import express from 'express';
import { submitAttendanceController, updateAttendanceController } from '../controllers/attendanceController';
import { isEmployee, isAdmin } from '../middleware/authMiddleware';

const router = Router();
router.post('/', isEmployee as express.RequestHandler, submitAttendanceController);
router.put('/:id', updateAttendanceController);

export default router;