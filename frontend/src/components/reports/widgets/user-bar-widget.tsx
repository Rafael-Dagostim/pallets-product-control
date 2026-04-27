"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { maskCurrencyBRL } from "@/lib/masks";
import type { ReportSummary } from "@/services/reports.service";

const config = {
  qty: { label: "Paletes", color: "var(--primary)" },
} satisfies ChartConfig;

export function UserBarWidget({ data }: { data: ReportSummary["userBar"] }) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhum colaborador produziu no período.
      </p>
    );
  }

  const chartData = data.slice(0, 12).map((d) => ({
    name: d.name,
    qty: d.qty,
    payable: d.payableBRL,
  }));

  return (
    <div className="space-y-3">
      <ChartContainer config={config} className="h-64 w-full aspect-auto">
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
        >
          <CartesianGrid horizontal={false} />
          <XAxis type="number" tickLine={false} axisLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            tickLine={false}
            axisLine={false}
            width={110}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="qty" fill="var(--color-qty)" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ChartContainer>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
        {chartData.map((d) => (
          <div
            key={d.name}
            className="flex items-center justify-between rounded-md border border-border/40 bg-card/60 px-3 py-1.5"
          >
            <span className="truncate">{d.name}</span>
            <span className="tabular-nums text-muted-foreground">
              {d.qty} • R$ {maskCurrencyBRL(d.payable)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
