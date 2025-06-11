// Auth Module: Handles authentication for employees and admins

import { Router } from 'express';
import { employeeLogin, adminLogin } from '../controllers/authController';

const router = Router();

// POST /auth/employee/login - Employee login, returns JWT on success
router.post('/employee/login', employeeLogin);

// POST /auth/admin/login - Admin login, returns JWT on success
router.post('/admin/login', adminLogin);

export default router;