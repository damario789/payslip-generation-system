import { PrismaClient } from '@prisma/client';
import { logAudit } from '../utils/auditLog';
import { Request } from 'express';
import { NotFoundError } from '../utils/customErrors';

const prisma = new PrismaClient();

interface ReimbursementSubmission {
	amount: number;
	description: string;
	employeeId: number;
	createdById: number;
	createdByType: string;
	request: Request;
}

export const submitReimbursement = async (data: ReimbursementSubmission) => {
	const { amount, description, employeeId, createdById, createdByType, request } = data;

	let reimbursementId: number | undefined;
	await prisma.$transaction(async (tx) => {
		const reimbursement = await tx.reimbursement.create({
			data: {
				amount,
				description,
				createdAt: new Date(),
				updatedAt: new Date(),
				createdById: createdById,
				createdByType: createdByType,
				updatedById: createdById,
				updatedByType: createdByType,
				employeeId
			},
		});
		reimbursementId = reimbursement.id;
		await logAudit({
			action: 'CREATE_REIMBURSEMENT',
			entityId: reimbursement.id,
			entityType: 'Reimbursement',
			userId: createdById,
			userType: createdByType as 'Admin' | 'Employee',
			request,
			prismaClient: tx
		});
	});
	return reimbursementId;
};

interface ReimbursementUpdate {
	id: number;
	amount: number;
	description: string;
	updatedById?: number;
	updatedByType?: string;
	request: Request;
}

export const updateReimbursement = async (data: ReimbursementUpdate) => {
	const { id, amount, description, updatedById, updatedByType, request } = data;

	// Check if reimbursement exists
	const reimbursement = await prisma.reimbursement.findUnique({ where: { id } });
	if (!reimbursement) {
		throw new NotFoundError('Reimbursement record not found');
	}

	await prisma.$transaction(async (tx) => {
		await tx.reimbursement.update({
			where: { id },
			data: {
				amount,
				description,
				updatedById,
				updatedByType,
				updatedAt: new Date(),
			},
		});
		await logAudit({
			action: 'UPDATE_REIMBURSEMENT',
			entityId: id,
			entityType: 'Reimbursement',
			userId: updatedById!,
			userType: updatedByType as 'Admin' | 'Employee',
			request,
			prismaClient: tx
		});
	});
};
