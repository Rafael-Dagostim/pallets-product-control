import { Test } from '@nestjs/testing';
import { PrismaService } from '@core/database/database.service';
import { ObjectNotFoundException } from '@shared/exceptions/object-not-found.exception';
import { createMockPrismaService, MockPrismaService } from '../../../__mocks__/prisma.mock';
import { UpdateOrderService } from './update-order.service';

describe('UpdateOrderService', () => {
  let service: UpdateOrderService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();
    const module = await Test.createTestingModule({
      providers: [
        UpdateOrderService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(UpdateOrderService);
    jest.clearAllMocks();
  });

  it('should update order and convert deadline to Date', async () => {
    prisma.order.findFirst.mockResolvedValue({ id: 'o-1' });
    const updated = {
      id: 'o-1', customerId: 'cust-1', status: 'OPEN', deadline: new Date('2025-12-31'),
      createdAt: new Date(), updatedAt: new Date(), deletedAt: null,
      customer: { id: 'cust-1', businessName: 'A', corporateName: null, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
      items: [],
    };
    prisma.order.update.mockResolvedValue(updated);

    const result = await service.execute('o-1', { deadline: '2025-12-31', status: 'IN_PRODUCTION' } as any);

    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: 'o-1' },
      data: {
        deadline: expect.any(Date),
        status: 'IN_PRODUCTION',
      },
      include: { customer: true, items: { include: { pallet: true } } },
    });
    expect(result.id).toBe('o-1');
  });

  it('should pass undefined for deadline when not provided', async () => {
    prisma.order.findFirst.mockResolvedValue({ id: 'o-1' });
    prisma.order.update.mockResolvedValue({
      id: 'o-1', customerId: 'cust-1', status: 'DONE', deadline: new Date(),
      createdAt: new Date(), updatedAt: new Date(), deletedAt: null,
      customer: { id: 'cust-1', businessName: 'A', corporateName: null, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
      items: [],
    });

    await service.execute('o-1', { status: 'DONE' } as any);

    const callData = prisma.order.update.mock.calls[0][0].data;
    expect(callData.deadline).toBeUndefined();
  });

  it('should throw ObjectNotFoundException when not found', async () => {
    prisma.order.findFirst.mockResolvedValue(null);
    await expect(service.execute('not-found', {} as any)).rejects.toThrow(ObjectNotFoundException);
  });
});
