"use client";

import { format, parseISO } from "date-fns";
import { DataTable, type Column } from "@/components/shared/data-table";
import { maskCurrencyBRL } from "@/lib/masks";
import type {
  ProductionStatusKey,
  ReportSummary,
} from "@/services/reports.service";

const STATUS_LABELS: Record<ProductionStatusKey, string> = {
  OPEN: "Em Produção",
  VERIFIED: "Verificado",
  CANCELED: "Cancelado",
  PAID: "Pago",
};

type Row = ReportSummary["detailTable"][number];

const columns: Column<Row>[] = [
  {
    key: "createdAt",
    label: "Data",
    render: (r) => format(parseISO(r.createdAt), "dd/MM/yyyy"),
  },
  { key: "userName", label: "Colaborador", render: (r) => r.userName },
  {
    key: "pallet",
    label: "Palete",
    render: (r) => (
      <span className="font-medium">
        {r.palletName}{" "}
        <span className="text-muted-foreground font-normal">
          v{r.palletVersion}
        </span>
      </span>
    ),
  },
  {
    key: "qty",
    label: "Qtd",
    render: (r) => (
      <span className="tabular-nums whitespace-nowrap">
        {r.deliveredQuantity}
        <span className="text-muted-foreground text-xs ml-1">
          (-{r.reformedQuantity})
        </span>
      </span>
    ),
  },
  {
    key: "payable",
    label: "Valor",
    render: (r) => (
      <span className="tabular-nums whitespace-nowrap">
        R$ {maskCurrencyBRL(r.payableBRL)}
      </span>
    ),
  },
  {
    key: "status",
    label: "Status",
    render: (r) => (
      <span className="text-xs text-muted-foreground">
        {STATUS_LABELS[r.status]}
      </span>
    ),
  },
];

export function DetailTableWidget({
  data,
}: {
  data: ReportSummary["detailTable"];
}) {
  return (
    <DataTable
      columns={columns}
      data={data}
      keyExtractor={(r) => r.id}
      emptyMessage="Nenhum registro no período."
    />
  );
}
