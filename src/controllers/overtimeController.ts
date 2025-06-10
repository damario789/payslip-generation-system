import { Request, Response } from 'express';
import { OvertimeReqDto } from '../schemas/overtimeSchema';
import { validator } from '../utils/validatorUtil';
import { submitOvertime } from '../services/overtimeService';

interface OvertimeRequest extends Request {
	user?: { userId: number };
}

export const submitOvertimeController = async (req: OvertimeRequest, res: Response): Promise<void> => {
	try {
		const user = req.user;
		const employeeId = user?.userId;
		const { date, hours } = await validator(OvertimeReqDto, req.body)

		await submitOvertime({ date, hours, employeeId });
		res.status(201).json({ message: 'Overtime submitted' });
	} catch (error) {
		throw error;
	}
};