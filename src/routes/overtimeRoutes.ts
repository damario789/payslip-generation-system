// Overtime Module: Handles overtime submissions and updates

import { Router } from 'express';
import express from 'express';
import { submitOvertimeController, updateOvertimeController } from '../controllers/overtimeController';
import { isEmployee, isAdmin } from '../middleware/authMiddleware';

const router = Router();

// POST /overtime - Submit overtime request (employee only)
router.post('/', isEmployee as express.RequestHandler, submitOvertimeController);

// PUT /overtime/:id - Update an overtime request
router.put('/:id', updateOvertimeController);

export default router;