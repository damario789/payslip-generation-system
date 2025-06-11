import { Request, Response, RequestHandler } from 'express';
import { submitAttendance, updateAttendance } from '../services/attendanceService';
import { validator } from '../utils/validatorUtil';
import { AttendanceReqDto } from '../schemas/attendanceSchema';

interface AuthenticatedRequest extends Request {
	user?: { userId: number; role: string };
}

export const submitAttendanceController: RequestHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
	const user = req.user;
	const employeeId = user?.userId;
	try {
		const validated = await validator(AttendanceReqDto, req.body)
		const attendanceId = await submitAttendance({
			...validated,
			employeeId,
			createdById: employeeId,
			createdByType: "Employee",
			request: req
		});
		res.status(201).json({ message: 'Attendance submitted', data: { id: attendanceId } });
	} catch (error) {
		throw error;
	}
};

export const updateAttendanceController: RequestHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
	const user = req.user;
	const attendanceId = Number(req.params.id);
	try {
		const validated = await validator(AttendanceReqDto, req.body);
		let updatedById: number | undefined;
		let updatedByType: string | undefined;
		if (user?.role === 'admin') {
			updatedById = user.userId;
			updatedByType = 'Admin';
		} else if (user?.role === 'employee') {
			updatedById = user.userId;
			updatedByType = 'Employee';
		}
		await updateAttendance({
			id: attendanceId,
			date: validated.date,
			updatedById,
			updatedByType,
			request: req
		});
		res.status(200).json({ message: 'Attendance updated' });
	} catch (error) {
		throw error;
	}
};