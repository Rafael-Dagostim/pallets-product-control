import { Test } from '@nestjs/testing';
import { PrismaService } from '@core/database/database.service';
import { OrderStatus, ProductionStatus } from '@generated/prisma';
import {
  createMockPrismaService,
  MockPrismaService,
} from '../../../__mocks__/prisma.mock';
import { GetReportSummaryService } from './get-report-summary.service';

describe('GetReportSummaryService', () => {
  let service: GetReportSummaryService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();
    const module = await Test.createTestingModule({
      providers: [
        GetReportSummaryService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(GetReportSummaryService);
    jest.clearAllMocks();
  });

  it('aggregates productions, orders and pallets by period', async () => {
    prisma.productionHistory.findMany.mockResolvedValue([
      {
        id: 'p1',
        userId: 'u1',
        palletId: 'pal1',
        deliveredQuantity: 10,
        reformedQuantity: 2,
        status: ProductionStatus.VERIFIED,
        createdAt: new Date('2026-04-10T12:00:00Z'),
        user: { id: 'u1', name: 'Alice' },
        pallet: { id: 'pal1', name: 'A', version: 1, productionCost: '3' },
      },
    ]);

    prisma.order.findMany.mockResolvedValue([
      {
        id: 'o1',
        status: OrderStatus.DONE,
        items: [
          {
            quantityProduced: 4,
            pallet: { sellPrice: '10' },
          },
        ],
      },
      { id: 'o2', status: OrderStatus.OPEN, items: [] },
    ]);

    prisma.pallet.findMany.mockResolvedValue([
      { id: 'pal1', name: 'A', version: 1, productionCost: '3' },
    ]);
    prisma.user.findMany.mockResolvedValue([{ id: 'u1', name: 'Alice' }]);

    const summary = await service.execute({
      from: '2026-04-01',
      to: '2026-04-30',
    });

    expect(summary.kpis.ordersDelivered).toBe(1);
    expect(summary.kpis.palletsProduced).toBe(8);
    expect(summary.kpis.salesTotalBRL).toBe(40);
    expect(summary.kpis.reformCostBRL).toBe(6);
    expect(summary.kpis.activeCollaborators).toBe(1);
    expect(summary.palletBar).toEqual([
      { palletId: 'pal1', name: 'A', version: 1, qty: 8 },
    ]);
    expect(summary.userBar[0]).toMatchObject({
      userId: 'u1',
      name: 'Alice',
      qty: 8,
      payableBRL: 24,
    });
    expect(summary.timeline).toHaveLength(1);
    expect(summary.orderDonut).toEqual(
      expect.arrayContaining([
        { status: OrderStatus.DONE, count: 1 },
        { status: OrderStatus.OPEN, count: 1 },
      ]),
    );
    expect(summary.detailTable).toHaveLength(1);
  });
});
