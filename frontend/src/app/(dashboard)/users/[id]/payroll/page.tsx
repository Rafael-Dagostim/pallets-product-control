"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { toUTCRange } from "@/lib/date-range";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerField } from "@/components/shared/form-fields/date-picker-field";
import { DataTable, type Column } from "@/components/shared/data-table";
import { PayrollSummaryModal } from "@/components/payroll/payroll-summary-modal";
import { downloadPayrollPdf } from "@/components/payroll/payroll-pdf";
import { maskCurrencyBRL } from "@/lib/masks";
import { calcPayable, aggregateByPallet } from "@/lib/payroll";
import { usersService, type User } from "@/services/users.service";
import {
  productionHistoryService,
  type ProductionHistory,
  type ProductionStatus,
} from "@/services/production-history.service";

const STATUS_LABELS: Record<ProductionStatus, string> = {
  OPEN: "Em Produção",
  VERIFIED: "Verificado",
  CANCELED: "Cancelado",
  PAID: "Pago",
};

const STATUS_FILTERS: { value: ProductionStatus | "ALL"; label: string }[] = [
  { value: "VERIFIED", label: "Verificados (elegíveis)" },
  { value: "OPEN", label: "Em produção" },
  { value: "PAID", label: "Pagos" },
  { value: "CANCELED", label: "Cancelados" },
  { value: "ALL", label: "Todos" },
];

const STATUS_BADGE: Record<ProductionStatus, string> = {
  OPEN: "bg-status-open/15 text-status-open",
  VERIFIED: "bg-status-production/15 text-status-production",
  CANCELED: "bg-status-canceled/15 text-status-canceled",
  PAID: "bg-status-active/15 text-status-active",
};

function subDays(d: Date, days: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() - days);
  return copy;
}

