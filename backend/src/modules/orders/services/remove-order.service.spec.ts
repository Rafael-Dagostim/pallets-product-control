import { Test } from '@nestjs/testing';
import { PrismaService } from '@core/database/database.service';
import { ObjectNotFoundException } from '@shared/exceptions/object-not-found.exception';
import { createMockPrismaService, MockPrismaService } from '../../../__mocks__/prisma.mock';
import { RemoveOrderService } from './remove-order.service';

describe('RemoveOrderService', () => {
  let service: RemoveOrderService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();
    const module = await Test.createTestingModule({
      providers: [
        RemoveOrderService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(RemoveOrderService);
    jest.clearAllMocks();
  });

  it('should soft delete order', async () => {
    prisma.order.findFirst.mockResolvedValue({ id: 'o-1' });
    prisma.order.update.mockResolvedValue({});

    await service.execute('o-1');

    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: 'o-1' },
      data: { deletedAt: expect.any(Date) },
    });
  });

  it('should throw ObjectNotFoundException when not found', async () => {
    prisma.order.findFirst.mockResolvedValue(null);
    await expect(service.execute('not-found')).rejects.toThrow(ObjectNotFoundException);
  });
});
