import { Test } from '@nestjs/testing';
import { PrismaService } from '@core/database/database.service';
import { createMockPrismaService, MockPrismaService } from '../../../__mocks__/prisma.mock';
import { FindAllProductionHistoriesService } from './find-all-production-histories.service';

describe('FindAllProductionHistoriesService', () => {
  let service: FindAllProductionHistoriesService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();
    const module = await Test.createTestingModule({
      providers: [
        FindAllProductionHistoriesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(FindAllProductionHistoriesService);
    jest.clearAllMocks();
  });

  it('should return records with includes, filtering soft deletes', async () => {
    prisma.productionHistory.findMany.mockResolvedValue([]);

    const result = await service.execute();

    expect(prisma.productionHistory.findMany).toHaveBeenCalledWith({
      where: { deletedAt: null },
      include: { user: true, pallet: true },
    });
    expect(result).toEqual([]);
  });
});
