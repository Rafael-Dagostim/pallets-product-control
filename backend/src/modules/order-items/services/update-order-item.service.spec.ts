import { Test } from '@nestjs/testing';
import { PrismaService } from '@core/database/database.service';
import { ObjectNotFoundException } from '@shared/exceptions/object-not-found.exception';
import { createMockPrismaService, MockPrismaService } from '../../../__mocks__/prisma.mock';
import { UpdateOrderItemService } from './update-order-item.service';

describe('UpdateOrderItemService', () => {
  let service: UpdateOrderItemService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();
    const module = await Test.createTestingModule({
      providers: [
        UpdateOrderItemService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(UpdateOrderItemService);
    jest.clearAllMocks();
  });

  it('should update and return order item entity', async () => {
    prisma.orderItem.findFirst.mockResolvedValue({ id: 'oi-1' });
    const updated = {
      id: 'oi-1', orderId: 'o-1', palletId: 'p-1', quantityRequested: 200, quantityProduced: 0,
      createdAt: new Date(), updatedAt: new Date(), deletedAt: null,
      pallet: { id: 'p-1', name: 'A', version: 1, versionFromId: null, buyCost: 10, productionCost: 5, sellPrice: 20, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
    };
    prisma.orderItem.update.mockResolvedValue(updated);

    const result = await service.execute('oi-1', { quantityRequested: 200 } as any);

    expect(prisma.orderItem.update).toHaveBeenCalledWith({
      where: { id: 'oi-1' },
      data: { quantityRequested: 200 },
      include: { pallet: true },
    });
    expect(result.quantityRequested).toBe(200);
  });

  it('should throw ObjectNotFoundException when not found', async () => {
    prisma.orderItem.findFirst.mockResolvedValue(null);
    await expect(service.execute('not-found', {} as any)).rejects.toThrow(ObjectNotFoundException);
  });
});
