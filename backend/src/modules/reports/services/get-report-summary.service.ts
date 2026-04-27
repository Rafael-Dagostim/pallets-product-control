import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/database.service';
import { OrderStatus, Prisma, ProductionStatus } from '@generated/prisma';
import { ReportFiltersDto } from '../dto/report-filters.dto';

export interface ReportSummary {
  kpis: {
    ordersDelivered: number;
    palletsProduced: number;
    salesTotalBRL: number;
    reformCostBRL: number;
    activeCollaborators: number;
  };
  palletBar: { palletId: string; name: string; version: number; qty: number }[];
  userBar: {
    userId: string;
    name: string;
    qty: number;
    payableBRL: number;
  }[];
  timeline: {
    date: string;
    produced: number;
    delivered: number;
    reformed: number;
  }[];
  orderDonut: { status: OrderStatus; count: number }[];
  detailTable: DetailRow[];
}

interface DetailRow {
  id: string;
  createdAt: Date;
  userName: string;
  palletName: string;
  palletVersion: number;
  deliveredQuantity: number;
  reformedQuantity: number;
  status: ProductionStatus;
  payableBRL: number;
}

function startOfDay(date: string): Date {
  const d = new Date(`${date}T00:00:00`);
  d.setHours(0, 0, 0, 0);
  return d;
}

function nextDay(date: string): Date {
  const d = startOfDay(date);
  d.setDate(d.getDate() + 1);
  return d;
}

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function toNumber(value: Prisma.Decimal | number | null | undefined): number {
  if (value == null) return 0;
  if (typeof value === 'number') return value;
  return Number(value.toString());
}

@Injectable()
export class GetReportSummaryService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(filters: ReportFiltersDto): Promise<ReportSummary> {
    const gte = startOfDay(filters.from);
    const lt = nextDay(filters.to);

    const productionWhere: Prisma.ProductionHistoryWhereInput = {
      deletedAt: null,
      createdAt: { gte, lt },
      ...(filters.userId ? { userId: filters.userId } : {}),
      ...(filters.palletId ? { palletId: filters.palletId } : {}),
      status: { not: ProductionStatus.CANCELED },
    };

    const orderWhere: Prisma.OrderWhereInput = {
      deletedAt: null,
      createdAt: { gte, lt },
      ...(filters.userId
        ? {}
        : {}),
    };

    const [productions, orders, pallets, users] = await Promise.all([
      this.prisma.productionHistory.findMany({
        where: productionWhere,
        include: { user: true, pallet: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.findMany({
        where: orderWhere,
        include: {
          items: { include: { pallet: true } },
        },
      }),
      this.prisma.pallet.findMany({
        where: { deletedAt: null, ...(filters.palletId ? { id: filters.palletId } : {}) },
      }),
      this.prisma.user.findMany({
        where: { deletedAt: null, ...(filters.userId ? { id: filters.userId } : {}) },
      }),
    ]);

    const palletById = new Map(pallets.map((p) => [p.id, p]));
    const userById = new Map(users.map((u) => [u.id, u]));

    const palletBarMap = new Map<string, number>();
    const userBarQty = new Map<string, number>();
    const userBarPayable = new Map<string, number>();
    const timelineMap = new Map<
      string,
      { produced: number; delivered: number; reformed: number }
    >();
    const activeCollaborators = new Set<string>();

    let palletsProduced = 0;
    let reformCostBRL = 0;

    for (const p of productions) {
      const net = p.deliveredQuantity - p.reformedQuantity;
      palletsProduced += net;
      activeCollaborators.add(p.userId);

      const pallet = p.pallet ?? palletById.get(p.palletId);
      const productionCost = toNumber(pallet?.productionCost);
      reformCostBRL += p.reformedQuantity * productionCost;

      palletBarMap.set(p.palletId, (palletBarMap.get(p.palletId) ?? 0) + net);

      userBarQty.set(p.userId, (userBarQty.get(p.userId) ?? 0) + net);
      userBarPayable.set(
        p.userId,
        (userBarPayable.get(p.userId) ?? 0) + net * productionCost,
      );

      const date = toISODate(p.createdAt);
      const prev = timelineMap.get(date) ?? {
        produced: 0,
        delivered: 0,
        reformed: 0,
      };
      prev.produced += net;
      prev.delivered += p.deliveredQuantity;
      prev.reformed += p.reformedQuantity;
      timelineMap.set(date, prev);
    }

    let ordersDelivered = 0;
    let salesTotalBRL = 0;
    const orderDonutMap = new Map<OrderStatus, number>();

    for (const o of orders) {
      orderDonutMap.set(o.status, (orderDonutMap.get(o.status) ?? 0) + 1);
      if (o.status === OrderStatus.DONE) {
        ordersDelivered += 1;
        for (const item of o.items) {
          const sell = toNumber(item.pallet?.sellPrice);
          salesTotalBRL += item.quantityProduced * sell;
        }
      }
    }

    const palletBar = Array.from(palletBarMap.entries())
      .map(([palletId, qty]) => {
        const pallet = palletById.get(palletId);
        return {
          palletId,
          name: pallet?.name ?? '—',
          version: pallet?.version ?? 1,
          qty,
        };
      })
      .sort((a, b) => b.qty - a.qty);

    const userBar = Array.from(userBarQty.entries())
      .map(([userId, qty]) => ({
        userId,
        name: userById.get(userId)?.name ?? '—',
        qty,
        payableBRL: userBarPayable.get(userId) ?? 0,
      }))
      .sort((a, b) => b.qty - a.qty);

    const timeline = Array.from(timelineMap.entries())
      .map(([date, v]) => ({ date, ...v }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const orderDonut = Array.from(orderDonutMap.entries()).map(
      ([status, count]) => ({ status, count }),
    );

    const detailTable: DetailRow[] = productions.slice(0, 200).map((p) => {
      const pallet = p.pallet ?? palletById.get(p.palletId);
      const productionCost = toNumber(pallet?.productionCost);
      const net = p.deliveredQuantity - p.reformedQuantity;
      return {
        id: p.id,
        createdAt: p.createdAt,
        userName: p.user?.name ?? userById.get(p.userId)?.name ?? '—',
        palletName: pallet?.name ?? '—',
        palletVersion: pallet?.version ?? 1,
        deliveredQuantity: p.deliveredQuantity,
        reformedQuantity: p.reformedQuantity,
        status: p.status,
        payableBRL: net * productionCost,
      };
    });

    return {
      kpis: {
        ordersDelivered,
        palletsProduced,
        salesTotalBRL,
        reformCostBRL,
        activeCollaborators: activeCollaborators.size,
      },
      palletBar,
      userBar,
      timeline,
      orderDonut,
      detailTable,
    };
  }
}
