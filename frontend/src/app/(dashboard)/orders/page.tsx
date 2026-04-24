"use client";

import { useCallback, useEffect, useState } from "react";
import { Calendar, Package, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { KanbanBoard, type KanbanColumnDef } from "@/components/shared/kanban-board";
import { StatusBadge } from "@/components/shared/status-badge";
import { DetailModal } from "@/components/shared/detail-modal";
import { FormModal } from "@/components/shared/form-modal";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { UnderlineInput } from "@/components/shared/underline-input";
import { Button } from "@/components/ui/button";
import {
  ordersService,
  type Order,
  type OrderStatus,
} from "@/services/orders.service";
import { customersService, type Customer } from "@/services/customers.service";
import { palletsService, type Pallet } from "@/services/pallets.service";

const STATUS_LABELS: Record<OrderStatus, string> = {
  OPEN: "Aberto",
  IN_PRODUCTION: "Em Produção",
  DONE: "Concluído",
  CANCELED: "Cancelado",
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  OPEN: "bg-status-open text-white",
  IN_PRODUCTION: "bg-status-production text-white",
  DONE: "bg-status-active text-white",
  CANCELED: "bg-status-canceled text-white",
};

const KANBAN_COLUMNS: KanbanColumnDef[] = [
  { status: "OPEN", label: "Aberto", headerColor: "bg-status-open" },
  { status: "IN_PRODUCTION", label: "Em Produção", headerColor: "bg-status-production" },
  { status: "DONE", label: "Concluído", headerColor: "bg-status-active" },
  { status: "CANCELED", label: "Cancelado", headerColor: "bg-status-canceled" },
];

interface OrderItemForm {
  palletId: string;
  quantityRequested: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pallets, setPallets] = useState<Pallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Detail modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Form modal
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Order | null>(null);

  // Delete
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [customerId, setCustomerId] = useState("");
  const [deadline, setDeadline] = useState("");
  const [formStatus, setFormStatus] = useState<OrderStatus>("OPEN");
  const [items, setItems] = useState<OrderItemForm[]>([
    { palletId: "", quantityRequested: "" },
  ]);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      const [ordersData, customersData, palletsData] = await Promise.all([
        ordersService.getAll(),
        customersService.getAll(),
        palletsService.getAll(),
      ]);
      setOrders(ordersData);
      setCustomers(customersData);
      setPallets(palletsData);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- Card click → detail modal ---
  function handleCardClick(order: Order) {
    setSelectedOrder(order);
    setDetailOpen(true);
  }

  // --- Drag-and-drop status change ---
  async function handleStatusChange(orderId: string, newStatus: string) {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: newStatus as OrderStatus } : o
      )
    );
    try {
      await ordersService.update(orderId, {
        status: newStatus as OrderStatus,
      });
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      loadData();
    }
  }

  // --- Create ---
  function openCreate() {
    setEditTarget(null);
    setCustomerId("");
    setDeadline("");
    setFormStatus("OPEN");
    setItems([{ palletId: "", quantityRequested: "" }]);
    setError("");
    setFormOpen(true);
  }

  // --- Edit ---
  function openEdit(order: Order) {
    setEditTarget(order);
    setCustomerId(order.customerId);
    setDeadline(order.deadline.split("T")[0]);
    setFormStatus(order.status);
    setItems([]);
    setError("");
    setDetailOpen(false);
    setFormOpen(true);
  }

  // --- Items management (create mode only) ---
  function addItem() {
    setItems([...items, { palletId: "", quantityRequested: "" }]);
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: keyof OrderItemForm, value: string) {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  }

  // --- Submit ---
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      if (editTarget) {
        await ordersService.update(editTarget.id, {
          customerId,
          deadline,
          status: formStatus,
        });
      } else {
        await ordersService.create({
          customerId,
          deadline,
          items: items.map((i) => ({
            palletId: i.palletId,
            quantityRequested: Number(i.quantityRequested),
          })),
        });
      }
      setFormOpen(false);
      loadData();
    } catch (err) {
      setError("Erro ao salvar pedido. Verifique os dados.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  // --- Delete ---
  async function handleDelete() {
    const target = editTarget || selectedOrder;
    if (!target) return;
    setIsSubmitting(true);
    try {
      await ordersService.remove(target.id);
      setDeleteOpen(false);
      setFormOpen(false);
      setDetailOpen(false);
      setEditTarget(null);
      setSelectedOrder(null);
      loadData();
    } catch (err) {
      console.error("Erro ao excluir pedido:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

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
        title="Pedidos"
        subtitle={`${orders.length} pedido${orders.length !== 1 ? "s" : ""}`}
        actionLabel="Novo Pedido"
        onAction={openCreate}
      />

      <KanbanBoard
        columns={KANBAN_COLUMNS}
        items={orders}
        statusKey="status"
        keyExtractor={(o) => o.id}
        onCardClick={handleCardClick}
        onStatusChange={handleStatusChange}
        renderCard={(order) => (
          <div className="bg-card border border-border/40 rounded-lg p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <span className="font-bold text-sm truncate">
                {order.customer?.businessName || "Cliente"}
              </span>
              <StatusBadge
                status={order.status}
                labels={STATUS_LABELS}
                colors={STATUS_COLORS}
                className="text-[10px] px-2 py-0.5"
              />
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(order.deadline).toLocaleDateString("pt-BR")}
              </span>
              <span className="flex items-center gap-1">
                <Package className="w-3 h-3" />
                {order.items?.length || 0} itens
              </span>
            </div>
          </div>
        )}
      />

      {/* Detail Modal */}
      <DetailModal
        title={`Pedido — ${selectedOrder?.customer?.businessName || ""}`}
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setSelectedOrder(null);
        }}
        badge={
          selectedOrder ? (
            <StatusBadge
              status={selectedOrder.status}
              labels={STATUS_LABELS}
              colors={STATUS_COLORS}
            />
          ) : undefined
        }
        footer={
          <>
            <Button
              variant="destructive"
              className="font-bold uppercase"
              onClick={() => setDeleteOpen(true)}
            >
              Excluir
            </Button>
            <Button
              className="font-bold uppercase"
              onClick={() => {
                if (selectedOrder) openEdit(selectedOrder);
              }}
            >
              Editar
            </Button>
          </>
        }
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold">
                  Cliente
                </p>
                <p className="text-sm font-medium">
                  {selectedOrder.customer?.businessName || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold">
                  Prazo
                </p>
                <p className="text-sm font-medium">
                  {new Date(selectedOrder.deadline).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold">
                  Criado em
                </p>
                <p className="text-sm font-medium">
                  {new Date(selectedOrder.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold">
                  Total de Itens
                </p>
                <p className="text-sm font-medium">
                  {selectedOrder.items?.length || 0}
                </p>
              </div>
            </div>

            {selectedOrder.items && selectedOrder.items.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold mb-2">
                  Itens do Pedido
                </p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-background/50 border border-border/20 rounded-lg px-4 py-3 flex items-center justify-between"
                    >
                      <span className="text-sm font-medium">
                        {item.pallet?.name || "Palete"}
                      </span>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>
                          Solicitado:{" "}
                          <strong className="text-foreground">
                            {item.quantityRequested}
                          </strong>
                        </span>
                        <span>
                          Produzido:{" "}
                          <strong className="text-foreground">
                            {item.quantityProduced}
                          </strong>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DetailModal>

      {/* Form Modal (Create/Edit) */}
      <FormModal
        title={editTarget ? "Editar Pedido" : "Novo Pedido"}
        open={formOpen}
        onClose={() => setFormOpen(false)}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="w-full bg-transparent border-2 border-input rounded-md px-3 py-2 text-base text-foreground focus:border-primary focus:outline-none transition-colors"
            required
          >
            <option value="" disabled className="bg-card text-foreground">
              Cliente*
            </option>
            {customers.map((c) => (
              <option
                key={c.id}
                value={c.id}
                className="bg-card text-foreground"
              >
                {c.businessName}
              </option>
            ))}
          </select>

          <UnderlineInput
            type="date"
            placeholder="Prazo*"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
          />

          {editTarget && (
            <select
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value as OrderStatus)}
              className="w-full bg-transparent border-2 border-input rounded-md px-3 py-2 text-base text-foreground focus:border-primary focus:outline-none transition-colors"
            >
              <option value="OPEN" className="bg-card text-foreground">
                Aberto
              </option>
              <option value="IN_PRODUCTION" className="bg-card text-foreground">
                Em Produção
              </option>
              <option value="DONE" className="bg-card text-foreground">
                Concluído
              </option>
              <option value="CANCELED" className="bg-card text-foreground">
                Cancelado
              </option>
            </select>
          )}

          {/* Items — only on create */}
          {!editTarget && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm">Itens do Pedido</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Item
                </Button>
              </div>

              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-3 items-end bg-background/50 p-3 rounded-lg border border-border/30"
                >
                  <div className="flex-1">
                    <select
                      value={item.palletId}
                      onChange={(e) =>
                        updateItem(index, "palletId", e.target.value)
                      }
                      className="w-full bg-transparent border-b-2 border-input py-2 text-sm text-foreground focus:border-primary focus:outline-none transition-colors"
                      required
                    >
                      <option value="" disabled>
                        Palete*
                      </option>
                      {pallets.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      min="1"
                      placeholder="Qtd*"
                      value={item.quantityRequested}
                      onChange={(e) =>
                        updateItem(index, "quantityRequested", e.target.value)
                      }
                      className="w-full bg-transparent border-b-2 border-input py-2 text-sm text-foreground focus:border-primary focus:outline-none transition-colors"
                      required
                    />
                  </div>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-destructive p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Items display — edit mode (read-only) */}
          {editTarget && editTarget.items && editTarget.items.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-bold text-sm">Itens do Pedido</h3>
              {editTarget.items.map((item) => (
                <div
                  key={item.id}
                  className="bg-background/50 border border-border/20 rounded-lg px-4 py-3 flex items-center justify-between"
                >
                  <span className="text-sm font-medium">
                    {item.pallet?.name || "Palete"}
                  </span>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>
                      Solicitado:{" "}
                      <strong className="text-foreground">
                        {item.quantityRequested}
                      </strong>
                    </span>
                    <span>
                      Produzido:{" "}
                      <strong className="text-foreground">
                        {item.quantityProduced}
                      </strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-4 pt-2">
            {editTarget && (
              <Button
                type="button"
                variant="destructive"
                className="flex-1 font-bold uppercase"
                onClick={() => setDeleteOpen(true)}
              >
                Excluir
              </Button>
            )}
            <Button
              type="submit"
              className="flex-1 font-bold uppercase"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Salvando..."
                : editTarget
                  ? "Atualizar"
                  : "Salvar"}
            </Button>
          </div>
        </form>
      </FormModal>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        isLoading={isSubmitting}
      />
    </>
  );
}
