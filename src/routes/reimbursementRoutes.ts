// Reimbursement Module: Manages reimbursement requests

import { Router } from 'express';
import express from 'express';
import { submitReimbursementController, updateReimbursementController } from '../controllers/reimbursementController';
import { isEmployee } from '../middleware/authMiddleware';

const router = Router();

// POST /reimbursement - Submit a new reimbursement (employee only)
router.post('/', isEmployee as express.RequestHandler, submitReimbursementController);

// PUT /reimbursement/:id - Update a reimbursement request
router.put('/:id', updateReimbursementController);

export default router;
