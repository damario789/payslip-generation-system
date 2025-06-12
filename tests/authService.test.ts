import { loginEmployee, loginAdmin } from '../src/services/authService';
import { UnauthorizedError } from '../src/utils/customErrors';
import bcrypt from 'bcrypt';

jest.mock('@prisma/client', () => {
  const mockPrisma = {
    employee: {
      findUnique: jest.fn(),
    },
    admin: {
      findUnique: jest.fn(),
    }
  };
  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

jest.mock('bcrypt');
jest.mock('../src/utils/auditLog', () => ({
  logAudit: jest.fn(),
}));

const prismaMock = new (require('@prisma/client') as any).PrismaClient();

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw UnauthorizedError if employee not found', async () => {
    prismaMock.employee.findUnique.mockResolvedValueOnce(null);
    await expect(loginEmployee('user', 'pass', {} as any)).rejects.toThrow(UnauthorizedError);
  });

  it('should throw UnauthorizedError if admin not found', async () => {
    prismaMock.admin.findUnique.mockResolvedValueOnce(null);
    await expect(loginAdmin('admin', 'pass', {} as any)).rejects.toThrow(UnauthorizedError);
  });

  it('should throw UnauthorizedError if employee password invalid', async () => {
    prismaMock.employee.findUnique.mockResolvedValueOnce({ id: 1, password: 'hash' });
    (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);
    await expect(loginEmployee('user', 'wrong', {} as any)).rejects.toThrow(UnauthorizedError);
  });

  it('should throw UnauthorizedError if admin password invalid', async () => {
    prismaMock.admin.findUnique.mockResolvedValueOnce({ id: 1, password: 'hash' });
    (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);
    await expect(loginAdmin('admin', 'wrong', {} as any)).rejects.toThrow(UnauthorizedError);
  });
});
