// Attendance Module: Manages employee attendance records

import { Router } from 'express';
import express from 'express';
import { submitAttendanceController, updateAttendanceController } from '../controllers/attendanceController';
import { isEmployee, isAdmin } from '../middleware/authMiddleware';

const router = Router();

// POST /attendance - Submit attendance (employee only)
router.post('/', isEmployee as express.RequestHandler, submitAttendanceController);

// PUT /attendance/:id - Update an existing attendance record
router.put('/:id', updateAttendanceController);

export default router;