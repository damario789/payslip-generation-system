import { Request, Response, RequestHandler } from "express";
import { PayslipReqDto } from "../schemas/payslipSchema";
import { validator } from "../utils/validatorUtil";
import { getPayslip } from "../services/payslipService";
import { ValidationError } from "../utils/customErrors";

interface AuthenticatedRequest extends Request {
	user?: { userId: number; role: string };
}

export const generatePayslipController: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
	const user = req.user;
	if (!user || user.role !== "employee") throw new ValidationError("Employee only");
	const validated = await validator(PayslipReqDto, req.body);
	const payslip = await getPayslip({
		employeeId: user.userId,
		payrollPeriodId: validated.payrollPeriodId
	});
	res.status(200).json({ data: payslip });
};
