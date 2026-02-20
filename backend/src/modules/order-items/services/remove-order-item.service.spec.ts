import { Test } from '@nestjs/testing';
import { PrismaService } from '@core/database/database.service';
import { ObjectNotFoundException } from '@shared/exceptions/object-not-found.exception';
import { createMockPrismaService, MockPrismaService } from '../../../__mocks__/prisma.mock';
import { RemoveOrderItemService } from './remove-order-item.service';

describe('RemoveOrderItemService', () => {
  let service: RemoveOrderItemService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();
    const module = await Test.createTestingModule({
      providers: [
        RemoveOrderItemService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(RemoveOrderItemService);
    jest.clearAllMocks();
  });

  it('should soft delete order item', async () => {
    prisma.orderItem.findFirst.mockResolvedValue({ id: 'oi-1' });
    prisma.orderItem.update.mockResolvedValue({});

    await service.execute('oi-1');

    expect(prisma.orderItem.update).toHaveBeenCalledWith({
      where: { id: 'oi-1' },
      data: { deletedAt: expect.any(Date) },
    });
  });

  it('should throw ObjectNotFoundException when not found', async () => {
    prisma.orderItem.findFirst.mockResolvedValue(null);
    await expect(service.execute('not-found')).rejects.toThrow(ObjectNotFoundException);
  });
});
