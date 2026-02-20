import { Test } from '@nestjs/testing';
import { PrismaService } from '@core/database/database.service';
import { ObjectNotFoundException } from '@shared/exceptions/object-not-found.exception';
import { createMockPrismaService, MockPrismaService } from '../../../__mocks__/prisma.mock';
import { UpdateProductionHistoryService } from './update-production-history.service';

describe('UpdateProductionHistoryService', () => {
  let service: UpdateProductionHistoryService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();
    const module = await Test.createTestingModule({
      providers: [
        UpdateProductionHistoryService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(UpdateProductionHistoryService);
    jest.clearAllMocks();
  });

  it('should update and return record', async () => {
    prisma.productionHistory.findFirst.mockResolvedValue({ id: 'ph-1' });
    const updated = {
      id: 'ph-1', userId: 'u-1', palletId: 'p-1', deliveredQuantity: 20, reformedQuantity: 2,
      status: 'OPEN', observation: null, createdAt: new Date(), updatedAt: new Date(), deletedAt: null,
      user: { id: 'u-1', name: 'A', document: '111', role: 'EMPLOYEE', password: 'h', salt: 's', createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
      pallet: { id: 'p-1', name: 'A', version: 1, versionFromId: null, buyCost: 10, productionCost: 5, sellPrice: 20, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
    };
    prisma.productionHistory.update.mockResolvedValue(updated);

    const result = await service.execute('ph-1', { deliveredQuantity: 20 } as any);

    expect(prisma.productionHistory.update).toHaveBeenCalledWith({
      where: { id: 'ph-1' },
      data: { deliveredQuantity: 20 },
      include: { user: true, pallet: true },
    });
    expect(result.deliveredQuantity).toBe(20);
  });

  it('should throw ObjectNotFoundException when not found', async () => {
    prisma.productionHistory.findFirst.mockResolvedValue(null);
    await expect(service.execute('not-found', {} as any)).rejects.toThrow(ObjectNotFoundException);
  });
});
