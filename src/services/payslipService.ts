import { PrismaClient } from "@prisma/client";
import { NotFoundError } from "../utils/customErrors";

const prisma = new PrismaClient();

export const getPayslip = async ({employeeId, payrollPeriodId}: { employeeId: number; payrollPeriodId: number; }) => {
	const payslip = await prisma.payslip.findFirst({
		where: { employeeId, payrollPeriodId },
		include: { employee: true }
	});
	if (!payslip) throw new NotFoundError("Payslip not found");

	const reimbursements = await prisma.reimbursement.findMany({
		where: {
			employeeId,
			createdAt: {
				gte: payslip.employee.createdAt,
				lte: payslip.employee.updatedAt
			}
		}
	});

	return {
		employee: {
			id: payslip.employeeId,
			username: payslip.employee.username,
			salary: payslip.employee.salary
		},
		attendanceDays: payslip.attendanceDays,
		overtimeHours: payslip.overtimeHours,
		reimbursementTotal: payslip.reimbursementTotal,
		reimbursements,
		takeHomePay: payslip.takeHomePay
	};
};
