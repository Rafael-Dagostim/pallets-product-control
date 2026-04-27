"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { FormModal } from "@/components/shared/form-modal";
import { Button } from "@/components/ui/button";
import { maskCurrencyBRL } from "@/lib/masks";
import { aggregateByPallet } from "@/lib/payroll";
import type { ProductionHistory } from "@/services/production-history.service";

interface PayrollSummaryModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  entries: ProductionHistory[];
  userName: string;
  from?: Date;
  to?: Date;
}

export function PayrollSummaryModal({
  open,
  onClose,
  onConfirm,
  isSubmitting,
  entries,
  userName,
  from,
  to,
}: PayrollSummaryModalProps) {
  const summary = useMemo(() => aggregateByPallet(entries), [entries]);

  const periodLabel =
    from && to
      ? `${format(from, "dd/MM/yyyy")} a ${format(to, "dd/MM/yyyy")}`
      : "—";

  return (
    <FormModal
      title="Resumo da Folha de Pagamento"
      description={`${userName} · ${periodLabel}`}
      open={open}
      onClose={onClose}
      size="xl"
    >
      <div className="space-y-4">
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="grid grid-cols-[1fr_80px_120px_130px] bg-secondary text-white text-xs uppercase tracking-wide font-semibold px-3 py-2">
            <div>Palete</div>
            <div className="text-right">Qtd</div>
            <div className="text-right">Unitário</div>
            <div className="text-right">Subtotal</div>
          </div>
          {summary.rows.length === 0 ? (
            <div className="px-3 py-6 text-sm text-muted-foreground text-center">
              Nenhum registro pagável selecionado.
            </div>
          ) : (
            summary.rows.map((row) => (
              <div
                key={row.palletId}
                className="grid grid-cols-[1fr_80px_120px_130px] px-3 py-2 text-sm border-t border-border/30"
              >
                <div className="font-medium truncate">
                  {row.name}{" "}
                  <span className="text-muted-foreground">v{row.version}</span>
                </div>
                <div className="text-right tabular-nums">{row.qty}</div>
                <div className="text-right tabular-nums">
                  R$ {maskCurrencyBRL(row.unit)}
                </div>
                <div className="text-right tabular-nums">
                  R$ {maskCurrencyBRL(row.subtotal)}
                </div>
              </div>
            ))
          )}
          <div className="grid grid-cols-[1fr_80px_120px_130px] bg-primary/10 border-t-2 border-primary px-3 py-2.5 text-sm font-semibold">
            <div>Total</div>
            <div className="text-right tabular-nums">
              {summary.rows.reduce((a, r) => a + r.qty, 0)}
            </div>
            <div></div>
            <div className="text-right tabular-nums text-primary">
              R$ {maskCurrencyBRL(summary.total)}
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Ao confirmar, os registros selecionados terão o status alterado para{" "}
          <strong>Pago</strong> e o PDF da nota será baixado automaticamente.
        </p>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting || summary.rows.length === 0}
          >
            {isSubmitting
              ? "Processando..."
              : "Marcar como pago e gerar Nota"}
          </Button>
        </div>
      </div>
    </FormModal>
  );
}