export default function UserPayrollPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const userId = params.id;

  const [user, setUser] = useState<User | null>(null);
  const [records, setRecords] = useState<ProductionHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [from, setFrom] = useState<Date>(() => subDays(new Date(), 30));
  const [to, setTo] = useState<Date>(() => new Date());
  const [status, setStatus] = useState<ProductionStatus | "ALL">("VERIFIED");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadUser = useCallback(async () => {
    try {
      const u = await usersService.getById(userId);
      setUser(u);
    } catch {
      toast.error("Colaborador não encontrado");
      router.push("/users");
    }
  }, [userId, router]);

  const loadRecords = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await productionHistoryService.getAll({
        userId,
        ...toUTCRange(from, to),
        ...(status !== "ALL" ? { status } : {}),
      });
      setRecords(data);
      setSelectedIds((prev) => {
        const valid = new Set(
          data.filter((r) => r.status === "VERIFIED").map((r) => r.id),
        );
        const next = new Set<string>();
        prev.forEach((id) => valid.has(id) && next.add(id));
        return next;
      });
    } catch {
      toast.error("Erro ao carregar histórico");
    } finally {
      setIsLoading(false);
    }
  }, [userId, from, to, status]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const verifiedInPeriod = useMemo(
    () => records.filter((r) => r.status === "VERIFIED"),
    [records],
  );

  const allVerifiedSelected =
    verifiedInPeriod.length > 0 &&
    verifiedInPeriod.every((r) => selectedIds.has(r.id));

  function toggleOne(id: string, record: ProductionHistory) {
    if (record.status !== "VERIFIED") return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelectedIds((prev) => {
      if (allVerifiedSelected) return new Set();
      const next = new Set(prev);
      verifiedInPeriod.forEach((r) => next.add(r.id));
      return next;
    });
  }

  const selectedEntries = useMemo(
    () => records.filter((r) => selectedIds.has(r.id)),
    [records, selectedIds],
  );

  const selectedTotal = useMemo(
    () => aggregateByPallet(selectedEntries).total,
    [selectedEntries],
  );

  async function handleConfirmPay() {
    if (selectedEntries.length === 0) return;
    setIsSubmitting(true);
    try {
      await productionHistoryService.bulkPay([...selectedIds]);
      await downloadPayrollPdf({
        userName: user?.name ?? "Colaborador",
        entries: selectedEntries,
        from,
        to,
      });
      toast.success("Folha paga e nota gerada com sucesso");
      setSummaryOpen(false);
      setSelectedIds(new Set());
      loadRecords();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao processar folha";
      toast.error(message);
      loadRecords();
    } finally {
      setIsSubmitting(false);
    }
  }

  const columns: Column<ProductionHistory>[] = [
    {
      key: "select",
      label: "",
      render: (r) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={selectedIds.has(r.id)}
            disabled={r.status !== "VERIFIED"}
            onCheckedChange={() => toggleOne(r.id, r)}
            aria-label="Selecionar"
          />
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Data",
      render: (r) => format(new Date(r.createdAt), "dd/MM/yyyy"),
    },
    {
      key: "pallet",
      label: "Palete",
      render: (r) => (
        <span className="font-medium block truncate max-w-[180px]">
          {r.pallet?.name}{" "}
          <span className="text-muted-foreground font-normal">
            v{r.pallet?.version}
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
      label: "A pagar",
      render: (r) => (
        <span className="tabular-nums font-medium whitespace-nowrap">
          R$ {maskCurrencyBRL(calcPayable(r))}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (r) => (
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[r.status]}`}
        >
          {STATUS_LABELS[r.status]}
        </span>
      ),
    },
  ];

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="flex items-center gap-2 mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/users")}
          className="-ml-2"
        >
          <ArrowLeft className="size-4 mr-1" />
          Colaboradores
        </Button>
      </div>

      <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            {user?.name ?? "..."}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Folha de Pagamento
          </p>
        </div>
        <Button
          onClick={() => setSummaryOpen(true)}
          disabled={selectedEntries.length === 0}
        >
          <FileText className="size-4 mr-1" />
          Gerar folha ({selectedIds.size})
        </Button>
      </div>

      <div className="flex flex-col gap-3 mb-5 md:flex-row md:items-end">
        <div className="flex-1 min-w-0">
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            De
          </label>
          <DatePickerField
            value={from}
            onChange={(d) => {
              if (!d) return;
              setFrom(d);
              if (d > to) {
                const next = new Date(d);
                next.setDate(next.getDate() + 30);
                setTo(next);
              }
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Até
          </label>
          <DatePickerField value={to} onChange={(d) => d && setTo(d)} />
        </div>
        <div className="flex-1 min-w-0">
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Status
          </label>
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as ProductionStatus | "ALL")}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {verifiedInPeriod.length > 0 && (
        <div className="flex flex-col gap-2 mb-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <Checkbox
              checked={allVerifiedSelected}
              onCheckedChange={toggleAll}
            />
            <span>Selecionar todos verificados do período</span>
          </label>
          <div className="text-sm">
            <span className="text-muted-foreground">
              {selectedIds.size} selecionado{selectedIds.size === 1 ? "" : "s"} ·{" "}
            </span>
            <span className="font-semibold text-primary tabular-nums">
              R$ {maskCurrencyBRL(selectedTotal)}
            </span>
          </div>
        </div>
      )}

      <div className="flex-1 min-h-0 flex flex-col">
        <DataTable
          columns={columns}
          data={records}
          keyExtractor={(r) => r.id}
          isLoading={isLoading}
          emptyMessage="Nenhum registro de produção no período."
          fillHeight
        />
      </div>

      <PayrollSummaryModal
        open={summaryOpen}
        onClose={() => setSummaryOpen(false)}
        onConfirm={handleConfirmPay}
        isSubmitting={isSubmitting}
        entries={selectedEntries}
        userName={user?.name ?? ""}
        from={from}
        to={to}
      />
    </div>
  );
}
