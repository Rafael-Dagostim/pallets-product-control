import { Test } from '@nestjs/testing';
import { PrismaService } from '@core/database/database.service';
import { createMockPrismaService, MockPrismaService } from '../../../__mocks__/prisma.mock';
import { FindAllOrdersService } from './find-all-orders.service';

describe('FindAllOrdersService', () => {
  let service: FindAllOrdersService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();
    const module = await Test.createTestingModule({
      providers: [
        FindAllOrdersService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(FindAllOrdersService);
    jest.clearAllMocks();
  });

  it('should return orders with includes, filtering soft deletes', async () => {
    prisma.order.findMany.mockResolvedValue([]);

    const result = await service.execute();

    expect(prisma.order.findMany).toHaveBeenCalledWith({
      where: { deletedAt: null },
      include: {
        customer: true,
        items: { include: { pallet: true } },
      },
    });
    expect(result).toEqual([]);
  });
});
