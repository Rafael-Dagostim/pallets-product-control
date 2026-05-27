import { Test } from '@nestjs/testing';
import { PrismaService } from '@core/database/database.service';
import { ObjectNotFoundException } from '@shared/exceptions/object-not-found.exception';
import { createMockPrismaService, MockPrismaService } from '../../../__mocks__/prisma.mock';
import { FindOneCustomerService } from './find-one-customer.service';

describe('FindOneCustomerService', () => {
  let service: FindOneCustomerService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();
    const module = await Test.createTestingModule({
      providers: [
        FindOneCustomerService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(FindOneCustomerService);
    jest.clearAllMocks();
  });

  it('should return customer entity when found', async () => {
    const customer = { id: 'c-1', businessName: 'A', additionalInfo: null, createdAt: new Date(), updatedAt: new Date(), deletedAt: null };
    prisma.customer.findFirst.mockResolvedValue(customer);

    const result = await service.execute('c-1');

    expect(prisma.customer.findFirst).toHaveBeenCalledWith({ where: { id: 'c-1', deletedAt: null } });
    expect(result.id).toBe('c-1');
  });

  it('should throw ObjectNotFoundException when not found', async () => {
    prisma.customer.findFirst.mockResolvedValue(null);

    await expect(service.execute('not-found')).rejects.toThrow(ObjectNotFoundException);
  });
});
