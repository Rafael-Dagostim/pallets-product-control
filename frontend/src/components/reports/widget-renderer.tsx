"use client";

import { Card } from "@/components/ui/card";
import type {
  ReportSummary,
  WidgetConfig,
} from "@/services/reports.service";
import { widgetLabel } from "@/lib/reports";
import { KpiGrid } from "./widgets/kpi-grid";
import { PalletBarWidget } from "./widgets/pallet-bar-widget";
import { UserBarWidget } from "./widgets/user-bar-widget";
import { TimelineWidget } from "./widgets/timeline-widget";
import { OrderDonutWidget } from "./widgets/order-donut-widget";
import { DetailTableWidget } from "./widgets/detail-table-widget";

interface Props {
  widget: WidgetConfig;
  summary: ReportSummary;
}

export function WidgetRenderer({ widget, summary }: Props) {
  // KPIs don't need a bounding card — they're cards themselves.
  if (widget.type === "kpi") {
    return (
      <section className="print-break">
        <KpiGrid kpis={summary.kpis} />
      </section>
    );
  }

  return (
    <Card className="p-4 md:p-5 gap-3 print-break">
      <header className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold tracking-tight uppercase text-muted-foreground">
          {widgetLabel(widget.type)}
        </h3>
      </header>
      {widget.type === "palletBar" && (
        <PalletBarWidget data={summary.palletBar} />
      )}
      {widget.type === "userBar" && <UserBarWidget data={summary.userBar} />}
      {widget.type === "timeline" && (
        <TimelineWidget data={summary.timeline} />
      )}
      {widget.type === "orderDonut" && (
        <OrderDonutWidget data={summary.orderDonut} />
      )}
      {widget.type === "detailTable" && (
        <DetailTableWidget data={summary.detailTable} />
      )}
    </Card>
  );
}
