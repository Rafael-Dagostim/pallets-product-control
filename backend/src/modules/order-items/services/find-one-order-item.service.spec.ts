import { Test } from '@nestjs/testing';
import { PrismaService } from '@core/database/database.service';
import { ObjectNotFoundException } from '@shared/exceptions/object-not-found.exception';
import { createMockPrismaService, MockPrismaService } from '../../../__mocks__/prisma.mock';
import { FindOneOrderItemService } from './find-one-order-item.service';

describe('FindOneOrderItemService', () => {
  let service: FindOneOrderItemService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();
    const module = await Test.createTestingModule({
      providers: [
        FindOneOrderItemService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(FindOneOrderItemService);
    jest.clearAllMocks();
  });

  it('should return order item entity when found', async () => {
    const item = {
      id: 'oi-1', orderId: 'o-1', palletId: 'p-1', quantityRequested: 100, quantityProduced: 0,
      createdAt: new Date(), updatedAt: new Date(), deletedAt: null,
      pallet: { id: 'p-1', name: 'A', version: 1, versionFromId: null, buyCost: 10, productionCost: 5, sellPrice: 20, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
    };
    prisma.orderItem.findFirst.mockResolvedValue(item);

    const result = await service.execute('oi-1');

    expect(prisma.orderItem.findFirst).toHaveBeenCalledWith({
      where: { id: 'oi-1', deletedAt: null },
      include: { pallet: true },
    });
    expect(result.id).toBe('oi-1');
  });

  it('should throw ObjectNotFoundException when not found', async () => {
    prisma.orderItem.findFirst.mockResolvedValue(null);
    await expect(service.execute('not-found')).rejects.toThrow(ObjectNotFoundException);
  });
});
