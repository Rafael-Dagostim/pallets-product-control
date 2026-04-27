"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PageHeader } from "@/components/shared/page-header";
import { KanbanBoard, type KanbanColumnDef } from "@/components/shared/kanban-board";
import { StatusBadge } from "@/components/shared/status-badge";
import { DetailModal } from "@/components/shared/detail-modal";
import { FormModal } from "@/components/shared/form-modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  ComboboxField,
  DatePickerField,
  IntegerInput,
} from "@/components/shared/form-fields";
import {
  productionHistoryService,
  type ProductionHistory,
  type ProductionStatus,
} from "@/services/production-history.service";
import { palletsService, type Pallet } from "@/services/pallets.service";
import { usersService, type User } from "@/services/users.service";
import { useAuth } from "@/contexts/auth-context";

const STATUS_LABELS: Record<ProductionStatus, string> = {
  OPEN: "Em Produção",
  VERIFIED: "Verificado",
  CANCELED: "Cancelado",
  PAID: "Pago",
};

const STATUS_COLORS: Record<ProductionStatus, string> = {
  OPEN: "bg-status-open text-white",
  VERIFIED: "bg-status-production text-white",
  CANCELED: "bg-status-canceled text-white",
  PAID: "bg-status-active text-white",
};

const KANBAN_COLUMNS: KanbanColumnDef[] = [
  { status: "OPEN", label: "Em Produção", headerColor: "bg-status-open" },
  { status: "VERIFIED", label: "Verificado", headerColor: "bg-status-production" },
  { status: "CANCELED", label: "Cancelado", headerColor: "bg-status-canceled" },
];

const NEXT_STATUS: Partial<Record<ProductionStatus, ProductionStatus>> = {
  OPEN: "VERIFIED",
  VERIFIED: "PAID",
};

const ADVANCE_LABEL: Partial<Record<ProductionStatus, string>> = {
  OPEN: "Verificar",
  VERIFIED: "Marcar como Pago",
};

function toISODate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

const createSchema = z.object({
  userId: z.string().min(1, "Selecione um colaborador"),
  palletId: z.string().min(1, "Selecione um palete"),
  deliveredQuantity: z
    .number({ message: "Informe a quantidade" })
    .int()
    .positive("Deve ser maior que zero"),
});

type CreateValues = z.infer<typeof createSchema>;

