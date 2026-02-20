import { Test } from '@nestjs/testing';
import { PrismaService } from '@core/database/database.service';
import { createMockPrismaService, MockPrismaService } from '../../../__mocks__/prisma.mock';
import { FindAllOrderItemsService } from './find-all-order-items.service';

describe('FindAllOrderItemsService', () => {
  let service: FindAllOrderItemsService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();
    const module = await Test.createTestingModule({
      providers: [
        FindAllOrderItemsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(FindAllOrderItemsService);
    jest.clearAllMocks();
  });

  it('should return order items with pallet include, filtering soft deletes', async () => {
    prisma.orderItem.findMany.mockResolvedValue([]);

    const result = await service.execute();

    expect(prisma.orderItem.findMany).toHaveBeenCalledWith({
      where: { deletedAt: null },
      include: { pallet: true },
    });
    expect(result).toEqual([]);
  });
});
