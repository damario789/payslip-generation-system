import { Request, Response, RequestHandler } from 'express';
import { submitAttendance } from '../services/attendanceService';
import { validator } from '../utils/validatorUtil';
import { AttendanceReqDto } from '../schemas/attendanceSchema';

interface AuthenticatedRequest extends Request {
	user?: { userId: number };
}

export const submitAttendanceController: RequestHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
	const user = req.user;
	const employeeId = user?.userId;
	try {
		const validated = await validator(AttendanceReqDto, req.body)
		await submitAttendance({ ...validated, employeeId });
		res.status(201).json({ message: 'Attendance submitted' });
	} catch (error) {
		throw error;
	}
};