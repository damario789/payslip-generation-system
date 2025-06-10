import { Router } from 'express';
import { employeeLogin, adminLogin } from '../controllers/authController';

const router = Router();

router.post('/employee/login', employeeLogin);
router.post('/admin/login', adminLogin);

export default router;