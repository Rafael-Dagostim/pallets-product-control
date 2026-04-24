"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { KanbanBoard, type KanbanColumnDef } from "@/components/shared/kanban-board";
import { StatusBadge } from "@/components/shared/status-badge";
import { DetailModal } from "@/components/shared/detail-modal";
import { FormModal } from "@/components/shared/form-modal";
import { UnderlineInput } from "@/components/shared/underline-input";
import { Button } from "@/components/ui/button";
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

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function ProductionPage() {
  const { user: authUser } = useAuth();
  const [records, setRecords] = useState<ProductionHistory[]>([]);
  const [pallets, setPallets] = useState<Pallet[]>([]);
  const [workers, setWorkers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(todayISO());

  const [selectedRecord, setSelectedRecord] = useState<ProductionHistory | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [transitionOpen, setTransitionOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [userId, setUserId] = useState("");
  const [palletId, setPalletId] = useState("");
  const [deliveredQuantity, setDeliveredQuantity] = useState("");
  const [reformedQuantity, setReformedQuantity] = useState("");
  const [observation, setObservation] = useState("");

  const isToday = selectedDate === todayISO();
  const isAdmin = authUser?.role === "ADMIN";
  const isManager = authUser?.role === "MANAGER";
  const canCreate = isAdmin || isManager;
  const canTransition = (isAdmin || isManager) && (isToday || isAdmin);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [recordsData, palletsData, usersData] = await Promise.all([
        productionHistoryService.getAll(selectedDate),
        palletsService.getAll(),
        usersService.getAll().catch(() => []),
      ]);
      setRecords(recordsData);
      setPallets(palletsData);
      setWorkers(usersData.filter((u) => u.role === "EMPLOYEE" || u.role === "MANAGER"));
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleCardClick(record: ProductionHistory) {
    setSelectedRecord(record);
    setDetailOpen(true);
  }

  function openCreate() {
    setUserId(workers[0]?.id || "");
    setPalletId(pallets[0]?.id || "");
    setDeliveredQuantity("");
    setFormError(null);
    setCreateOpen(true);
  }

  function openTransition(record: ProductionHistory) {
    setSelectedRecord(record);
    setReformedQuantity("");
    setFormError(null);
    setDetailOpen(false);
    setTransitionOpen(true);
  }

  function openCancel(record: ProductionHistory) {
    setSelectedRecord(record);
    setObservation("");
    setFormError(null);
    setDetailOpen(false);
    setCancelOpen(true);
  }

  async function handleCreateSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      await productionHistoryService.create({
        userId,
        palletId,
        deliveredQuantity: Number(deliveredQuantity),
      });
      setCreateOpen(false);
      await loadData();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Erro ao criar registro");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAdvance(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedRecord) return;
    const next = NEXT_STATUS[selectedRecord.status];
    if (!next) return;
    setFormError(null);
    setIsSubmitting(true);
    try {
      if (selectedRecord.status === "OPEN") {
        await productionHistoryService.update(selectedRecord.id, {
          status: next,
          reformedQuantity: Number(reformedQuantity),
        });
      } else {
        await productionHistoryService.update(selectedRecord.id, { status: next });
      }
      setTransitionOpen(false);
      setSelectedRecord(null);
      await loadData();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Erro ao avançar status");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCancelSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedRecord) return;
    setFormError(null);
    setIsSubmitting(true);
    try {
      await productionHistoryService.update(selectedRecord.id, {
        status: "CANCELED",
        observation,
      });
      setCancelOpen(false);
      setSelectedRecord(null);
      await loadData();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Erro ao cancelar");
    } finally {
      setIsSubmitting(false);
    }
  }

  const canAdvance = useMemo(() => {
    if (!selectedRecord) return false;
    if (!canTransition) return false;
    return Boolean(NEXT_STATUS[selectedRecord.status]);
  }, [selectedRecord, canTransition]);

  const canCancel = useMemo(() => {
    if (!selectedRecord) return false;
    if (!canTransition) return false;
    return selectedRecord.status === "OPEN" || selectedRecord.status === "VERIFIED";
  }, [selectedRecord, canTransition]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Produção"
        subtitle={`${records.length} registro${records.length !== 1 ? "s" : ""} em ${new Date(selectedDate + "T00:00:00").toLocaleDateString("pt-BR")}`}
        actionLabel={canCreate && isToday ? "Novo Registro" : undefined}
        onAction={canCreate && isToday ? openCreate : undefined}
      />

      <div className="mb-4 flex items-center gap-3">
        <label className="text-sm font-medium text-muted-foreground">Dia:</label>
        <input
          type="date"
          value={selectedDate}
          max={isAdmin ? undefined : todayISO()}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="bg-transparent border-2 border-input rounded-md px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
        />
        {!isToday && (
          <button
            onClick={() => setSelectedDate(todayISO())}
            className="text-sm text-primary hover:underline"
          >
            Hoje
          </button>
        )}
        {!isToday && !isAdmin && (
          <span className="text-xs text-muted-foreground italic">
            (somente leitura — apenas admin altera dias anteriores)
          </span>
        )}
      </div>

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
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>
                Entregue:{" "}
                <strong className="text-foreground">{record.deliveredQuantity}</strong>
              </span>
              {record.status !== "OPEN" && (
                <span>
                  Reformado:{" "}
                  <strong className="text-foreground">{record.reformedQuantity}</strong>
                </span>
              )}
            </div>
          </div>
        )}
      />

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
                  className="font-bold uppercase"
                  onClick={() => selectedRecord && openCancel(selectedRecord)}
                >
                  Cancelar
                </Button>
              )}
              {canAdvance && (
                <Button
                  className="font-bold uppercase"
                  onClick={() => selectedRecord && openTransition(selectedRecord)}
                >
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
                <p className="text-xs text-muted-foreground uppercase font-bold">
                  Colaborador
                </p>
                <p className="text-sm font-medium">{selectedRecord.user?.name || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold">
                  Palete
                </p>
                <p className="text-sm font-medium">{selectedRecord.pallet?.name || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold">
                  Qtd. Entregue
                </p>
                <p className="text-sm font-medium">{selectedRecord.deliveredQuantity}</p>
              </div>
              {selectedRecord.status !== "OPEN" && (
                <>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold">
                      Qtd. Reformada
                    </p>
                    <p className="text-sm font-medium">{selectedRecord.reformedQuantity}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold">
                      Desmanchado
                    </p>
                    <p className="text-sm font-medium">
                      {selectedRecord.deliveredQuantity - selectedRecord.reformedQuantity}
                    </p>
                  </div>
                </>
              )}
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold">
                  Criado em
                </p>
                <p className="text-sm font-medium">
                  {new Date(selectedRecord.createdAt).toLocaleString("pt-BR")}
                </p>
              </div>
            </div>
            {selectedRecord.observation && (
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold">
                  Observação
                </p>
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
        <form onSubmit={handleCreateSubmit} className="space-y-6">
          <select
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full bg-transparent border-2 border-input rounded-md px-3 py-2 text-base text-foreground focus:border-primary focus:outline-none transition-colors"
            required
          >
            <option value="" disabled className="bg-card text-foreground">
              Colaborador*
            </option>
            {workers.map((u) => (
              <option key={u.id} value={u.id} className="bg-card text-foreground">
                {u.name}
              </option>
            ))}
          </select>

          <select
            value={palletId}
            onChange={(e) => setPalletId(e.target.value)}
            className="w-full bg-transparent border-2 border-input rounded-md px-3 py-2 text-base text-foreground focus:border-primary focus:outline-none transition-colors"
            required
          >
            <option value="" disabled className="bg-card text-foreground">
              Palete*
            </option>
            {pallets.map((p) => (
              <option key={p.id} value={p.id} className="bg-card text-foreground">
                {p.name}
              </option>
            ))}
          </select>

          <UnderlineInput
            placeholder="Quantidade Entregue*"
            type="number"
            min="1"
            value={deliveredQuantity}
            onChange={(e) => setDeliveredQuantity(e.target.value)}
            required
          />

          {formError && <p className="text-sm text-destructive">{formError}</p>}

          <div className="flex gap-4 pt-2">
            <Button
              type="submit"
              className="flex-1 font-bold uppercase"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Salvando..." : "Abrir Produção"}
            </Button>
          </div>
        </form>
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
        <form onSubmit={handleAdvance} className="space-y-6">
          {selectedRecord?.status === "OPEN" && (
            <>
              <p className="text-sm text-muted-foreground">
                Entregue: <strong className="text-foreground">{selectedRecord.deliveredQuantity}</strong>
              </p>
              <UnderlineInput
                placeholder="Quantidade Reformada*"
                type="number"
                min="0"
                max={String(selectedRecord?.deliveredQuantity ?? 0)}
                value={reformedQuantity}
                onChange={(e) => setReformedQuantity(e.target.value)}
                required
              />
              {reformedQuantity && selectedRecord && (
                <p className="text-xs text-muted-foreground">
                  Desmanchado: {selectedRecord.deliveredQuantity - Number(reformedQuantity)}
                </p>
              )}
            </>
          )}

          {selectedRecord?.status === "VERIFIED" && (
            <p className="text-sm text-muted-foreground">
              Confirma marcar esta produção como paga?
            </p>
          )}

          {formError && <p className="text-sm text-destructive">{formError}</p>}

          <div className="flex gap-4 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 font-bold uppercase"
              onClick={() => setTransitionOpen(false)}
            >
              Voltar
            </Button>
            <Button
              type="submit"
              className="flex-1 font-bold uppercase"
              disabled={isSubmitting}
            >
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
        <form onSubmit={handleCancelSubmit} className="space-y-6">
          <UnderlineInput
            placeholder="Motivo do cancelamento*"
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            required
          />
          {formError && <p className="text-sm text-destructive">{formError}</p>}
          <div className="flex gap-4 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 font-bold uppercase"
              onClick={() => setCancelOpen(false)}
            >
              Voltar
            </Button>
            <Button
              type="submit"
              variant="destructive"
              className="flex-1 font-bold uppercase"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Cancelando..." : "Cancelar Produção"}
            </Button>
          </div>
        </form>
      </FormModal>
    </>
  );
}
