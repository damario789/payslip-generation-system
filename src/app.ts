import express from 'express';
import authRoutes from './routes/authRoutes';
import { authenticateToken, addRequestId } from './middleware/authMiddleware';
import attendanceRoutes from './routes/attendanceRoutes';
import { errorHandler } from './middleware/errorMiddleware';
import overtimeRoutes from './routes/overtimeRoutes';
import reimbursementRoutes from './routes/reimbursementRoutes';
import payrollRoutes from './routes/payrollRoutes';
import payslipRoutes from './routes/payslipRoutes';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(addRequestId as express.RequestHandler);


// Routes
app.use('/auth', authRoutes);

//use authentication middleware for all routes except auth
app.use(authenticateToken as express.RequestHandler);

app.use('/attendance', attendanceRoutes);
app.use('/overtime', overtimeRoutes);
app.use('/reimbursement', reimbursementRoutes);
app.use('/payroll', payrollRoutes);
app.use('/payslip', payslipRoutes);
app.use(errorHandler as express.ErrorRequestHandler);

export default module.exports = app;