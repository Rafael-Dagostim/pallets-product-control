import { Test } from '@nestjs/testing';
import { PrismaService } from '@core/database/database.service';
import { ObjectNotFoundException } from '@shared/exceptions/object-not-found.exception';
import { createMockPrismaService, MockPrismaService } from '../../../__mocks__/prisma.mock';
import { RemovePalletService } from './remove-pallet.service';

describe('RemovePalletService', () => {
  let service: RemovePalletService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();
    const module = await Test.createTestingModule({
      providers: [
        RemovePalletService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(RemovePalletService);
    jest.clearAllMocks();
  });

  it('should soft delete pallet', async () => {
    prisma.pallet.findFirst.mockResolvedValue({ id: 'p-1' });
    prisma.pallet.update.mockResolvedValue({});

    await service.execute('p-1');

    expect(prisma.pallet.update).toHaveBeenCalledWith({
      where: { id: 'p-1' },
      data: { deletedAt: expect.any(Date) },
    });
  });

  it('should throw ObjectNotFoundException when not found', async () => {
    prisma.pallet.findFirst.mockResolvedValue(null);
    await expect(service.execute('not-found')).rejects.toThrow(ObjectNotFoundException);
  });
});
