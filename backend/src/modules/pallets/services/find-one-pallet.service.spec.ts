import { Test } from '@nestjs/testing';
import { PrismaService } from '@core/database/database.service';
import { ObjectNotFoundException } from '@shared/exceptions/object-not-found.exception';
import { createMockPrismaService, MockPrismaService } from '../../../__mocks__/prisma.mock';
import { FindOnePalletService } from './find-one-pallet.service';

describe('FindOnePalletService', () => {
  let service: FindOnePalletService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();
    const module = await Test.createTestingModule({
      providers: [
        FindOnePalletService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(FindOnePalletService);
    jest.clearAllMocks();
  });

  it('should return pallet entity when found', async () => {
    const pallet = { id: 'p-1', name: 'A', version: 1, versionFromId: null, buyCost: 10, productionCost: 5, sellPrice: 20, createdAt: new Date(), updatedAt: new Date(), deletedAt: null };
    prisma.pallet.findFirst.mockResolvedValue(pallet);

    const result = await service.execute('p-1');
    expect(prisma.pallet.findFirst).toHaveBeenCalledWith({ where: { id: 'p-1', deletedAt: null } });
    expect(result.id).toBe('p-1');
  });

  it('should throw ObjectNotFoundException when not found', async () => {
    prisma.pallet.findFirst.mockResolvedValue(null);
    await expect(service.execute('not-found')).rejects.toThrow(ObjectNotFoundException);
  });
});
