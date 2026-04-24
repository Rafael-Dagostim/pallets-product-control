"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { FormModal } from "@/components/shared/form-modal";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { UnderlineInput } from "@/components/shared/underline-input";
import { Button } from "@/components/ui/button";
import { customersService, type Customer } from "@/services/customers.service";

const columns: Column<Customer>[] = [
  {
    key: "businessName",
    label: "Nome Fantasia",
    render: (c) => <span className="font-medium">{c.businessName}</span>,
  },
  {
    key: "corporateName",
    label: "Razão Social",
    hideOnMobile: true,
    render: (c) => c.corporateName || "-",
  },
];

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Customer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [businessName, setBusinessName] = useState("");
  const [corporateName, setCorporateName] = useState("");

  const loadCustomers = useCallback(async () => {
    try {
      const data = await customersService.getAll();
      setCustomers(data);
    } catch (err) {
      console.error("Erro ao carregar clientes:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  function openCreate() {
    setSelected(null);
    setBusinessName("");
    setCorporateName("");
    setModalOpen(true);
  }

  function openEdit(customer: Customer) {
    setSelected(customer);
    setBusinessName(customer.businessName);
    setCorporateName(customer.corporateName || "");
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const dto = {
        businessName,
        corporateName: corporateName || undefined,
      };
      if (selected) {
        await customersService.update(selected.id, dto);
      } else {
        await customersService.create(dto);
      }
      setModalOpen(false);
      loadCustomers();
    } catch (err) {
      console.error("Erro ao salvar cliente:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!selected) return;
    setIsSubmitting(true);
    try {
      await customersService.remove(selected.id);
      setDeleteOpen(false);
      setModalOpen(false);
      setSelected(null);
      loadCustomers();
    } catch (err) {
      console.error("Erro ao excluir cliente:", err);
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
      <PageHeader title="Clientes" actionLabel="Adicionar" onAction={openCreate} />

      {customers.length === 0 ? (
        <p className="text-center text-muted-foreground py-10">
          Nenhum cliente cadastrado.
        </p>
      ) : (
        <DataTable
          columns={columns}
          data={customers}
          keyExtractor={(c) => c.id}
          onRowClick={openEdit}
        />
      )}

      <FormModal
        title={selected ? "Editar Cliente" : "Novo Cliente"}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <UnderlineInput
            placeholder="Nome Fantasia*"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            required
          />
          <UnderlineInput
            placeholder="Razão Social"
            value={corporateName}
            onChange={(e) => setCorporateName(e.target.value)}
          />

          <div className="flex gap-4 pt-2">
            {selected && (
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
