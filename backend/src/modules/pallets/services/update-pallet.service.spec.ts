import { Test } from '@nestjs/testing';
import { PrismaService } from '@core/database/database.service';
import { ObjectNotFoundException } from '@shared/exceptions/object-not-found.exception';
import { createMockPrismaService, MockPrismaService } from '../../../__mocks__/prisma.mock';
import { UpdatePalletService } from './update-pallet.service';

describe('UpdatePalletService', () => {
  let service: UpdatePalletService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();
    const module = await Test.createTestingModule({
      providers: [
        UpdatePalletService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(UpdatePalletService);
    jest.clearAllMocks();
  });

  it('should update and return pallet entity', async () => {
    prisma.pallet.findFirst.mockResolvedValue({ id: 'p-1' });
    const updated = { id: 'p-1', name: 'Updated', version: 1, versionFromId: null, buyCost: 15, productionCost: 5, sellPrice: 20, createdAt: new Date(), updatedAt: new Date(), deletedAt: null };
    prisma.pallet.update.mockResolvedValue(updated);

    const result = await service.execute('p-1', { name: 'Updated' } as any);

    expect(prisma.pallet.update).toHaveBeenCalledWith({ where: { id: 'p-1' }, data: { name: 'Updated' } });
    expect(result.name).toBe('Updated');
  });

  it('should throw ObjectNotFoundException when not found', async () => {
    prisma.pallet.findFirst.mockResolvedValue(null);
    await expect(service.execute('not-found', {} as any)).rejects.toThrow(ObjectNotFoundException);
  });
});
