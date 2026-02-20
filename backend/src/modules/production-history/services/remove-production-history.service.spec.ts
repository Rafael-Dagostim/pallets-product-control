import { Test } from '@nestjs/testing';
import { PrismaService } from '@core/database/database.service';
import { ObjectNotFoundException } from '@shared/exceptions/object-not-found.exception';
import { createMockPrismaService, MockPrismaService } from '../../../__mocks__/prisma.mock';
import { RemoveProductionHistoryService } from './remove-production-history.service';

describe('RemoveProductionHistoryService', () => {
  let service: RemoveProductionHistoryService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();
    const module = await Test.createTestingModule({
      providers: [
        RemoveProductionHistoryService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(RemoveProductionHistoryService);
    jest.clearAllMocks();
  });

  it('should soft delete production history record', async () => {
    prisma.productionHistory.findFirst.mockResolvedValue({ id: 'ph-1' });
    prisma.productionHistory.update.mockResolvedValue({});

    await service.execute('ph-1');

    expect(prisma.productionHistory.update).toHaveBeenCalledWith({
      where: { id: 'ph-1' },
      data: { deletedAt: expect.any(Date) },
    });
  });

  it('should throw ObjectNotFoundException when not found', async () => {
    prisma.productionHistory.findFirst.mockResolvedValue(null);
    await expect(service.execute('not-found')).rejects.toThrow(ObjectNotFoundException);
  });
});
