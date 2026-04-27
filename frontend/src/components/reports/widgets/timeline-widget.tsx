"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { ReportSummary } from "@/services/reports.service";

const config = {
  produced: { label: "Produzido (líquido)", color: "var(--primary)" },
  delivered: { label: "Entregue", color: "#4A9C7F" },
  reformed: { label: "Reformado", color: "var(--destructive)" },
} satisfies ChartConfig;

export function TimelineWidget({
  data,
}: {
  data: ReportSummary["timeline"];
}) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Sem dados de produção no período.
      </p>
    );
  }

  return (
    <ChartContainer config={config} className="h-64 w-full aspect-auto">
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) =>
            format(parseISO(v as string), "dd/MM", { locale: ptBR })
          }
        />
        <YAxis tickLine={false} axisLine={false} width={40} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(v) =>
                format(parseISO(v as string), "dd/MM/yyyy", { locale: ptBR })
              }
            />
          }
        />
        <Line
          type="monotone"
          dataKey="produced"
          stroke="var(--color-produced)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="delivered"
          stroke="var(--color-delivered)"
          strokeWidth={1.5}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="reformed"
          stroke="var(--color-reformed)"
          strokeWidth={1.5}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  );
}
