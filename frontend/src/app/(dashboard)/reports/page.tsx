"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Printer } from "lucide-react";
import { toUTCRange } from "@/lib/date-range";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ReportFilters, type FilterState } from "@/components/reports/report-filters";
import { TemplatePicker } from "@/components/reports/template-picker";
import { TemplateEditorModal } from "@/components/reports/template-editor-modal";
import { WidgetRenderer } from "@/components/reports/widget-renderer";
import { PrintHeader } from "@/components/reports/print-header";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  reportsService,
  type ReportSummary,
  type ReportTemplate,
  type WidgetConfig,
} from "@/services/reports.service";
import { usersService, type User } from "@/services/users.service";
import { palletsService, type Pallet } from "@/services/pallets.service";
import { useRequireRole } from "@/hooks/use-require-role";

function subDays(d: Date, days: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() - days);
  return copy;
}

export default function ReportsPage() {
  const { isAllowed, isReady } = useRequireRole(["ADMIN", "MANAGER"]);
  const [filters, setFilters] = useState<FilterState>(() => ({
    from: subDays(new Date(), 30),
    to: new Date(),
  }));
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [users, setUsers] = useState<User[]>([]);
  const [pallets, setPallets] = useState<Pallet[]>([]);

  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null,
  );

  const [editorOpen, setEditorOpen] = useState(false);
  const [editorExisting, setEditorExisting] = useState<ReportTemplate | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === selectedTemplateId) ?? null,
    [templates, selectedTemplateId],
  );

  const loadReferenceData = useCallback(async () => {
    try {
      const [u, p, t] = await Promise.all([
        usersService.getAll(),
        palletsService.getAll(),
        reportsService.listTemplates(),
      ]);
      setUsers(u);
      setPallets(p);
      setTemplates(t);
      if (t.length > 0 && !selectedTemplateId) {
        setSelectedTemplateId(t[0].id);
      }
    } catch {
      toast.error("Erro ao carregar dados de apoio");
    }
  }, [selectedTemplateId]);

  const loadSummary = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await reportsService.getSummary({
        ...toUTCRange(filters.from, filters.to),
        userId: filters.userId,
        palletId: filters.palletId,
      });
      setSummary(data);
    } catch {
      toast.error("Erro ao carregar relatório");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (isAllowed) loadReferenceData();
  }, [loadReferenceData, isAllowed]);

  useEffect(() => {
    if (isAllowed) loadSummary();
  }, [loadSummary, isAllowed]);

  async function handleSubmitTemplate(dto: {
    name: string;
    widgets: WidgetConfig[];
  }) {
    setIsSubmitting(true);
    try {
      if (editorExisting) {
        const updated = await reportsService.updateTemplate(
          editorExisting.id,
          dto,
        );
        setTemplates((prev) =>
          prev.map((t) => (t.id === updated.id ? updated : t)),
        );
        setSelectedTemplateId(updated.id);
        toast.success("Template atualizado");
      } else {
        const created = await reportsService.createTemplate(dto);
        setTemplates((prev) => [...prev, created]);
        setSelectedTemplateId(created.id);
        toast.success("Template criado");
      }
      setEditorOpen(false);
      setEditorExisting(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao salvar template";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteTemplate() {
    if (!selectedTemplate) return;
    setIsSubmitting(true);
    try {
      await reportsService.removeTemplate(selectedTemplate.id);
      setTemplates((prev) => prev.filter((t) => t.id !== selectedTemplate.id));
      setSelectedTemplateId((prev) => {
        if (prev !== selectedTemplate.id) return prev;
        const rest = templates.filter((t) => t.id !== selectedTemplate.id);
        return rest[0]?.id ?? null;
      });
      setConfirmDeleteOpen(false);
      toast.success("Template excluído");
    } catch {
      toast.error("Erro ao excluir template");
    } finally {
      setIsSubmitting(false);
    }
  }

  const activeUserName = filters.userId
    ? users.find((u) => u.id === filters.userId)?.name
    : undefined;
  const activePalletLabel = filters.palletId
    ? (() => {
        const p = pallets.find((p) => p.id === filters.palletId);
        return p ? `${p.name} v${p.version}` : undefined;
      })()
    : undefined;

  if (!isReady || !isAllowed) return null;

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="flex flex-col gap-3 mb-4 md:flex-row md:items-end md:justify-between print:hidden">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Relatórios
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Combine widgets em templates e imprima o resultado.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <TemplatePicker
            templates={templates}
            selectedId={selectedTemplateId}
            onSelect={setSelectedTemplateId}
            onCreate={() => {
              setEditorExisting(null);
              setEditorOpen(true);
            }}
            onEdit={() => {
              if (!selectedTemplate) return;
              setEditorExisting(selectedTemplate);
              setEditorOpen(true);
            }}
            onDelete={() => setConfirmDeleteOpen(true)}
          />
          <Button
            onClick={() => window.print()}
            disabled={!selectedTemplate || !summary}
          >
            <Printer className="size-4 mr-1" />
            Imprimir
          </Button>
        </div>
      </div>

      <div className="mb-5 print:hidden">
        <ReportFilters
          value={filters}
          onChange={setFilters}
          users={users}
          pallets={pallets}
        />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto themed-scroll pr-1 print:overflow-visible print:pr-0">
        {!selectedTemplate ? (
          <div className="flex flex-col items-center justify-center py-20 text-center print:hidden">
            <h2 className="text-lg font-semibold mb-1">
              Nenhum template selecionado
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Crie um template para montar seu relatório.
            </p>
            <Button
              onClick={() => {
                setEditorExisting(null);
                setEditorOpen(true);
              }}
            >
              Criar template
            </Button>
          </div>
        ) : isLoading || !summary ? (
          <div className="text-sm text-muted-foreground py-10 text-center">
            Carregando...
          </div>
        ) : (
          <div className="print-area space-y-4">
            <PrintHeader
              templateName={selectedTemplate.name}
              filters={{
                ...toUTCRange(filters.from, filters.to),
                userId: filters.userId,
                palletId: filters.palletId,
              }}
              userName={activeUserName}
              palletLabel={activePalletLabel}
            />
            {selectedTemplate.widgets.map((widget, i) => (
              <WidgetRenderer
                key={`${widget.type}-${i}`}
                widget={widget}
                summary={summary}
              />
            ))}
          </div>
        )}
      </div>

      <TemplateEditorModal
        open={editorOpen}
        onClose={() => {
          setEditorOpen(false);
          setEditorExisting(null);
        }}
        onSubmit={handleSubmitTemplate}
        existing={editorExisting}
        isSubmitting={isSubmitting}
      />
      <ConfirmDialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDeleteTemplate}
        title="Excluir template"
        description={`Deseja mesmo excluir "${selectedTemplate?.name ?? ""}"?`}
        confirmLabel="Excluir"
        isLoading={isSubmitting}
      />
    </div>
  );
}
