import { Test } from '@nestjs/testing';
import { PrismaService } from '@core/database/database.service';
import { createMockPrismaService, MockPrismaService } from '../../../__mocks__/prisma.mock';
import { FindAllCustomersService } from './find-all-customers.service';

describe('FindAllCustomersService', () => {
  let service: FindAllCustomersService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();
    const module = await Test.createTestingModule({
      providers: [
        FindAllCustomersService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(FindAllCustomersService);
    jest.clearAllMocks();
  });

  it('should return array of customer entities filtering soft deletes', async () => {
    const customers = [
      { id: 'c-1', businessName: 'A', corporateName: null, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
      { id: 'c-2', businessName: 'B', corporateName: null, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
    ];
    prisma.customer.findMany.mockResolvedValue(customers);

    const result = await service.execute();

    expect(prisma.customer.findMany).toHaveBeenCalledWith({ where: { deletedAt: null } });
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('c-1');
  });
});
