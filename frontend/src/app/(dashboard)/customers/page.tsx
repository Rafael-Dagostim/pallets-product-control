"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { customersService, type Customer } from "@/services/customers.service";

const customerSchema = z.object({
  businessName: z.string().min(2, "Informe o nome fantasia"),
  corporateName: z.string().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof customerSchema>;

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
    render: (c) => c.corporateName || "—",
  },
];

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Customer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: { businessName: "", corporateName: "" },
  });

  const loadCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await customersService.getAll();
      setCustomers(data);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar clientes");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  function openCreate() {
    setSelected(null);
    form.reset({ businessName: "", corporateName: "" });
    setModalOpen(true);
  }

  function openEdit(customer: Customer) {
    setSelected(customer);
    form.reset({
      businessName: customer.businessName,
      corporateName: customer.corporateName ?? "",
    });
    setModalOpen(true);
  }

  async function onSubmit(values: FormValues) {
    try {
      const dto = {
        businessName: values.businessName,
        corporateName: values.corporateName || undefined,
      };
      if (selected) {
        await customersService.update(selected.id, dto);
        toast.success("Cliente atualizado");
      } else {
        await customersService.create(dto);
        toast.success("Cliente criado");
      }
      setModalOpen(false);
      loadCustomers();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar cliente");
    }
  }

  async function handleDelete() {
    if (!selected) return;
    setIsDeleting(true);
    try {
      await customersService.remove(selected.id);
      toast.success("Cliente excluído");
      setDeleteOpen(false);
      setModalOpen(false);
      setSelected(null);
      loadCustomers();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao excluir cliente");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <PageHeader title="Clientes" actionLabel="Adicionar" onAction={openCreate} />

      <DataTable
        columns={columns}
        data={customers}
        keyExtractor={(c) => c.id}
        onRowClick={openEdit}
        isLoading={isLoading}
        emptyMessage="Nenhum cliente cadastrado."
      />

      <FormModal
        title={selected ? "Editar Cliente" : "Novo Cliente"}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome fantasia</FormLabel>
                  <FormControl>
                    <Input placeholder="Como o cliente é conhecido" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="corporateName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Razão social</FormLabel>
                  <FormControl>
                    <Input placeholder="Opcional" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
              {selected && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setDeleteOpen(true)}
                  className="sm:mr-auto"
                >
                  Excluir
                </Button>
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
        title="Excluir cliente?"
        description={`${selected?.businessName ?? ""} será removido. Essa ação não pode ser desfeita.`}
      />
    </>
  );
}
