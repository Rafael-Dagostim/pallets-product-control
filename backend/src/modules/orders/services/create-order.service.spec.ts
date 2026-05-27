import { Test } from '@nestjs/testing';
import { PrismaService } from '@core/database/database.service';
import { createMockPrismaService, MockPrismaService } from '../../../__mocks__/prisma.mock';
import { CreateOrderService } from './create-order.service';

describe('CreateOrderService', () => {
  let service: CreateOrderService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();
    const module = await Test.createTestingModule({
      providers: [
        CreateOrderService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(CreateOrderService);
    jest.clearAllMocks();
  });

  it('should create order with nested items, forced OPEN status, and Date deadline', async () => {
    const dto = {
      customerId: 'cust-1',
      deadline: '2025-12-31',
      items: [
        { palletId: 'p-1', quantityRequested: 100 },
        { palletId: 'p-2', quantityRequested: 50 },
      ],
    };
    const created = {
      id: 'o-1', customerId: 'cust-1', status: 'OPEN',
      deadline: new Date('2025-12-31'), createdAt: new Date(), updatedAt: new Date(), deletedAt: null,
      customer: { id: 'cust-1', businessName: 'A', additionalInfo: null, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
      items: [],
    };
    prisma.order.create.mockResolvedValue(created);

    const result = await service.execute(dto as any);

    expect(prisma.order.create).toHaveBeenCalledWith({
      data: {
        customerId: 'cust-1',
        deadline: expect.any(Date),
        status: 'OPEN',
        items: {
          create: [
            { palletId: 'p-1', quantityRequested: 100 },
            { palletId: 'p-2', quantityRequested: 50 },
          ],
        },
      },
      include: {
        customer: true,
        items: { include: { pallet: true } },
      },
    });
    expect(result.id).toBe('o-1');
    expect(result.status).toBe('OPEN');
  });
});
