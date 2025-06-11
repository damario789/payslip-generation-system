import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../utils/customErrors';
import { logAudit } from '../utils/auditLog';
import { Request } from 'express';

const prisma = new PrismaClient();

const generateToken = (userId: number, role: string) => {
	return jwt.sign({ userId, role }, process.env.JWT_SECRET!, { expiresIn: '1h' });
};

export const loginEmployee = async (username: string, password: string, request: Request) => {
	const employee = await prisma.employee.findUnique({ where: { username } });
	if (!employee) throw new UnauthorizedError('Invalid credentials');
	const isPasswordValid = await bcrypt.compare(password, employee.password);
	if (!isPasswordValid) throw new UnauthorizedError('Invalid credentials');
	const token = generateToken(employee.id, 'employee');
	await logAudit({
		action: 'EMPLOYEE_LOGIN',
		entityId: employee.id,
		entityType: 'Employee',
		userId: employee.id,
		userType: 'Employee',
		request
	});
	return token;
};

export const loginAdmin = async (username: string, password: string, request: Request) => {
	const admin = await prisma.admin.findUnique({ where: { username } });
	if (!admin) throw new UnauthorizedError('Invalid credentials');
	const isPasswordValid = await bcrypt.compare(password, admin.password);
	if (!isPasswordValid) throw new UnauthorizedError('Invalid credentials');
	const token = generateToken(admin.id, 'admin');
	await logAudit({
		action: 'ADMIN_LOGIN',
		entityId: admin.id,
		entityType: 'Admin',
		userId: admin.id,
		userType: 'Admin',
		request
	});
	return token;
};