export default function ProductionPage() {
  const { user: authUser } = useAuth();
  const [records, setRecords] = useState<ProductionHistory[]>([]);
  const [pallets, setPallets] = useState<Pallet[]>([]);
  const [workers, setWorkers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

  const [selectedRecord, setSelectedRecord] = useState<ProductionHistory | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [transitionOpen, setTransitionOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [reformedQuantity, setReformedQuantity] = useState<number | undefined>();
  const [observation, setObservation] = useState("");

  const today = useMemo(() => new Date(), []);
  const todayISO = toISODate(today);
  const selectedISO = toISODate(selectedDate);
  const isToday = selectedISO === todayISO;
  const isAdmin = authUser?.role === "ADMIN";
  const isManager = authUser?.role === "MANAGER";
  const canCreate = isAdmin || isManager;
  const canTransition = (isAdmin || isManager) && (isToday || isAdmin);

  const createForm = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      userId: "",
      palletId: "",
      deliveredQuantity: undefined as unknown as number,
    },
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [recordsData, palletsData, usersData] = await Promise.all([
        productionHistoryService.getAll(selectedISO),
        palletsService.getAll(),
        usersService.getAll().catch(() => []),
      ]);
      setRecords(recordsData);
      setPallets(palletsData);
      setWorkers(
        usersData.filter((u) => u.role === "EMPLOYEE" || u.role === "MANAGER"),
      );
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar produção");
    } finally {
      setIsLoading(false);
    }
  }, [selectedISO]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleCardClick(record: ProductionHistory) {
    setSelectedRecord(record);
    setDetailOpen(true);
  }

  function openCreate() {
    createForm.reset({
      userId: "",
      palletId: "",
      deliveredQuantity: undefined as unknown as number,
    });
    setCreateOpen(true);
  }

  function openTransition(record: ProductionHistory) {
    setSelectedRecord(record);
    setReformedQuantity(undefined);
    setDetailOpen(false);
    setTransitionOpen(true);
  }

  function openCancel(record: ProductionHistory) {
    setSelectedRecord(record);
    setObservation("");
    setDetailOpen(false);
    setCancelOpen(true);
  }

  async function onCreate(values: CreateValues) {
    try {
      await productionHistoryService.create(values);
      toast.success("Produção aberta");
      setCreateOpen(false);
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Erro ao criar registro");
    }
  }

  async function handleAdvance(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedRecord) return;
    const next = NEXT_STATUS[selectedRecord.status];
    if (!next) return;
    setIsSubmitting(true);
    try {
      if (selectedRecord.status === "OPEN") {
        if (reformedQuantity === undefined) {
          toast.error("Informe a quantidade reformada");
          setIsSubmitting(false);
          return;
        }
        await productionHistoryService.update(selectedRecord.id, {
          status: next,
          reformedQuantity,
        });
      } else {
        await productionHistoryService.update(selectedRecord.id, { status: next });
      }
      toast.success("Status atualizado");
      setTransitionOpen(false);
      setSelectedRecord(null);
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Erro ao avançar status");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCancelSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedRecord) return;
    if (!observation.trim()) {
      toast.error("Informe o motivo do cancelamento");
      return;
    }
    setIsSubmitting(true);
    try {
      await productionHistoryService.update(selectedRecord.id, {
        status: "CANCELED",
        observation,
      });
      toast.success("Produção cancelada");
      setCancelOpen(false);
      setSelectedRecord(null);
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Erro ao cancelar");
    } finally {
      setIsSubmitting(false);
    }
  }

  const canAdvance = useMemo(() => {
    if (!selectedRecord || !canTransition) return false;
    return Boolean(NEXT_STATUS[selectedRecord.status]);
  }, [selectedRecord, canTransition]);

  const canCancel = useMemo(() => {
    if (!selectedRecord || !canTransition) return false;
    return selectedRecord.status === "OPEN" || selectedRecord.status === "VERIFIED";
  }, [selectedRecord, canTransition]);

  const workerOptions = workers.map((u) => ({ value: u.id, label: u.name }));
  const palletOptions = pallets.map((p) => ({
    value: p.id,
    label: `${p.name} (v${p.version})`,
  }));

  return (
    <>
      <PageHeader
        title="Produção"
        subtitle={`${records.length} registro${records.length !== 1 ? "s" : ""} em ${format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}`}
        actionLabel={canCreate && isToday ? "Novo Registro" : undefined}
        onAction={canCreate && isToday ? openCreate : undefined}
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="w-full sm:w-60">
          <DatePickerField
            value={selectedDate}
            onChange={(d) => d && setSelectedDate(d)}
            toDate={isAdmin ? undefined : today}
          />
        </div>
        {!isToday && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setSelectedDate(new Date())}
          >
            Hoje
          </Button>
        )}
        {!isToday && !isAdmin && (
          <span className="text-xs text-muted-foreground italic">
            (somente leitura — apenas admin altera dias anteriores)
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      ) : (
        <KanbanBoard
          columns={KANBAN_COLUMNS}
          items={records}
          statusKey="status"
          keyExtractor={(r) => r.id}
          onCardClick={handleCardClick}
          dragDisabled
          renderCard={(record) => (
            <div className="bg-card border border-border/40 rounded-lg p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-bold text-sm truncate">
                    {record.user?.name || "Colaborador"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {record.pallet?.name || "Palete"}
                  </p>
                </div>
                <StatusBadge
                  status={record.status}
                  labels={STATUS_LABELS}
                  colors={STATUS_COLORS}
                  className="text-[10px] px-2 py-0.5"
                />
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>
                  Entregue: <strong className="text-foreground">{record.deliveredQuantity}</strong>
                </span>
                {record.status !== "OPEN" && (
                  <>
                    <span>
                      Reformado: <strong className="text-foreground">{record.reformedQuantity}</strong>
                    </span>
                    <span>
                      Desmanchado:{" "}
                      <strong className="text-foreground">
                        {record.deliveredQuantity - record.reformedQuantity}
                      </strong>
                    </span>
                  </>
                )}
              </div>
            </div>
          )}
        />
      )}

      <DetailModal
        title="Registro de Produção"
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setSelectedRecord(null);
        }}
        badge={
          selectedRecord ? (
            <StatusBadge
              status={selectedRecord.status}
              labels={STATUS_LABELS}
              colors={STATUS_COLORS}
            />
          ) : undefined
        }
        footer={
          selectedRecord ? (
            <>
              {canCancel && (
                <Button
                  variant="destructive"
                  onClick={() => selectedRecord && openCancel(selectedRecord)}
                >
                  Cancelar
                </Button>
              )}
              {canAdvance && (
                <Button onClick={() => selectedRecord && openTransition(selectedRecord)}>
                  {ADVANCE_LABEL[selectedRecord.status] || "Avançar"}
                </Button>
              )}
            </>
          ) : null
        }
      >
        {selectedRecord && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Colaborador</p>
                <p className="text-sm font-medium">{selectedRecord.user?.name || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Palete</p>
                <p className="text-sm font-medium">{selectedRecord.pallet?.name || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Qtd. entregue</p>
                <p className="text-sm font-medium">{selectedRecord.deliveredQuantity}</p>
              </div>
              {selectedRecord.status !== "OPEN" && (
                <>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Qtd. reformada</p>
                    <p className="text-sm font-medium">{selectedRecord.reformedQuantity}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Desmanchado</p>
                    <p className="text-sm font-medium">
                      {selectedRecord.deliveredQuantity - selectedRecord.reformedQuantity}
                    </p>
                  </div>
                </>
              )}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Criado em</p>
                <p className="text-sm font-medium">
                  {new Date(selectedRecord.createdAt).toLocaleString("pt-BR")}
                </p>
              </div>
            </div>
            {selectedRecord.observation && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Observação</p>
                <p className="text-sm mt-1">{selectedRecord.observation}</p>
              </div>
            )}
          </div>
        )}
      </DetailModal>

      <FormModal
        title="Novo Registro de Produção"
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      >
        <Form {...createForm}>
          <form onSubmit={createForm.handleSubmit(onCreate)} className="space-y-5">
            <FormField
              control={createForm.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Colaborador</FormLabel>
                  <FormControl>
                    <ComboboxField
                      value={field.value || undefined}
                      onChange={(v) => field.onChange(v ?? "")}
                      options={workerOptions}
                      placeholder="Selecionar colaborador"
                      searchPlaceholder="Buscar..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={createForm.control}
              name="palletId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Palete</FormLabel>
                  <FormControl>
                    <ComboboxField
                      value={field.value || undefined}
                      onChange={(v) => field.onChange(v ?? "")}
                      options={palletOptions}
                      placeholder="Selecionar palete"
                      searchPlaceholder="Buscar..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={createForm.control}
              name="deliveredQuantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantidade entregue</FormLabel>
                  <FormControl>
                    <IntegerInput min={1} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createForm.formState.isSubmitting}>
                {createForm.formState.isSubmitting ? "Salvando..." : "Abrir produção"}
              </Button>
            </div>
          </form>
        </Form>
      </FormModal>

      <FormModal
        title={
          selectedRecord?.status === "OPEN"
            ? "Verificar Produção"
            : "Marcar como Pago"
        }
        open={transitionOpen}
        onClose={() => setTransitionOpen(false)}
      >
        <form onSubmit={handleAdvance} className="space-y-5">
          {selectedRecord?.status === "OPEN" && (
            <>
              <p className="text-sm text-muted-foreground">
                Entregue:{" "}
                <strong className="text-foreground">{selectedRecord.deliveredQuantity}</strong>
              </p>
              <div className="space-y-2">
                <label className="text-sm font-medium">Quantidade reformada</label>
                <IntegerInput
                  min={0}
                  max={selectedRecord?.deliveredQuantity}
                  value={reformedQuantity}
                  onChange={setReformedQuantity}
                  placeholder="0"
                />
              </div>
              {reformedQuantity !== undefined && selectedRecord && (
                <p className="text-xs text-muted-foreground">
                  Desmanchado: {selectedRecord.deliveredQuantity - reformedQuantity}
                </p>
              )}
            </>
          )}

          {selectedRecord?.status === "VERIFIED" && (
            <p className="text-sm text-muted-foreground">
              Confirma marcar esta produção como paga?
            </p>
          )}

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setTransitionOpen(false)}
            >
              Voltar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Confirmar"}
            </Button>
          </div>
        </form>
      </FormModal>

      <FormModal
        title="Cancelar Produção"
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
      >
        <form onSubmit={handleCancelSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Motivo do cancelamento</label>
            <Textarea
              placeholder="Descreva brevemente o motivo"
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setCancelOpen(false)}
            >
              Voltar
            </Button>
            <Button type="submit" variant="destructive" disabled={isSubmitting}>
              {isSubmitting ? "Cancelando..." : "Cancelar produção"}
            </Button>
          </div>
        </form>
      </FormModal>
    </>
  );
}
