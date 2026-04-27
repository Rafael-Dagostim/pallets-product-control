import type { WidgetType } from "@/services/reports.service";

export const WIDGET_CATALOG: {
  type: WidgetType;
  label: string;
  description: string;
}[] = [
  {
    type: "kpi",
    label: "KPIs",
    description: "Totais do período: pedidos, paletes, vendas, reformas.",
  },
  {
    type: "palletBar",
    label: "Produção por palete",
    description: "Barras com quantidade produzida por tipo de palete.",
  },
  {
    type: "userBar",
    label: "Produção por colaborador",
    description: "Barras com quantidade por colaborador (líquido).",
  },
  {
    type: "timeline",
    label: "Série temporal",
    description: "Produção diária ao longo do período.",
  },
  {
    type: "orderDonut",
    label: "Pedidos por status",
    description: "Distribuição dos pedidos abertos/em produção/entregues/cancelados.",
  },
  {
    type: "detailTable",
    label: "Tabela detalhada",
    description: "Lista dos registros de produção (até 200 linhas).",
  },
];

export function widgetLabel(type: WidgetType): string {
  return WIDGET_CATALOG.find((w) => w.type === type)?.label ?? type;
}
