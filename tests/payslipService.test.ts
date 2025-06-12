import { getPayslip } from '../src/services/payslipService';
import { NotFoundError } from '../src/utils/customErrors';

jest.mock('@prisma/client', () => {
  const mockPrisma = {
    payslip: {
      findFirst: jest.fn(),
    },
    reimbursement: {
      findMany: jest.fn(),
    }
  };
  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

const prismaMock = new (require('@prisma/client') as any).PrismaClient();

describe('Payslip Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw NotFoundError if payslip not found', async () => {
    prismaMock.payslip.findFirst.mockResolvedValueOnce(null);
    await expect(getPayslip({ employeeId: 1, payrollPeriodId: 1 })).rejects.toThrow(NotFoundError);
  });

  it('should return payslip data if found', async () => {
    prismaMock.payslip.findFirst.mockResolvedValueOnce({
      employeeId: 1,
      payrollPeriodId: 1,
      attendanceDays: 20,
      overtimeHours: 5,
      reimbursementTotal: 100,
      takeHomePay: 2000,
      employee: { id: 1, username: 'user', salary: 1000, createdAt: new Date(), updatedAt: new Date() }
    });
    prismaMock.reimbursement.findMany.mockResolvedValueOnce([]);
    const result = await getPayslip({ employeeId: 1, payrollPeriodId: 1 });
    expect(result.employee.id).toBe(1);
    expect(result.attendanceDays).toBe(20);
    expect(prismaMock.payslip.findFirst).toHaveBeenCalled();
    expect(prismaMock.reimbursement.findMany).toHaveBeenCalled();
  });
});
