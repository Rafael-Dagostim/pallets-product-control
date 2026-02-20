import { Test } from '@nestjs/testing';
import { PrismaService } from '@core/database/database.service';
import { ObjectNotFoundException } from '@shared/exceptions/object-not-found.exception';
import { createMockPrismaService, MockPrismaService } from '../../../__mocks__/prisma.mock';
import { RemoveCustomerService } from './remove-customer.service';

describe('RemoveCustomerService', () => {
  let service: RemoveCustomerService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();
    const module = await Test.createTestingModule({
      providers: [
        RemoveCustomerService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(RemoveCustomerService);
    jest.clearAllMocks();
  });

  it('should soft delete customer', async () => {
    prisma.customer.findFirst.mockResolvedValue({ id: 'c-1' });
    prisma.customer.update.mockResolvedValue({});

    await service.execute('c-1');

    expect(prisma.customer.update).toHaveBeenCalledWith({
      where: { id: 'c-1' },
      data: { deletedAt: expect.any(Date) },
    });
  });

  it('should throw ObjectNotFoundException when not found', async () => {
    prisma.customer.findFirst.mockResolvedValue(null);

    await expect(service.execute('not-found')).rejects.toThrow(ObjectNotFoundException);
  });
});
