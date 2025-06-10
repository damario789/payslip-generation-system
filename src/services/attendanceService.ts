import { PrismaClient } from '@prisma/client';
import { ConflictError, ValidationError } from '../utils/customErrors';

const prisma = new PrismaClient();

interface AttendanceSubmission {
	date: string; // ISO date string
	employeeId?: number;
}

export const submitAttendance = async (data: AttendanceSubmission) => {
	const { date, employeeId } = data;
	const submissionDate = new Date(date);
	const dayOfWeek = submissionDate.getDay();

	if (dayOfWeek === 0 || dayOfWeek === 6) {
		throw new ValidationError('Cannot submit attendance on weekends');
	}

	const existing = await prisma.$queryRaw<{ id: number }[]>`
		SELECT id FROM "Attendance"
		WHERE "employeeId" = ${employeeId}
		AND DATE("date") = DATE(${submissionDate})
  `;

	if (existing.length > 0) {
		throw new ConflictError('Attendance already submitted for this day');
	}

	await prisma.$queryRaw`
		INSERT INTO "Attendance" ("employeeId", "date", "createdAt", "updatedAt")
		VALUES (${employeeId}, ${submissionDate}, NOW(), NOW())
  `;
};