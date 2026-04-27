"use client";

import { Cell, Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type {
  OrderStatusKey,
  ReportSummary,
} from "@/services/reports.service";

const STATUS_LABEL: Record<OrderStatusKey, string> = {
  OPEN: "Aberto",
  IN_PRODUCTION: "Em produção",
  DONE: "Entregue",
  CANCELED: "Cancelado",
};

const STATUS_COLOR: Record<OrderStatusKey, string> = {
  OPEN: "var(--chart-open, #B8860B)",
  IN_PRODUCTION: "var(--chart-inprod, #8B5E3C)",
  DONE: "var(--chart-done, #4A9C7F)",
  CANCELED: "var(--chart-cancel, #B8250B)",
};

const config = {
  count: { label: "Pedidos" },
  OPEN: { label: STATUS_LABEL.OPEN, color: STATUS_COLOR.OPEN },
  IN_PRODUCTION: {
    label: STATUS_LABEL.IN_PRODUCTION,
    color: STATUS_COLOR.IN_PRODUCTION,
  },
  DONE: { label: STATUS_LABEL.DONE, color: STATUS_COLOR.DONE },
  CANCELED: { label: STATUS_LABEL.CANCELED, color: STATUS_COLOR.CANCELED },
} satisfies ChartConfig;

export function OrderDonutWidget({
  data,
}: {
  data: ReportSummary["orderDonut"];
}) {
  const total = data.reduce((a, d) => a + d.count, 0);

  if (total === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhum pedido no período.
      </p>
    );
  }

  const chartData = data.map((d) => ({
    name: STATUS_LABEL[d.status],
    value: d.count,
    key: d.status,
  }));

  return (
    <div className="flex flex-col md:flex-row items-center gap-4">
      <ChartContainer
        config={config}
        className="h-56 w-56 aspect-square shrink-0"
      >
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius={50}
            outerRadius={85}
            paddingAngle={2}
          >
            {chartData.map((d) => (
              <Cell key={d.key} fill={STATUS_COLOR[d.key]} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
      <ul className="grid grid-cols-2 gap-2 text-sm flex-1">
        {chartData.map((d) => (
          <li key={d.key} className="flex items-center gap-2">
            <span
              className="size-2.5 rounded-full"
              style={{ background: STATUS_COLOR[d.key] }}
            />
            <span className="flex-1 truncate">{d.name}</span>
            <span className="tabular-nums text-muted-foreground">
              {d.value} ({Math.round((d.value / total) * 100)}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
