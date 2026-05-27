import { Test } from '@nestjs/testing';
import { PrismaService } from '@core/database/database.service';
import { ObjectNotFoundException } from '@shared/exceptions/object-not-found.exception';
import { createMockPrismaService, MockPrismaService } from '../../../__mocks__/prisma.mock';
import { UpdateCustomerService } from './update-customer.service';

describe('UpdateCustomerService', () => {
  let service: UpdateCustomerService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();
    const module = await Test.createTestingModule({
      providers: [
        UpdateCustomerService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(UpdateCustomerService);
    jest.clearAllMocks();
  });

  it('should update and return customer entity', async () => {
    const existing = { id: 'c-1', businessName: 'Old' };
    const updated = { id: 'c-1', businessName: 'New', additionalInfo: null, createdAt: new Date(), updatedAt: new Date(), deletedAt: null };
    prisma.customer.findFirst.mockResolvedValue(existing);
    prisma.customer.update.mockResolvedValue(updated);

    const result = await service.execute('c-1', { businessName: 'New' } as any);

    expect(prisma.customer.update).toHaveBeenCalledWith({
      where: { id: 'c-1' },
      data: { businessName: 'New' },
    });
    expect(result.businessName).toBe('New');
  });

  it('should throw ObjectNotFoundException when not found', async () => {
    prisma.customer.findFirst.mockResolvedValue(null);

    await expect(service.execute('not-found', {} as any)).rejects.toThrow(ObjectNotFoundException);
  });
});
