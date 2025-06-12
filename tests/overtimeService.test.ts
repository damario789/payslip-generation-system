import { submitOvertime, updateOvertime } from '../src/services/overtimeService';
import { NotFoundError } from '../src/utils/customErrors';

jest.mock('@prisma/client', () => {
  const mockPrisma = {
    overtime: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn().mockImplementation((callback) => {
      const mockTx = {
        overtime: {
          create: mockPrisma.overtime.create,
          findUnique: mockPrisma.overtime.findUnique,
          update: mockPrisma.overtime.update,
        },
      };
      return callback(mockTx);
    }),
  };
  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

jest.mock('../src/utils/auditLog', () => ({
  logAudit: jest.fn(),
}));

const prismaMock = new (require('@prisma/client') as any).PrismaClient();

describe('Overtime Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should submit overtime and return id', async () => {
    prismaMock.overtime.create.mockResolvedValueOnce({ id: 1 });
    const result = await submitOvertime({
      date: '2025-06-10',
      hours: 2,
      employeeId: 1,
      createdById: 1,
      createdByType: 'Employee',
      request: {} as any
    });
    expect(result).toBe(1);
    expect(prismaMock.overtime.create).toHaveBeenCalled();
    expect(prismaMock.$transaction).toHaveBeenCalled();
  });

  it('should throw NotFoundError if overtime not found on update', async () => {
    prismaMock.overtime.findUnique.mockResolvedValueOnce(null);
    await expect(updateOvertime({
      id: 1,
      date: '2025-06-10',
      hours: 2,
      updatedById: 1,
      updatedByType: 'Employee',
      request: {} as any
    })).rejects.toThrow(NotFoundError);
  });

  it('should update overtime if found', async () => {
    prismaMock.overtime.findUnique.mockResolvedValueOnce({ id: 1 });
    prismaMock.overtime.update.mockResolvedValueOnce({ id: 1 });
    await expect(updateOvertime({
      id: 1,
      date: '2025-06-10',
      hours: 3,
      updatedById: 1,
      updatedByType: 'Employee',
      request: {} as any
    })).resolves.not.toThrow();
    expect(prismaMock.overtime.update).toHaveBeenCalled();
    expect(prismaMock.$transaction).toHaveBeenCalled();
  });
});
