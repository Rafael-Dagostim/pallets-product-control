import type { ProductionHistory } from "@/services/production-history.service";

export function calcPayable(entry: ProductionHistory): number {
  const qty = entry.deliveredQuantity - entry.reformedQuantity;
  const unit = Number(entry.pallet?.productionCost ?? 0);
  return qty * unit;
}

export interface PayrollRow {
  palletId: string;
  name: string;
  version: number;
  unit: number;
  qty: number;
  subtotal: number;
}

export interface PayrollSummary {
  rows: PayrollRow[];
  total: number;
}

export function aggregateByPallet(entries: ProductionHistory[]): PayrollSummary {
  const map = new Map<string, PayrollRow>();

  for (const e of entries) {
    if (!e.pallet) continue;
    const qty = e.deliveredQuantity - e.reformedQuantity;
    if (qty <= 0) continue;
    const unit = Number(e.pallet.productionCost);
    const current = map.get(e.palletId);
    if (current) {
      current.qty += qty;
      current.subtotal = current.qty * current.unit;
    } else {
      map.set(e.palletId, {
        palletId: e.palletId,
        name: e.pallet.name,
        version: e.pallet.version,
        unit,
        qty,
        subtotal: qty * unit,
      });
    }
  }

  const rows = [...map.values()].sort((a, b) =>
    a.name.localeCompare(b.name, "pt-BR"),
  );
  const total = rows.reduce((acc, r) => acc + r.subtotal, 0);

  return { rows, total };
}

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
