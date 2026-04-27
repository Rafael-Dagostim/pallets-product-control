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
import type { ReportSummary } from "@/services/reports.service";

const config = {
  qty: { label: "Quantidade", color: "var(--primary)" },
} satisfies ChartConfig;

export function PalletBarWidget({
  data,
}: {
  data: ReportSummary["palletBar"];
}) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhuma produção no período.
      </p>
    );
  }

  const chartData = data.slice(0, 12).map((d) => ({
    label: `${d.name} v${d.version}`,
    qty: d.qty,
  }));

  return (
    <ChartContainer config={config} className="h-60 w-full aspect-auto">
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          interval={0}
          angle={-15}
          height={50}
          textAnchor="end"
        />
        <YAxis tickLine={false} axisLine={false} width={40} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="qty" fill="var(--color-qty)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
