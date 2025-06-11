import { PrismaClient } from '@prisma/client';
import { Request } from 'express';

const prisma = new PrismaClient();

interface AuditLogData {
    action: string;
    entityId: number;
    entityType: string;
    userId: number;
    userType: 'Admin' | 'Employee';
    request: Request;
    prismaClient?: any; // Accept any client (transaction or PrismaClient)
}

export const logAudit = async (data: AuditLogData) => {
    const { action, entityId, entityType, userId, userType, request, prismaClient } = data;
    const requestId = request.id || 'unknown'; // request.id is set by middleware
    const ipAddress = request.ip || 'unknown';

    const client = prismaClient || prisma; // Use transaction client if provided

    await client.auditLog.create({
        data: {
            action,
            entityId,
            entityType,
            userId,
            userType,
            requestId,
            ipAddress,
            createdAt: new Date(),
        },
    });
};