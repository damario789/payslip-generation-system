import { PrismaClient } from '@prisma/client';
import { ConflictError, NotFoundError, ValidationError } from '../utils/customErrors';
import { logAudit } from '../utils/auditLog';
import { Request } from 'express';

const prisma = new PrismaClient();

interface AttendanceSubmission {
	date: string; // ISO date string
	employeeId?: number;
	createdById?: number;
	createdByType?: string;
	request: Request;
}

export const submitAttendance = async (data: AttendanceSubmission) => {
	const { date, employeeId, createdById, createdByType, request } = data;
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

	let attendanceId: number | undefined;
	await prisma.$transaction(async (tx) => {
		const inserted = await tx.$queryRaw<{ id: number }[]>`
			INSERT INTO "Attendance" (
				"employeeId", "date", "createdAt", "updatedAt",
				"createdById", "createdByType", "updatedById", "updatedByType"
			)
			VALUES (
				${employeeId}, ${submissionDate}, NOW(), NOW(),
				${createdById}, ${createdByType}, ${createdById}, ${createdByType}
			)
			RETURNING id
		`;
		attendanceId = inserted[0]?.id;
		await logAudit({
			action: 'CREATE_ATTENDANCE',
			entityId: attendanceId,
			entityType: 'Attendance',
			userId: createdById!,
			userType: createdByType as 'Admin' | 'Employee',
			request,
			prismaClient: tx
		});
	});
	return attendanceId;
};

interface AttendanceUpdate {
	id: number;
	date: string;
	updatedById?: number;
	updatedByType?: string;
	request: Request;
}

export const updateAttendance = async (data: AttendanceUpdate) => {
	const { id, date, updatedById, updatedByType, request } = data;
	const newDate = new Date(date);
	const dayOfWeek = newDate.getDay();

	if (dayOfWeek === 0 || dayOfWeek === 6) {
		throw new ValidationError('Cannot update attendance to a weekend');
	}

	// Check if attendance exists
	const attendance = await prisma.attendance.findUnique({ where: { id } });
	if (!attendance) {
		throw new NotFoundError('Attendance record not found');
	}

	// Check for duplicate attendance for the same employee and date (excluding current record)
	const existing = await prisma.$queryRaw<{ id: number }[]>`
		SELECT id FROM "Attendance"
		WHERE "employeeId" = ${attendance.employeeId}
		AND DATE("date") = DATE(${newDate})
		AND id != ${id}
	`;
	if (existing.length > 0) {
		throw new ConflictError('Attendance already exists for this day');
	}

	await prisma.$transaction(async (tx) => {
		await tx.attendance.update({
			where: { id },
			data: {
				date: newDate,
				updatedById,
				updatedByType,
			},
		});
		await logAudit({
			action: 'UPDATE_ATTENDANCE',
			entityId: id,
			entityType: 'Attendance',
			userId: updatedById!,
			userType: updatedByType as 'Admin' | 'Employee',
			request,
			prismaClient: tx
		});
	});
};