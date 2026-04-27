"use client";

import { useCallback, useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, Package, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { KanbanBoard, type KanbanColumnDef } from "@/components/shared/kanban-board";
import { StatusBadge } from "@/components/shared/status-badge";
import { DetailModal } from "@/components/shared/detail-modal";
import { FormModal } from "@/components/shared/form-modal";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ComboboxField,
  DatePickerField,
  IntegerInput,
} from "@/components/shared/form-fields";
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

const createSchema = z.object({
  customerId: z.string().min(1, "Selecione um cliente"),
  deadline: z.date({ message: "Selecione o prazo" }),
  status: z.enum(["OPEN", "IN_PRODUCTION", "DONE", "CANCELED"]).optional(),
  items: z
    .array(
      z.object({
        palletId: z.string().min(1, "Selecione um palete"),
        quantityRequested: z
          .number({ message: "Informe a quantidade" })
          .int()
          .positive("Quantidade deve ser maior que zero"),
      }),
    )
    .min(1, "Adicione ao menos um item"),
});

type FormValues = z.infer<typeof createSchema>;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pallets, setPallets] = useState<Pallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Order | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      customerId: "",
      deadline: undefined as unknown as Date,
      status: "OPEN",
      items: [{ palletId: "", quantityRequested: undefined as unknown as number }],
    },
  });

  const itemsArray = useFieldArray({ control: form.control, name: "items" });

  const loadData = useCallback(async () => {
    setIsLoading(true);
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
      console.error(err);
      toast.error("Erro ao carregar pedidos");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleCardClick(order: Order) {
    setSelectedOrder(order);
    setDetailOpen(true);
  }

  async function handleStatusChange(orderId: string, newStatus: string) {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: newStatus as OrderStatus } : o,
      ),
    );
    try {
      await ordersService.update(orderId, { status: newStatus as OrderStatus });
      toast.success("Status atualizado");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao atualizar status");
      loadData();
    }
  }

  function openCreate() {
    setEditTarget(null);
    form.reset({
      customerId: "",
      deadline: undefined as unknown as Date,
      status: "OPEN",
      items: [{ palletId: "", quantityRequested: undefined as unknown as number }],
    });
    setFormOpen(true);
  }

  function openEdit(order: Order) {
    setEditTarget(order);
    form.reset({
      customerId: order.customerId,
      deadline: new Date(order.deadline),
      status: order.status,
      items: (order.items ?? []).map((i) => ({
        palletId: i.palletId,
        quantityRequested: i.quantityRequested,
      })),
    });
    setDetailOpen(false);
    setFormOpen(true);
  }

  async function onSubmit(values: FormValues) {
    try {
      const deadlineIso = values.deadline.toISOString();
      if (editTarget) {
        await ordersService.update(editTarget.id, {
          customerId: values.customerId,
          deadline: deadlineIso,
          status: values.status,
        });
        toast.success("Pedido atualizado");
      } else {
        await ordersService.create({
          customerId: values.customerId,
          deadline: deadlineIso,
          items: values.items,
        });
        toast.success("Pedido criado");
      }
      setFormOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar pedido");
    }
  }

  async function handleDelete() {
    const target = editTarget || selectedOrder;
    if (!target) return;
    setIsDeleting(true);
    try {
      await ordersService.remove(target.id);
      toast.success("Pedido excluído");
      setDeleteOpen(false);
      setFormOpen(false);
      setDetailOpen(false);
      setEditTarget(null);
      setSelectedOrder(null);
      loadData();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao excluir pedido");
    } finally {
      setIsDeleting(false);
    }
  }

  const customerOptions = customers.map((c) => ({
    value: c.id,
    label: c.businessName,
    description: c.corporateName ?? undefined,
  }));

  const palletOptions = pallets.map((p) => ({
    value: p.id,
    label: `${p.name} (v${p.version})`,
  }));

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
            <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
              Excluir
            </Button>
            <Button onClick={() => selectedOrder && openEdit(selectedOrder)}>
              Editar
            </Button>
          </>
        }
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Cliente</p>
                <p className="text-sm font-medium">{selectedOrder.customer?.businessName || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Prazo</p>
                <p className="text-sm font-medium">
                  {new Date(selectedOrder.deadline).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Criado em</p>
                <p className="text-sm font-medium">
                  {new Date(selectedOrder.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Total de itens</p>
                <p className="text-sm font-medium">{selectedOrder.items?.length || 0}</p>
              </div>
            </div>

            {selectedOrder.items && selectedOrder.items.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                  Itens do pedido
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
                          Solicitado: <strong className="text-foreground">{item.quantityRequested}</strong>
                        </span>
                        <span>
                          Produzido: <strong className="text-foreground">{item.quantityProduced}</strong>
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

      <FormModal
        title={editTarget ? "Editar Pedido" : "Novo Pedido"}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        size="lg"
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="customerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente</FormLabel>
                  <FormControl>
                    <ComboboxField
                      value={field.value || undefined}
                      onChange={(v) => field.onChange(v ?? "")}
                      options={customerOptions}
                      placeholder="Selecionar cliente"
                      searchPlaceholder="Buscar cliente..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prazo</FormLabel>
                  <FormControl>
                    <DatePickerField value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {editTarget && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="OPEN">Aberto</SelectItem>
                        <SelectItem value="IN_PRODUCTION">Em produção</SelectItem>
                        <SelectItem value="DONE">Concluído</SelectItem>
                        <SelectItem value="CANCELED">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {!editTarget && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Itens do pedido</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      itemsArray.append({
                        palletId: "",
                        quantityRequested: undefined as unknown as number,
                      })
                    }
                  >
                    <Plus className="size-4 mr-1" />
                    Adicionar
                  </Button>
                </div>

                <div className="space-y-3">
                  {itemsArray.fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="bg-background/40 border border-border/30 rounded-lg p-3 space-y-3"
                    >
                      <div className="flex gap-3 items-start">
                        <div className="flex-1 min-w-0">
                          <FormField
                            control={form.control}
                            name={`items.${index}.palletId`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Palete</FormLabel>
                                <FormControl>
                                  <ComboboxField
                                    value={field.value || undefined}
                                    onChange={(v) => field.onChange(v ?? "")}
                                    options={palletOptions}
                                    placeholder="Selecionar palete"
                                    searchPlaceholder="Buscar palete..."
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="w-24">
                          <FormField
                            control={form.control}
                            name={`items.${index}.quantityRequested`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Qtd.</FormLabel>
                                <FormControl>
                                  <IntegerInput min={1} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        {itemsArray.fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => itemsArray.remove(index)}
                            className="text-destructive p-1 mt-6"
                            aria-label="Remover item"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {form.formState.errors.items?.root && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.items.root.message}
                  </p>
                )}
              </div>
            )}

            {editTarget && editTarget.items && editTarget.items.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Itens do pedido</h3>
                {editTarget.items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-background/50 border border-border/20 rounded-lg px-4 py-3 flex items-center justify-between"
                  >
                    <span className="text-sm font-medium">{item.pallet?.name || "Palete"}</span>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span>
                        Solicitado: <strong className="text-foreground">{item.quantityRequested}</strong>
                      </span>
                      <span>
                        Produzido: <strong className="text-foreground">{item.quantityProduced}</strong>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
              {editTarget && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setDeleteOpen(true)}
                  className="sm:mr-auto"
                >
                  Excluir
                </Button>
              )}
              <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? "Salvando..."
                  : editTarget
                    ? "Atualizar"
                    : "Salvar"}
              </Button>
            </div>
          </form>
        </Form>
      </FormModal>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Excluir pedido?"
        description="Essa ação não pode ser desfeita."
      />
    </>
  );
}
