import { PrismaClient } from '@prisma/client';
import { logAudit } from '../utils/auditLog';
import { Request } from 'express';
import { NotFoundError } from '../utils/customErrors';

const prisma = new PrismaClient();

interface OvertimeSubmission {
	date: string; // ISO date string
	employeeId: number;
	hours: number;
	createdById: number;
	createdByType: 'Admin' | 'Employee';
	request: Request;
}

export const submitOvertime = async (data: OvertimeSubmission) => {
	const { date, hours, employeeId, createdById, createdByType, request } = data;

	let overtimeId: number | undefined;
	await prisma.$transaction(async (tx) => {
		const overtime = await tx.overtime.create({
			data: {
				employeeId,
				date: new Date(date),
				hours: hours,
				createdAt: new Date(),
				updatedAt: new Date(),
				createdById,
				createdByType,
				updatedById: createdById,
				updatedByType: createdByType
			},
		});
		overtimeId = overtime.id;
		await logAudit({
			action: 'CREATE_OVERTIME',
			entityId: overtime.id,
			entityType: 'Overtime',
			userId: createdById,
			userType: createdByType,
			request,
			prismaClient: tx
		});
	});
	return overtimeId;
};

interface OvertimeUpdate {
	id: number;
	date: string;
	hours: number;
	updatedById: number;
	updatedByType: 'Admin' | 'Employee';
	request: Request;
}

export const updateOvertime = async (data: OvertimeUpdate) => {
	const { id, date, hours, updatedById, updatedByType, request } = data;

	// Check if overtime exists
	const overtime = await prisma.overtime.findUnique({ where: { id } });
	if (!overtime) {
		throw new NotFoundError('Overtime record not found');
	}

	await prisma.$transaction(async (tx) => {
		await tx.overtime.update({
			where: { id },
			data: {
				date: new Date(date),
				hours,
				updatedById,
				updatedByType,
				updatedAt: new Date(),
			},
		});
		await logAudit({
			action: 'UPDATE_OVERTIME',
			entityId: id,
			entityType: 'Overtime',
			userId: updatedById,
			userType: updatedByType,
			request,
			prismaClient: tx
		});
	});
};