import { Test } from '@nestjs/testing';
import { PrismaService } from '@core/database/database.service';
import { ObjectNotFoundException } from '@shared/exceptions/object-not-found.exception';
import { createMockPrismaService, MockPrismaService } from '../../../__mocks__/prisma.mock';
import { FindOneOrderService } from './find-one-order.service';

describe('FindOneOrderService', () => {
  let service: FindOneOrderService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();
    const module = await Test.createTestingModule({
      providers: [
        FindOneOrderService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(FindOneOrderService);
    jest.clearAllMocks();
  });

  it('should return order entity when found', async () => {
    const order = {
      id: 'o-1', customerId: 'cust-1', status: 'OPEN', deadline: new Date(),
      createdAt: new Date(), updatedAt: new Date(), deletedAt: null,
      customer: { id: 'cust-1', businessName: 'A', corporateName: null, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
      items: [],
    };
    prisma.order.findFirst.mockResolvedValue(order);

    const result = await service.execute('o-1');

    expect(prisma.order.findFirst).toHaveBeenCalledWith({
      where: { id: 'o-1', deletedAt: null },
      include: { customer: true, items: { include: { pallet: true } } },
    });
    expect(result.id).toBe('o-1');
  });

  it('should throw ObjectNotFoundException when not found', async () => {
    prisma.order.findFirst.mockResolvedValue(null);
    await expect(service.execute('not-found')).rejects.toThrow(ObjectNotFoundException);
  });
});
