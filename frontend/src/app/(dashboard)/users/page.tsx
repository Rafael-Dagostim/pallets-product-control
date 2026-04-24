"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { FormModal } from "@/components/shared/form-modal";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { UnderlineInput } from "@/components/shared/underline-input";
import { Button } from "@/components/ui/button";
import { usersService, type User } from "@/services/users.service";
import type { UserRole } from "@/services/auth.service";
import { maskCPF, unmask } from "@/lib/masks";

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

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [document, setDocument] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("EMPLOYEE");

  const loadUsers = useCallback(async () => {
    try {
      const data = await usersService.getAll();
      setUsers(data);
    } catch (err) {
      console.error("Erro ao carregar colaboradores:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  function openCreate() {
    setSelected(null);
    setName("");
    setDocument("");
    setPassword("");
    setRole("EMPLOYEE");
    setModalOpen(true);
  }

  function openEdit(user: User) {
    setSelected(user);
    setName(user.name);
    setDocument(maskCPF(user.document));
    setPassword("");
    setRole(user.role);
    setModalOpen(true);
  }

  function openDelete(user: User) {
    setSelected(user);
    setDeleteOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (selected) {
        const dto: Record<string, string> = {
          name,
          document: unmask(document),
          role,
        };
        if (password) dto.password = password;
        await usersService.update(selected.id, dto);
      } else {
        await usersService.create({
          name,
          document: unmask(document),
          password,
          role,
        });
      }
      setModalOpen(false);
      loadUsers();
    } catch (err) {
      console.error("Erro ao salvar colaborador:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!selected) return;
    setIsSubmitting(true);
    try {
      await usersService.remove(selected.id);
      setDeleteOpen(false);
      setModalOpen(false);
      setSelected(null);
      loadUsers();
    } catch (err) {
      console.error("Erro ao excluir colaborador:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  const columns: Column<User>[] = [
    { key: "name", label: "Nome", render: (u) => <span className="font-medium">{u.name}</span> },
    { key: "document", label: "CPF", hideOnMobile: true, render: (u) => maskCPF(u.document) },
    { key: "role", label: "Função", render: (u) => ROLE_LABELS[u.role] || u.role },
    {
      key: "actions",
      label: "Ações",
      render: (u) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => openEdit(u)}
            className="p-1.5 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
            title="Editar"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => openDelete(u)}
            className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            title="Excluir"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Colaboradores" actionLabel="Adicionar" onAction={openCreate} />

      {users.length === 0 ? (
        <p className="text-center text-muted-foreground py-10">
          Nenhum colaborador cadastrado.
        </p>
      ) : (
        <DataTable
          columns={columns}
          data={users}
          keyExtractor={(u) => u.id}
          onRowClick={openEdit}
        />
      )}

      <FormModal
        title={selected ? "Editar Colaborador" : "Novo Colaborador"}
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
            placeholder="CPF*"
            value={document}
            onChange={(e) => setDocument(maskCPF(e.target.value))}
            required
            inputMode="numeric"
            maxLength={14}
          />
          <UnderlineInput
            placeholder={selected ? "Nova Senha (deixe em branco para manter)" : "Senha*"}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={!selected}
          />

          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="w-full bg-transparent border-2 border-input rounded-md px-3 py-2 text-base text-foreground focus:border-primary focus:outline-none transition-colors"
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value} className="bg-card text-foreground">
                {r.label}
              </option>
            ))}
          </select>

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
