import { Test } from '@nestjs/testing';
import { PrismaService } from '@core/database/database.service';
import { ObjectNotFoundException } from '@shared/exceptions/object-not-found.exception';
import { createMockPrismaService, MockPrismaService } from '../../../__mocks__/prisma.mock';
import { FindOneProductionHistoryService } from './find-one-production-history.service';

describe('FindOneProductionHistoryService', () => {
  let service: FindOneProductionHistoryService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();
    const module = await Test.createTestingModule({
      providers: [
        FindOneProductionHistoryService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(FindOneProductionHistoryService);
    jest.clearAllMocks();
  });

  const buildRecord = (userId: string) => ({
    id: 'ph-1', userId, palletId: 'p-1', deliveredQuantity: 10, reformedQuantity: 2,
    status: 'OPEN', observation: null, createdAt: new Date(), updatedAt: new Date(), deletedAt: null,
    user: { id: userId, name: 'A', login: 'AAA111', role: 'EMPLOYEE', password: 'h', createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
    pallet: { id: 'p-1', name: 'A', version: 1 },
  });

  it('should return record for ADMIN actor and select only non-cost pallet fields', async () => {
    prisma.productionHistory.findFirst.mockResolvedValue(buildRecord('u-1'));

    const result = await service.execute('ph-1', 'admin-1', 'ADMIN' as any);

    expect(prisma.productionHistory.findFirst).toHaveBeenCalledWith({
      where: { id: 'ph-1', deletedAt: null },
      include: {
        user: true,
        pallet: { select: { id: true, name: true, version: true } },
      },
    });
    expect(result.id).toBe('ph-1');
  });

  it('should return own record for EMPLOYEE actor', async () => {
    prisma.productionHistory.findFirst.mockResolvedValue(buildRecord('emp-1'));
    const result = await service.execute('ph-1', 'emp-1', 'EMPLOYEE' as any);
    expect(result.id).toBe('ph-1');
  });

  it('should hide another user record from EMPLOYEE actor (not found)', async () => {
    prisma.productionHistory.findFirst.mockResolvedValue(buildRecord('someone-else'));
    await expect(
      service.execute('ph-1', 'emp-1', 'EMPLOYEE' as any),
    ).rejects.toThrow(ObjectNotFoundException);
  });

  it('should throw ObjectNotFoundException when not found', async () => {
    prisma.productionHistory.findFirst.mockResolvedValue(null);
    await expect(
      service.execute('not-found', 'admin-1', 'ADMIN' as any),
    ).rejects.toThrow(ObjectNotFoundException);
  });
});
