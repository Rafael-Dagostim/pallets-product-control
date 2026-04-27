"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ReportTemplate } from "@/services/reports.service";

interface Props {
  templates: ReportTemplate[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function TemplatePicker({
  templates,
  selectedId,
  onSelect,
  onCreate,
  onEdit,
  onDelete,
}: Props) {
  const disabled = !selectedId;

  return (
    <div className="flex items-center gap-2">
      <Select
        value={selectedId ?? ""}
        onValueChange={(v) => v && onSelect(v)}
        disabled={templates.length === 0}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue
            placeholder={
              templates.length === 0 ? "Nenhum template" : "Selecionar template"
            }
          />
        </SelectTrigger>
        <SelectContent>
          {templates.map((t) => (
            <SelectItem key={t.id} value={t.id}>
              {t.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        size="sm"
        variant="outline"
        onClick={onEdit}
        disabled={disabled}
        aria-label="Editar template"
      >
        <Pencil className="size-4" />
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={onDelete}
        disabled={disabled}
        aria-label="Excluir template"
      >
        <Trash2 className="size-4" />
      </Button>
      <Button size="sm" onClick={onCreate}>
        <Plus className="size-4 mr-1" />
        Novo
      </Button>
    </div>
  );
}
