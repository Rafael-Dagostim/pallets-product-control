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

  it('filters by from/to ISO range for ADMIN', async () => {
    prisma.productionHistory.findMany.mockResolvedValue([]);

    const from = '2026-04-24T03:00:00.000Z';
    const to = '2026-04-25T02:59:59.999Z';
    await service.execute('admin-1', 'ADMIN' as any, { from, to });

    const call = prisma.productionHistory.findMany.mock.calls[0][0];
    expect(call.where.deletedAt).toBeNull();
    expect(call.where.createdAt.gte.toISOString()).toBe(from);
    expect(call.where.createdAt.lte.toISOString()).toBe(to);
    expect(call.where.userId).toBeUndefined();
  });

  it('does not filter by date when no from/to is provided', async () => {
    prisma.productionHistory.findMany.mockResolvedValue([]);
    await service.execute('manager-1', 'MANAGER' as any);

    const call = prisma.productionHistory.findMany.mock.calls[0][0];
    expect(call.where.createdAt).toBeUndefined();
  });

  it('forces userId filter for EMPLOYEE actor', async () => {
    prisma.productionHistory.findMany.mockResolvedValue([]);
    await service.execute('emp-1', 'EMPLOYEE' as any, {
      from: '2026-04-24T03:00:00.000Z',
      to: '2026-04-25T02:59:59.999Z',
    });
    const call = prisma.productionHistory.findMany.mock.calls[0][0];
    expect(call.where.userId).toBe('emp-1');
  });
});
