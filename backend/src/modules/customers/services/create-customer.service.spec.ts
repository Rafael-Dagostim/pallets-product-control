import { Test } from '@nestjs/testing';
import { PrismaService } from '@core/database/database.service';
import { createMockPrismaService, MockPrismaService } from '../../../__mocks__/prisma.mock';
import { CreateCustomerService } from './create-customer.service';

describe('CreateCustomerService', () => {
  let service: CreateCustomerService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();
    const module = await Test.createTestingModule({
      providers: [
        CreateCustomerService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(CreateCustomerService);
    jest.clearAllMocks();
  });

  it('should create a customer and return entity', async () => {
    const dto = { businessName: 'Acme', additionalInfo: 'Acme Corp' };
    const created = { id: 'c-1', ...dto, createdAt: new Date(), updatedAt: new Date(), deletedAt: null };
    prisma.customer.create.mockResolvedValue(created);

    const result = await service.execute(dto as any);

    expect(prisma.customer.create).toHaveBeenCalledWith({ data: dto });
    expect(result.id).toBe('c-1');
    expect(result.businessName).toBe('Acme');
  });
});
