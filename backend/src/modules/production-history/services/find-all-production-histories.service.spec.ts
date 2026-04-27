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

  it('filters by the given date (full day range) for ADMIN', async () => {
    prisma.productionHistory.findMany.mockResolvedValue([]);

    await service.execute('admin-1', 'ADMIN' as any, { date: '2026-04-24' });

    const call = prisma.productionHistory.findMany.mock.calls[0][0];
    const expectedStart = new Date('2026-04-24T00:00:00');
    const expectedEnd = new Date('2026-04-25T00:00:00');
    expect(call.where.deletedAt).toBeNull();
    expect(call.where.createdAt.gte.getTime()).toBe(expectedStart.getTime());
    expect(call.where.createdAt.lt.getTime()).toBe(expectedEnd.getTime());
    expect(call.where.userId).toBeUndefined();
  });

  it('defaults to today when no date is provided', async () => {
    prisma.productionHistory.findMany.mockResolvedValue([]);
    await service.execute('manager-1', 'MANAGER' as any);

    const call = prisma.productionHistory.findMany.mock.calls[0][0];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expect(call.where.createdAt.gte.getTime()).toBe(today.getTime());
  });

  it('filters by userId for EMPLOYEE', async () => {
    prisma.productionHistory.findMany.mockResolvedValue([]);
    await service.execute('emp-1', 'EMPLOYEE' as any, { date: '2026-04-24' });
    const call = prisma.productionHistory.findMany.mock.calls[0][0];
    expect(call.where.userId).toBe('emp-1');
  });
});
