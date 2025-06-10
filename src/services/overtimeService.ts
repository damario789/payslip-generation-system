import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface OvertimeSubmission {
	date: string; // ISO date string
	employeeId?: number; // made required
	hours: number;
}

export const submitOvertime = async (data: OvertimeSubmission) => {
	const { date, hours, employeeId } = data;
	if (employeeId === undefined) {
		throw new Error('employeeId is required');
	}
	await prisma.overtime.create({
		data: {
			employeeId,
			date: new Date(date),
			hours: hours,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	});
};