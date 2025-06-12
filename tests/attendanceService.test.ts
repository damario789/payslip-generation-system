import { submitAttendance, updateAttendance } from '../src/services/attendanceService';
import { ConflictError, NotFoundError, ValidationError } from '../src/utils/customErrors';

// Mock the PrismaClient
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    $queryRaw: jest.fn(),
    attendance: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn().mockImplementation((callback) => {
      const mockTx = {
        attendance: {
          update: mockPrisma.attendance.update,
        },
        $queryRaw: mockPrisma.$queryRaw,
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

describe('Attendance Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prismaMock.$queryRaw.mockReturnValue([]); // Always return [] unless overridden
  });

  it('should throw ValidationError on weekend submit', async () => {
    const sunday = new Date('2025-06-08').toISOString(); // Sunday
    await expect(submitAttendance({
      date: sunday,
      employeeId: 1,
      createdById: 1,
      createdByType: 'Employee',
      request: {} as any
    })).rejects.toThrow(ValidationError);
  });

  it('should throw ConflictError if attendance exists', async () => {
    prismaMock.$queryRaw.mockResolvedValueOnce([{ id: 1 }]);
    await expect(submitAttendance({
      date: new Date('2025-06-10').toISOString(),
      employeeId: 1,
      createdById: 1,
      createdByType: 'Employee',
      request: {} as any
    })).rejects.toThrow(ConflictError);
  });

  it('should throw NotFoundError if attendance not found on update', async () => {
    prismaMock.attendance.findUnique.mockResolvedValueOnce(null);
    prismaMock.$queryRaw.mockResolvedValueOnce([]); // No duplicate
    await expect(updateAttendance({
      id: 1,
      date: new Date('2025-06-10').toISOString(),
      updatedById: 1,
      updatedByType: 'Employee',
      request: {} as any
    })).rejects.toThrow(NotFoundError);
  });

  it('should update attendance if found and no duplicate', async () => {
    prismaMock.attendance.findUnique.mockResolvedValueOnce({ id: 1, employeeId: 1 });
    prismaMock.$queryRaw.mockResolvedValueOnce([]); // No duplicate
    prismaMock.attendance.update.mockResolvedValueOnce({ id: 1 });
    await expect(updateAttendance({
      id: 1,
      date: new Date('2025-06-10').toISOString(),
      updatedById: 1,
      updatedByType: 'Employee',
      request: {} as any
    })).resolves.not.toThrow();
    expect(prismaMock.attendance.update).toHaveBeenCalled();
    expect(prismaMock.$transaction).toHaveBeenCalled();
  });
});
