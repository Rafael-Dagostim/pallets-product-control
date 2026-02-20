import { Test } from '@nestjs/testing';
import { PrismaService } from '@core/database/database.service';
import { ObjectNotFoundException } from '@shared/exceptions/object-not-found.exception';
import { createMockPrismaService, MockPrismaService } from '../../../__mocks__/prisma.mock';
import { CreatePalletService } from './create-pallet.service';

describe('CreatePalletService', () => {
  let service: CreatePalletService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();
    const module = await Test.createTestingModule({
      providers: [
        CreatePalletService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(CreatePalletService);
    jest.clearAllMocks();
  });

  it('should create pallet with version 1 when no versionFromId', async () => {
    const dto = { name: 'Pallet A', buyCost: 10, productionCost: 5, sellPrice: 20 };
    const created = { id: 'p-1', ...dto, version: 1, versionFromId: null, createdAt: new Date(), updatedAt: new Date(), deletedAt: null };
    prisma.pallet.create.mockResolvedValue(created);

    const result = await service.execute(dto as any);

    expect(prisma.pallet.create).toHaveBeenCalledWith({
      data: {
        name: 'Pallet A',
        buyCost: 10,
        productionCost: 5,
        sellPrice: 20,
        versionFromId: null,
        version: 1,
      },
    });
    expect(result.version).toBe(1);
  });

  it('should increment version when versionFromId is provided', async () => {
    const dto = { name: 'Pallet A', buyCost: 10, productionCost: 5, sellPrice: 20, versionFromId: 'origin-1' };
    prisma.pallet.findFirst
      .mockResolvedValueOnce({ id: 'origin-1', name: 'Pallet A', version: 1 }) // origin lookup
      .mockResolvedValueOnce({ id: 'p-2', name: 'Pallet A', version: 2 }); // latest lookup

    const created = { id: 'p-3', ...dto, version: 3, createdAt: new Date(), updatedAt: new Date(), deletedAt: null };
    prisma.pallet.create.mockResolvedValue(created);

    const result = await service.execute(dto as any);

    expect(result.version).toBe(3);
    expect(prisma.pallet.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ version: 3, versionFromId: 'origin-1' }),
    });
  });

  it('should throw ObjectNotFoundException when origin pallet not found', async () => {
    prisma.pallet.findFirst.mockResolvedValue(null);

    await expect(
      service.execute({ name: 'X', buyCost: 1, productionCost: 1, sellPrice: 1, versionFromId: 'bad-id' } as any),
    ).rejects.toThrow(ObjectNotFoundException);
  });
});
