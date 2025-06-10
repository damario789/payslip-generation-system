import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../utils/customErrors';

const prisma = new PrismaClient();

const generateToken = (userId: number, role: string) => {
	return jwt.sign({ userId, role }, process.env.JWT_SECRET!, { expiresIn: '1h' });
};

export const loginEmployee = async (username: string, password: string) => {
	const employee = await prisma.employee.findUnique({ where: { username } });
	if (!employee) throw new UnauthorizedError('Invalid credentials');
	const isPasswordValid = await bcrypt.compare(password, employee.password);
	if (!isPasswordValid) throw new UnauthorizedError('Invalid credentials');
	return generateToken(employee.id, 'employee');
};

export const loginAdmin = async (username: string, password: string) => {
	const admin = await prisma.admin.findUnique({ where: { username } });
	if (!admin) throw new UnauthorizedError('Invalid credentials');
	const isPasswordValid = await bcrypt.compare(password, admin.password);
	if (!isPasswordValid) throw new UnauthorizedError('Invalid credentials');
	return generateToken(admin.id, 'admin');
};