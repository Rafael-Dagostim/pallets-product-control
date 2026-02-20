import { Test } from '@nestjs/testing';
import { PrismaService } from '@core/database/database.service';
import { createMockPrismaService, MockPrismaService } from '../../../__mocks__/prisma.mock';
import { FindAllPalletsService } from './find-all-pallets.service';

describe('FindAllPalletsService', () => {
  let service: FindAllPalletsService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();
    const module = await Test.createTestingModule({
      providers: [
        FindAllPalletsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(FindAllPalletsService);
    jest.clearAllMocks();
  });

  it('should return array of pallet entities filtering soft deletes', async () => {
    const pallets = [
      { id: 'p-1', name: 'A', version: 1, versionFromId: null, buyCost: 10, productionCost: 5, sellPrice: 20, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
    ];
    prisma.pallet.findMany.mockResolvedValue(pallets);

    const result = await service.execute();

    expect(prisma.pallet.findMany).toHaveBeenCalledWith({ where: { deletedAt: null } });
    expect(result).toHaveLength(1);
  });
});
