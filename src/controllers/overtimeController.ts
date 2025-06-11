import { Request, Response } from 'express';
import { OvertimeReqDto } from '../schemas/overtimeSchema';
import { validator } from '../utils/validatorUtil';
import { submitOvertime, updateOvertime } from '../services/overtimeService';

interface OvertimeRequest extends Request {
	user?: { userId: number, role: string };
}

export const submitOvertimeController = async (req: OvertimeRequest, res: Response): Promise<void> => {
	try {
		const user = req.user;
		const employeeId = user?.userId;
		const { date, hours } = await validator(OvertimeReqDto, req.body);

		await submitOvertime({
			date,
			hours,
			employeeId: employeeId!,
			createdById: employeeId!,
			createdByType: 'Employee',
			request: req
		});
		res.status(201).json({ message: 'Overtime submitted' });
	} catch (error) {
		throw error;
	}
};

export const updateOvertimeController = async (req: OvertimeRequest, res: Response): Promise<void> => {
	try {
		const user = req.user;
		const overtimeId = Number(req.params.id);
		const { date, hours } = await validator(OvertimeReqDto, req.body);

		let updatedById: number | undefined;
		let updatedByType: 'Admin' | 'Employee' | undefined;
		if (user?.role === 'admin') {
			updatedById = user.userId;
			updatedByType = 'Admin';
		} else if (user?.role === 'employee') {
			updatedById = user.userId;
			updatedByType = 'Employee';
		}

		await updateOvertime({
			id: overtimeId,
			date,
			hours,
			updatedById: updatedById!,
			updatedByType: updatedByType!,
			request: req
		});
		res.status(200).json({ message: 'Overtime updated' });
	} catch (error) {
		throw error;
	}
};