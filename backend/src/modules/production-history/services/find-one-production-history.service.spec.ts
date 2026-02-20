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

  it('should return record when found', async () => {
    const record = {
      id: 'ph-1', userId: 'u-1', palletId: 'p-1', deliveredQuantity: 10, reformedQuantity: 2,
      status: 'OPEN', observation: null, createdAt: new Date(), updatedAt: new Date(), deletedAt: null,
      user: { id: 'u-1', name: 'A', document: '111', role: 'EMPLOYEE', password: 'h', salt: 's', createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
      pallet: { id: 'p-1', name: 'A', version: 1, versionFromId: null, buyCost: 10, productionCost: 5, sellPrice: 20, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
    };
    prisma.productionHistory.findFirst.mockResolvedValue(record);

    const result = await service.execute('ph-1');

    expect(prisma.productionHistory.findFirst).toHaveBeenCalledWith({
      where: { id: 'ph-1', deletedAt: null },
      include: { user: true, pallet: true },
    });
    expect(result.id).toBe('ph-1');
  });

  it('should throw ObjectNotFoundException when not found', async () => {
    prisma.productionHistory.findFirst.mockResolvedValue(null);
    await expect(service.execute('not-found')).rejects.toThrow(ObjectNotFoundException);
  });
});
