"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Copy, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { FormModal } from "@/components/shared/form-modal";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { UnderlineInput } from "@/components/shared/underline-input";
import { Button } from "@/components/ui/button";
import { palletsService, type Pallet } from "@/services/pallets.service";

function formatBRL(value: unknown): string {
  const num = parseFloat(String(value));
  if (isNaN(num)) return "R$ 0,00";
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function PalletsPage() {
  const [pallets, setPallets] = useState<Pallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Pallet | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [versionFromId, setVersionFromId] = useState<string | undefined>();

  const [name, setName] = useState("");
  const [buyCost, setBuyCost] = useState("");
  const [productionCost, setProductionCost] = useState("");
  const [sellPrice, setSellPrice] = useState("");

  const loadPallets = useCallback(async () => {
    try {
      const data = await palletsService.getAll();
      setPallets(data);
    } catch (err) {
      console.error("Erro ao carregar paletes:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPallets();
  }, [loadPallets]);

  function openCreate() {
    setSelected(null);
    setVersionFromId(undefined);
    setName("");
    setBuyCost("");
    setProductionCost("");
    setSellPrice("");
    setModalOpen(true);
  }

  function openEdit(pallet: Pallet) {
    setSelected(pallet);
    setVersionFromId(undefined);
    setName(pallet.name);
    setBuyCost(String(pallet.buyCost));
    setProductionCost(String(pallet.productionCost));
    setSellPrice(String(pallet.sellPrice));
    setModalOpen(true);
  }

  function openNewVersion(pallet: Pallet) {
    setSelected(null);
    setVersionFromId(pallet.id);
    setName(pallet.name);
    setBuyCost(String(pallet.buyCost));
    setProductionCost(String(pallet.productionCost));
    setSellPrice(String(pallet.sellPrice));
    setModalOpen(true);
  }

  function openDelete(pallet: Pallet) {
    setSelected(pallet);
    setDeleteOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const dto = {
        name,
        buyCost: Number(buyCost),
        productionCost: Number(productionCost),
        sellPrice: Number(sellPrice),
      };
      if (selected) {
        await palletsService.update(selected.id, dto);
      } else {
        await palletsService.create({ ...dto, versionFromId });
      }
      setModalOpen(false);
      loadPallets();
    } catch (err) {
      console.error("Erro ao salvar palete:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!selected) return;
    setIsSubmitting(true);
    try {
      await palletsService.remove(selected.id);
      setDeleteOpen(false);
      setModalOpen(false);
      setSelected(null);
      loadPallets();
    } catch (err) {
      console.error("Erro ao excluir palete:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  const columns: Column<Pallet>[] = [
    { key: "name", label: "Nome", render: (p) => <span className="font-medium">{p.name}</span> },
    { key: "version", label: "Versão", render: (p) => p.version },
    { key: "buyCost", label: "Custo Compra", hideOnMobile: true, render: (p) => formatBRL(p.buyCost) },
    { key: "productionCost", label: "Custo Produção", hideOnMobile: true, render: (p) => formatBRL(p.productionCost) },
    { key: "sellPrice", label: "Venda", render: (p) => formatBRL(p.sellPrice) },
    {
      key: "actions",
      label: "Ações",
      render: (p) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => openEdit(p)}
            className="p-1.5 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
            title="Editar"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => openNewVersion(p)}
            className="p-1.5 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
            title="Nova Versão"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => openDelete(p)}
            className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            title="Excluir"
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Paletes" actionLabel="Adicionar" onAction={openCreate} />

      {pallets.length === 0 ? (
        <p className="text-center text-muted-foreground py-10">
          Nenhum palete cadastrado.
        </p>
      ) : (
        <DataTable
          columns={columns}
          data={pallets}
          keyExtractor={(p) => p.id}
          onRowClick={openEdit}
        />
      )}

      <FormModal
        title={modalTitle()}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <UnderlineInput
            placeholder="Nome*"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <UnderlineInput
            placeholder="Valor de Compra"
            type="number"
            step="0.01"
            value={buyCost}
            onChange={(e) => setBuyCost(e.target.value)}
            required
          />
          <UnderlineInput
            placeholder="Valor de Produção*"
            type="number"
            step="0.01"
            value={productionCost}
            onChange={(e) => setProductionCost(e.target.value)}
            required
          />
          <UnderlineInput
            placeholder="Valor de Venda"
            type="number"
            step="0.01"
            value={sellPrice}
            onChange={(e) => setSellPrice(e.target.value)}
            required
          />

          <div className="flex gap-4 pt-2">
            {selected && (
              <>
                <Button
                  type="button"
                  variant="destructive"
                  className="flex-1 font-bold uppercase"
                  onClick={() => setDeleteOpen(true)}
                >
                  Excluir
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 font-bold uppercase"
                  onClick={() => openNewVersion(selected)}
                >
                  Nova Versão
                </Button>
              </>
            )}
            <Button
              type="submit"
              className="flex-1 font-bold uppercase"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Salvando..." : "Salvar"}
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
