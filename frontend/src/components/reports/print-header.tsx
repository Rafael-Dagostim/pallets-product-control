"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PalletLogo } from "@/components/shared/pallet-logo";
import type { ReportFilters } from "@/services/reports.service";

interface PrintHeaderProps {
  templateName: string;
  filters: ReportFilters;
  userName?: string;
  palletLabel?: string;
}

export function PrintHeader({
  templateName,
  filters,
  userName,
  palletLabel,
}: PrintHeaderProps) {
  const period = `${format(new Date(filters.from), "dd/MM/yyyy")} a ${format(
    new Date(filters.to),
    "dd/MM/yyyy",
  )}`;

  return (
    <div className="hidden print:block mb-6 pb-4 border-b-2 border-primary">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <PalletLogo variant="icon" className="h-8 w-auto" />
          <div>
            <div className="text-xl font-bold tracking-[0.2em] text-primary">
              PALETES
            </div>
            <div className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
              Maracajá
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold text-foreground">
            {templateName}
          </div>
          <div className="text-xs text-muted-foreground">
            Emitido em{" "}
            {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </div>
        </div>
      </div>
      <dl className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-1 text-xs">
        <div>
          <dt className="uppercase text-muted-foreground">Período</dt>
          <dd className="font-medium">{period}</dd>
        </div>
        {userName && (
          <div>
            <dt className="uppercase text-muted-foreground">Colaborador</dt>
            <dd className="font-medium">{userName}</dd>
          </div>
        )}
        {palletLabel && (
          <div>
            <dt className="uppercase text-muted-foreground">Palete</dt>
            <dd className="font-medium">{palletLabel}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
