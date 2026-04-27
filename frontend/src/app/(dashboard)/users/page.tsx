"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FileText, Pencil, Trash2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DocumentInput } from "@/components/shared/form-fields";
import { usersService, type User } from "@/services/users.service";
import type { UserRole } from "@/services/auth.service";
import { maskCPF } from "@/lib/masks";
import { cpfSchema } from "@/lib/validators";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  MANAGER: "Gerente",
  EMPLOYEE: "Colaborador",
};

const ROLES: { value: UserRole; label: string }[] = [
  { value: "EMPLOYEE", label: "Colaborador" },
  { value: "MANAGER", label: "Gerente" },
  { value: "ADMIN", label: "Administrador" },
];

const userSchema = z.object({
  name: z.string().min(2, "Informe o nome completo"),
  document: cpfSchema,
  password: z
    .string()
    .refine(
      (v) => v === "" || v.length >= 6,
      "Senha deve ter ao menos 6 caracteres",
    ),
  role: z.enum(["ADMIN", "MANAGER", "EMPLOYEE"]),
});

type FormValues = z.infer<typeof userSchema>;

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: { name: "", document: "", password: "", role: "EMPLOYEE" },
  });

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await usersService.getAll();
      setUsers(data);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar colaboradores");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  function openCreate() {
    setSelected(null);
    form.reset({ name: "", document: "", password: "", role: "EMPLOYEE" });
    setModalOpen(true);
  }

  function openEdit(user: User) {
    setSelected(user);
    form.reset({
      name: user.name,
      document: user.document,
      password: "",
      role: user.role,
    });
    setModalOpen(true);
  }

  async function onSubmit(values: FormValues) {
    if (!selected && values.password.length < 6) {
      form.setError("password", { message: "Senha deve ter ao menos 6 caracteres" });
      return;
    }
    try {
      if (selected) {
        const dto: Record<string, string> = {
          name: values.name,
          document: values.document,
          role: values.role,
        };
        if (values.password) dto.password = values.password;
        await usersService.update(selected.id, dto);
        toast.success("Colaborador atualizado");
      } else {
        await usersService.create({
          name: values.name,
          document: values.document,
          password: values.password,
          role: values.role,
        });
        toast.success("Colaborador criado");
      }
      setModalOpen(false);
      loadUsers();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar colaborador");
    }
  }

  async function handleDelete() {
    if (!selected) return;
    setIsDeleting(true);
    try {
      await usersService.remove(selected.id);
      toast.success("Colaborador excluído");
      setDeleteOpen(false);
      setModalOpen(false);
      setSelected(null);
      loadUsers();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao excluir colaborador");
    } finally {
      setIsDeleting(false);
    }
  }

  const columns: Column<User>[] = [
    { key: "name", label: "Nome", render: (u) => <span className="font-medium">{u.name}</span> },
    { key: "document", label: "CPF", hideOnMobile: true, render: (u) => maskCPF(u.document) },
    { key: "role", label: "Função", render: (u) => ROLE_LABELS[u.role] || u.role },
    {
      key: "actions",
      label: "Ações",
      isActions: true,
      render: (u) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => router.push(`/users/${u.id}/payroll`)}
            className="p-1.5 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
            title="Folha de pagamento"
          >
            <FileText className="w-4 h-4" />
          </button>
          <button
            onClick={() => openEdit(u)}
            className="p-1.5 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
            title="Editar"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setSelected(u);
              setDeleteOpen(true);
            }}
            className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            title="Excluir"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Colaboradores" actionLabel="Adicionar" onAction={openCreate} />

      <DataTable
        columns={columns}
        data={users}
        keyExtractor={(u) => u.id}
        onRowClick={openEdit}
        isLoading={isLoading}
        emptyMessage="Nenhum colaborador cadastrado."
      />

      <FormModal
        title={selected ? "Editar Colaborador" : "Novo Colaborador"}
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
                    <Input autoComplete="off" placeholder="Nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="document"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF</FormLabel>
                  <FormControl>
                    <DocumentInput kind="cpf" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {selected ? "Nova senha" : "Senha"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      placeholder={selected ? "Deixe em branco para manter" : "Mínimo 6 caracteres"}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Função</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione a função" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ROLES.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
              <Button
                type="button"
                variant="ghost"
                onClick={() => setModalOpen(false)}
              >
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
        title="Excluir colaborador?"
        description={`${selected?.name ?? ""} será removido. Essa ação não pode ser desfeita.`}
      />
    </>
  );
}
