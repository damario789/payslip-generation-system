import { createPayrollPeriod } from '../src/services/payrollService';
import { ConflictError } from '../src/utils/customErrors';

jest.mock('@prisma/client', () => {
  const mockPrisma = {
    payrollPeriod: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    }
  };
  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

jest.mock('../src/utils/auditLog', () => ({
  logAudit: jest.fn(),
}));

const prismaMock = new (require('@prisma/client') as any).PrismaClient();

describe('Payroll Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw ConflictError if period overlaps', async () => {
    prismaMock.payrollPeriod.findFirst.mockResolvedValueOnce({ id: 1 });
    await expect(createPayrollPeriod({
      startDate: '2025-06-01',
      endDate: '2025-06-30',
      createdById: 1,
      updatedById: 1,
      request: {} as any
    })).rejects.toThrow(ConflictError);
  });

  it('should throw ConflictError if period already exists', async () => {
    prismaMock.payrollPeriod.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 2 });
    await expect(createPayrollPeriod({
      startDate: '2025-06-01',
      endDate: '2025-06-30',
      createdById: 1,
      updatedById: 1,
      request: {} as any
    })).rejects.toThrow(ConflictError);
  });
});
