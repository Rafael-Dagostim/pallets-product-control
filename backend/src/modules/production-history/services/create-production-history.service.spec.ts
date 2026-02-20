import { Test } from '@nestjs/testing';
import { PrismaService } from '@core/database/database.service';
import { createMockPrismaService, MockPrismaService } from '../../../__mocks__/prisma.mock';
import { CreateProductionHistoryService } from './create-production-history.service';

describe('CreateProductionHistoryService', () => {
  let service: CreateProductionHistoryService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();
    const module = await Test.createTestingModule({
      providers: [
        CreateProductionHistoryService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(CreateProductionHistoryService);
    jest.clearAllMocks();
  });

  it('should create record with userId from param, forced OPEN status, and includes', async () => {
    const dto = { palletId: 'p-1', deliveredQuantity: 10, reformedQuantity: 2 };
    const userId = 'user-1';
    const created = {
      id: 'ph-1', ...dto, userId, status: 'OPEN', observation: null,
      createdAt: new Date(), updatedAt: new Date(), deletedAt: null,
      user: { id: userId, name: 'A', document: '111', role: 'EMPLOYEE', password: 'h', salt: 's', createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
      pallet: { id: 'p-1', name: 'A', version: 1, versionFromId: null, buyCost: 10, productionCost: 5, sellPrice: 20, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
    };
    prisma.productionHistory.create.mockResolvedValue(created);

    const result = await service.execute(dto as any, userId);

    expect(prisma.productionHistory.create).toHaveBeenCalledWith({
      data: {
        ...dto,
        userId,
        status: 'OPEN',
      },
      include: { user: true, pallet: true },
    });
    expect(result.id).toBe('ph-1');
    expect(result.status).toBe('OPEN');
    expect(result.user).toBeDefined();
    expect(result.pallet).toBeDefined();
  });
});
