import { submitReimbursement, updateReimbursement } from '../src/services/reimbursementService';
import { NotFoundError } from '../src/utils/customErrors';

// Mock the PrismaClient
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    reimbursement: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn().mockImplementation((callback) => {
      // Simulate a transaction by passing a mock transaction object
      const mockTx = {
        reimbursement: {
          create: mockPrisma.reimbursement.create,
          findUnique: mockPrisma.reimbursement.findUnique,
          update: mockPrisma.reimbursement.update,
        },
      };
      return callback(mockTx);
    }),
  };

  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

// Mock auditLog
jest.mock('../src/utils/auditLog', () => ({
  logAudit: jest.fn(),
}));

// Mock the service's internal Prisma instance
const prismaMock = new (require('@prisma/client') as any).PrismaClient();

describe('Reimbursement Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should submit reimbursement and return id', async () => {
    // Mock the create method to return a reimbursement with an id
    prismaMock.reimbursement.create.mockResolvedValueOnce({ id: 1 });

    const result = await submitReimbursement({
      amount: 100,
      description: 'test',
      employeeId: 1,
      createdById: 1,
      createdByType: 'Employee',
      request: {} as any,
    });

    expect(result).toBe(1);
    expect(prismaMock.reimbursement.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          amount: 100,
          description: 'test',
          employeeId: 1,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          createdById: 1,
          createdByType: 'Employee',
          updatedById: 1,
          updatedByType: 'Employee',
        },
      })
    );
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
  });

  it('should throw NotFoundError if reimbursement not found on update', async () => {
    // Mock findUnique to return null (reimbursement not found)
    prismaMock.reimbursement.findUnique.mockResolvedValueOnce(null);

    await expect(
      updateReimbursement({
        id: 1,
        amount: 100,
        description: 'test',
        updatedById: 1,
        updatedByType: 'Employee',
        request: {} as any,
      })
    ).rejects.toThrow(NotFoundError);

    expect(prismaMock.reimbursement.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 1 } })
    );
    expect(prismaMock.reimbursement.update).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('should update reimbursement if found', async () => {
    // Mock findUnique to return an existing reimbursement
    prismaMock.reimbursement.findUnique.mockResolvedValueOnce({ id: 1, employeeId: 1 });
    // Mock update to return the updated reimbursement
    prismaMock.reimbursement.update.mockResolvedValueOnce({ id: 1, amount: 200, description: 'updated' });

    await expect(
      updateReimbursement({
        id: 1,
        amount: 200,
        description: 'updated',
        updatedById: 1,
        updatedByType: 'Employee',
        request: {} as any,
      })
    ).resolves.not.toThrow();

    expect(prismaMock.reimbursement.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 1 } })
    );
    expect(prismaMock.reimbursement.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1 },
        data: {
          amount: 200,
          description: 'updated',
          updatedAt: expect.any(Date),
          updatedById: 1,
          updatedByType: 'Employee',
        },
      })
    );
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
  });
});