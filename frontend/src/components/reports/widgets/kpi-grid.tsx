"use client";

import { Card } from "@/components/ui/card";
import { maskCurrencyBRL } from "@/lib/masks";
import type { ReportSummary } from "@/services/reports.service";

interface KpiGridProps {
  kpis: ReportSummary["kpis"];
}

export function KpiGrid({ kpis }: KpiGridProps) {
  const items = [
    { label: "Pedidos entregues", value: kpis.ordersDelivered.toString() },
    { label: "Paletes produzidos", value: kpis.palletsProduced.toString() },
    {
      label: "Vendas",
      value: `R$ ${maskCurrencyBRL(kpis.salesTotalBRL)}`,
    },
    {
      label: "Reformas",
      value: `R$ ${maskCurrencyBRL(kpis.reformCostBRL)}`,
    },
    { label: "Colaboradores ativos", value: kpis.activeCollaborators.toString() },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
      {items.map((it) => (
        <Card key={it.label} className="p-4 gap-1">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            {it.label}
          </div>
          <div className="text-xl md:text-2xl font-semibold tabular-nums text-foreground">
            {it.value}
          </div>
        </Card>
      ))}
    </div>
  );
}
