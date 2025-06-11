import { Request, Response, RequestHandler } from "express";
import { PayrollPeriodReqDto, RunPayrollReqDto } from "../schemas/payrollSchema";
import { validator } from "../utils/validatorUtil";
import { createPayrollPeriod, runPayroll, getPayrollSummary } from "../services/payrollService";
import { ValidationError } from "../utils/customErrors";

interface AuthenticatedRequest extends Request {
	user?: { userId: number; role: string };
}

export const createPayrollPeriodController: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
	const user = req.user;
	if (!user || user.role !== "admin") throw new ValidationError("Admin only");
	const validated = await validator(PayrollPeriodReqDto, req.body);
	const period = await createPayrollPeriod({
		...validated,
		createdById: user.userId,
		updatedById: user.userId,
		request: req
	});
	res.status(201).json({ message: "Payroll period created", data: period });
};

export const runPayrollController: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
	const user = req.user;
	if (!user || user.role !== "admin") throw new ValidationError("Admin only");
	const validated = await validator(RunPayrollReqDto, req.body);
	await runPayroll({
		payrollPeriodId: validated.payrollPeriodId,
		adminId: user.userId,
		request: req
	});
	res.status(200).json({ message: "Payroll processed" });
};

export const payrollSummaryController: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
	const user = req.user;
	if (!user || user.role !== "admin") throw new ValidationError("Admin only");
	const payrollPeriodId = Number(req.query.payrollPeriodId);
	const summary = await getPayrollSummary({ payrollPeriodId });
	res.status(200).json({ data: summary });
};
