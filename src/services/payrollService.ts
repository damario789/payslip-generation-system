import { PrismaClient } from "@prisma/client";
import { Request } from "express";
import { logAudit } from "../utils/auditLog";
import { ConflictError, NotFoundError } from "../utils/customErrors";

const prisma = new PrismaClient();

export const createPayrollPeriod = async ({
	startDate,
	endDate,
	createdById,
	updatedById,
	request
}: {
	startDate: string;
	endDate: string;
	createdById: number;
	updatedById: number;
	request: Request;
}) => {
	// Check if period overlaps with any existing period
	const overlap = await prisma.payrollPeriod.findFirst({
		where: {
			startDate: { lte: new Date(endDate) },
			endDate: { gte: new Date(startDate) }
		}
	});
	if (overlap) {
		throw new ConflictError("Payroll period overlaps with an existing period");
	}

	// Check if period already exists
	const existing = await prisma.payrollPeriod.findFirst({
		where: {
			startDate: new Date(startDate),
			endDate: new Date(endDate)
		}
	});
	if (existing) {
		throw new ConflictError("Payroll period with the same start and end date already exists");
	}

	const period = await prisma.payrollPeriod.create({
		data: {
			startDate: new Date(startDate),
			endDate: new Date(endDate),
			createdById,
			updatedById
		}
	});
	await logAudit({
		action: "CREATE_PAYROLL_PERIOD",
		entityId: period.id,
		entityType: "PayrollPeriod",
		userId: createdById,
		userType: "Admin",
		request,
		prismaClient: prisma
	});
	return period;
};

export const runPayroll = async ({
	payrollPeriodId,
	adminId,
	request
}: {
	payrollPeriodId: number;
	adminId: number;
	request: Request;
}) => {
	const period = await prisma.payrollPeriod.findUnique({ where: { id: payrollPeriodId } });
	if (!period) throw new NotFoundError("Payroll period not found");
	if (period.status === "closed") throw new ConflictError("Payroll already processed");

	const employees = await prisma.employee.findMany();

	// Bulk fetch attendance, overtime, reimbursement

	// Attendance days
	// Query raw
	// const attendanceDays = await prisma.$queryRaw<{ count: number }[]>`
	//     SELECT "employeeId", COUNT(*) as count FROM "Attendance"
	//     WHERE "date" >= ${period.startDate}
	//     AND "date" <= ${period.endDate}
	//     GROUP BY "employeeId"
	// `;
	const attendances = await prisma.attendance.groupBy({
		by: ['employeeId'],
		where: {
			date: { gte: period.startDate, lte: period.endDate }
		},
		_count: { employeeId: true }
	});

	// Overtime hours
	// Query raw
	// const overtime = await prisma.$queryRaw<{ employeeId: number, hours: number }[]>`
	//     SELECT "employeeId", SUM("hours") as "hours" FROM "Overtime"
	//     WHERE "date" >= ${period.startDate}
	//     AND "date" <= ${period.endDate}
	//     GROUP BY "employeeId"
	// `;
	const overtimes = await prisma.overtime.groupBy({
		by: ['employeeId'],
		where: {
			date: { gte: period.startDate, lte: period.endDate }
		},
		_sum: { hours: true }
	});

	// Reimbursement total
	// Query raw
	// const reimbursement = await prisma.$queryRaw<{ employeeId: number, amount: number }[]>`
	//     SELECT "employeeId", SUM("amount") as "amount" FROM "Reimbursement"
	//     WHERE "createdAt" >= ${period.startDate}
	//     AND "createdAt" <= ${period.endDate}
	//     GROUP BY "employeeId"
	// `;
	const reimbursements = await prisma.reimbursement.groupBy({
		by: ['employeeId'],
		where: {
			createdAt: { gte: period.startDate, lte: period.endDate }
		},
		_sum: { amount: true }
	});

	// Map for quick lookup
	const attendanceMap = new Map(attendances.map(a => [a.employeeId, a._count.employeeId]));
	const overtimeMap = new Map(overtimes.map(o => [o.employeeId, o._sum.hours || 0]));
	const reimbursementMap = new Map(reimbursements.map(r => [r.employeeId, r._sum.amount || 0]));
    // Why use new Map? I think .map() already makes a new array, so why not just use an array?
    // because we need quick lookups by employeeId, using a Map allows O(1) access time

	const totalWorkingDays = getWorkingDays(period.startDate, period.endDate);

	for (const employee of employees) {
		const attendanceDays = attendanceMap.get(employee.id) || 0;
		const overtimeHours = overtimeMap.get(employee.id) || 0;
		const reimbursementTotal = reimbursementMap.get(employee.id) || 0;

		const proratedSalary = (employee.salary * attendanceDays) / totalWorkingDays;
		const overtimePay = overtimeHours * (employee.salary / totalWorkingDays / 8) * 2;
		const takeHomePay = proratedSalary + overtimePay + reimbursementTotal;

		await prisma.payslip.create({
			data: {
				employeeId: employee.id,
				payrollPeriodId: period.id,
				attendanceDays,
				overtimeHours,
				reimbursementTotal,
				takeHomePay,
				createdById: adminId,
				updatedById: adminId
			}
		});
	}
	await prisma.payrollPeriod.update({
		where: { id: payrollPeriodId },
		data: { status: "closed", updatedById: adminId }
	});
	await logAudit({
		action: "RUN_PAYROLL",
		entityId: payrollPeriodId,
		entityType: "PayrollPeriod",
		userId: adminId,
		userType: "Admin",
		request,
		prismaClient: prisma
	});
};

function getWorkingDays(start: Date, end: Date): number {
	let count = 0;
	const d = new Date(start);
	while (d <= end) {
		const day = d.getDay();
		if (day !== 0 && day !== 6) count++;
		d.setDate(d.getDate() + 1);
	}
	return count;
}

export const getPayrollSummary = async ({ payrollPeriodId }: { payrollPeriodId: number }) => {
	// Query raw for summary and total
	const summary: { employeeId: number, username: string, takeHomePay: number }[] = await prisma.$queryRaw`
		SELECT p."employeeId", e."username", SUM(p."takeHomePay") as "takeHomePay"
		FROM "Payslip" p
		JOIN "Employee" e ON p."employeeId" = e."id"
		WHERE p."payrollPeriodId" = ${payrollPeriodId}
		GROUP BY p."employeeId", e."username"
	`;

	const totalResult: { totalTakeHomePay: number }[] = await prisma.$queryRaw`
		SELECT SUM("takeHomePay") as "totalTakeHomePay"
		FROM "Payslip"
		WHERE "payrollPeriodId" = ${payrollPeriodId}
	`;

	const totalTakeHomePay = totalResult[0]?.totalTakeHomePay || 0;

	return { summary, totalTakeHomePay };
};
