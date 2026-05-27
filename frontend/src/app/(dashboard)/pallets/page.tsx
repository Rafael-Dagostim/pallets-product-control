"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil, Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { FormModal } from "@/components/shared/form-modal";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CurrencyInput } from "@/components/shared/form-fields";
import { palletsService, type Pallet } from "@/services/pallets.service";
import { useRequireRole } from "@/hooks/use-require-role";

function formatBRL(value: unknown): string {
  const num = parseFloat(String(value));
  if (isNaN(num)) return "R$ 0,00";
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const palletSchema = z
  .object({
    name: z.string().min(1, "Informe o nome"),
    buyCost: z.number({ message: "Informe o valor" }).nonnegative(),
    productionCost: z.number({ message: "Informe o valor" }).nonnegative(),
    sellPrice: z.number({ message: "Informe o valor" }).positive("Valor de venda deve ser maior que zero"),
  })
  .refine((v) => v.sellPrice >= v.productionCost, {
    message: "Venda não pode ser menor que o custo de produção",
    path: ["sellPrice"],
  });

type FormValues = z.infer<typeof palletSchema>;

export default function PalletsPage() {
  const { isAllowed, isReady } = useRequireRole(["ADMIN", "MANAGER"]);
  const [pallets, setPallets] = useState<Pallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Pallet | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [versionFromId, setVersionFromId] = useState<string | undefined>();

  const form = useForm<FormValues>({
    resolver: zodResolver(palletSchema),
    defaultValues: {
      name: "",
      buyCost: undefined as unknown as number,
      productionCost: undefined as unknown as number,
      sellPrice: undefined as unknown as number,
    },
  });

  const loadPallets = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await palletsService.getAll();
      setPallets(data);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar paletes");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAllowed) loadPallets();
  }, [loadPallets, isAllowed]);

  function openCreate() {
    setSelected(null);
    setVersionFromId(undefined);
    form.reset({
      name: "",
      buyCost: undefined as unknown as number,
      productionCost: undefined as unknown as number,
      sellPrice: undefined as unknown as number,
    });
    setModalOpen(true);
  }

  function openEdit(pallet: Pallet) {
    setSelected(pallet);
    setVersionFromId(undefined);
    form.reset({
      name: pallet.name,
      buyCost: Number(pallet.buyCost),
      productionCost: Number(pallet.productionCost),
      sellPrice: Number(pallet.sellPrice),
    });
    setModalOpen(true);
  }

  function openNewVersion(pallet: Pallet) {
    setSelected(null);
    setVersionFromId(pallet.id);
    form.reset({
      name: pallet.name,
      buyCost: Number(pallet.buyCost),
      productionCost: Number(pallet.productionCost),
      sellPrice: Number(pallet.sellPrice),
    });
    setModalOpen(true);
  }

  async function onSubmit(values: FormValues) {
    try {
      if (selected) {
        await palletsService.update(selected.id, values);
        toast.success("Palete atualizado");
      } else {
        await palletsService.create({ ...values, versionFromId });
        toast.success(versionFromId ? "Nova versão criada" : "Palete criado");
      }
      setModalOpen(false);
      loadPallets();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar palete");
    }
  }

  async function handleDelete() {
    if (!selected) return;
    setIsDeleting(true);
    try {
      await palletsService.remove(selected.id);
      toast.success("Palete excluído");
      setDeleteOpen(false);
      setModalOpen(false);
      setSelected(null);
      loadPallets();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao excluir palete");
    } finally {
      setIsDeleting(false);
    }
  }

  const columns: Column<Pallet>[] = [
    { key: "name", label: "Nome", render: (p) => <span className="font-medium">{p.name}</span> },
    { key: "version", label: "Versão", render: (p) => `v${p.version}` },
    { key: "buyCost", label: "Custo Compra", hideOnMobile: true, render: (p) => formatBRL(p.buyCost) },
    { key: "productionCost", label: "Custo Produção", hideOnMobile: true, render: (p) => formatBRL(p.productionCost) },
    { key: "sellPrice", label: "Venda", render: (p) => <span className="font-semibold text-primary">{formatBRL(p.sellPrice)}</span> },
    {
      key: "actions",
      label: "Ações",
      isActions: true,
      render: (p) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => openEdit(p)}
            className="p-1.5 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
            title="Editar"
            aria-label="Editar"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => openNewVersion(p)}
            className="p-1.5 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
            title="Nova Versão"
            aria-label="Nova versão"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setSelected(p);
              setDeleteOpen(true);
            }}
            className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            title="Excluir"
            aria-label="Excluir"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  function modalTitle() {
    if (selected) return "Editar Palete";
    if (versionFromId) return "Nova Versão";
    return "Novo Palete";
  }

  if (!isReady || !isAllowed) return null;

  return (
    <>
      <PageHeader title="Paletes" actionLabel="Adicionar" onAction={openCreate} />

      <DataTable
        columns={columns}
        data={pallets}
        keyExtractor={(p) => p.id}
        onRowClick={openEdit}
        isLoading={isLoading}
        emptyMessage="Nenhum palete cadastrado."
      />

      <FormModal
        title={modalTitle()}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex.: Palete PBR" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="buyCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custo de compra</FormLabel>
                    <FormControl>
                      <CurrencyInput {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="productionCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custo de produção</FormLabel>
                    <FormControl>
                      <CurrencyInput {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="sellPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor de venda</FormLabel>
                  <FormControl>
                    <CurrencyInput {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
              {selected && (
                <>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setDeleteOpen(true)}
                    className="sm:mr-auto"
                  >
                    Excluir
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => openNewVersion(selected)}
                  >
                    Nova versão
                  </Button>
                </>
              )}
              <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Salvando..." : "Salvar"}
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
        title="Excluir palete?"
        description={`${selected?.name ?? ""} será removido. Essa ação não pode ser desfeita.`}
      />
    </>
  );
}
