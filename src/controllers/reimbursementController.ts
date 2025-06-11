import { Request, Response, RequestHandler } from 'express';
import { submitReimbursement, updateReimbursement } from '../services/reimbursementService';
import { validator } from '../utils/validatorUtil';
import { ReimbursementReqDto } from '../schemas/reimbursementSchema';
import { ValidationError } from '../utils/customErrors';

interface AuthenticatedRequest extends Request {
	user?: { userId: number; role: string };
}

export const submitReimbursementController: RequestHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
	const user = req.user;
	const employeeId = user?.userId;
	if (employeeId === undefined) {
		throw new ValidationError('Employee ID is required');
	}
	try {
		const validated = await validator(ReimbursementReqDto, req.body);
		const reimbursementId = await submitReimbursement({
			...validated,
			employeeId,
			createdById: employeeId,
			createdByType: "Employee",
			request: req
		});
		res.status(201).json({ message: 'Reimbursement submitted', data: { id: reimbursementId } });
	} catch (error) {
		throw error;
	}
};

export const updateReimbursementController: RequestHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
	const user = req.user;
	const reimbursementId = Number(req.params.id);
	try {
		const validated = await validator(ReimbursementReqDto, req.body);
		let updatedById: number | undefined;
		let updatedByType: string | undefined;
		if (user?.role === 'admin') {
			updatedById = user.userId;
			updatedByType = 'Admin';
		} else if (user?.role === 'employee') {
			updatedById = user.userId;
			updatedByType = 'Employee';
		}
		await updateReimbursement({
			id: reimbursementId,
			amount: validated.amount,
			description: validated.description,
			updatedById,
			updatedByType,
			request: req
		});
		res.status(200).json({ message: 'Reimbursement updated' });
	} catch (error) {
		throw error;
	}
};
