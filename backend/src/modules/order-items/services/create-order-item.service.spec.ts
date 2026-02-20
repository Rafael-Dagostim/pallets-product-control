import { Test } from '@nestjs/testing';
import { PrismaService } from '@core/database/database.service';
import { createMockPrismaService, MockPrismaService } from '../../../__mocks__/prisma.mock';
import { CreateOrderItemService } from './create-order-item.service';

describe('CreateOrderItemService', () => {
  let service: CreateOrderItemService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();
    const module = await Test.createTestingModule({
      providers: [
        CreateOrderItemService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(CreateOrderItemService);
    jest.clearAllMocks();
  });

  it('should create order item with pallet include', async () => {
    const dto = { orderId: 'o-1', palletId: 'p-1', quantityRequested: 100 };
    const created = {
      id: 'oi-1', ...dto, quantityProduced: 0,
      createdAt: new Date(), updatedAt: new Date(), deletedAt: null,
      pallet: { id: 'p-1', name: 'A', version: 1, versionFromId: null, buyCost: 10, productionCost: 5, sellPrice: 20, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
    };
    prisma.orderItem.create.mockResolvedValue(created);

    const result = await service.execute(dto as any);

    expect(prisma.orderItem.create).toHaveBeenCalledWith({
      data: dto,
      include: { pallet: true },
    });
    expect(result.id).toBe('oi-1');
    expect(result.pallet).toBeDefined();
  });
});
