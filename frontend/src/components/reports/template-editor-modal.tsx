"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd";
import { GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { FormModal } from "@/components/shared/form-modal";
import { WIDGET_CATALOG } from "@/lib/reports";
import type {
  ReportTemplate,
  WidgetConfig,
  WidgetType,
} from "@/services/reports.service";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (dto: {
    name: string;
    widgets: WidgetConfig[];
  }) => Promise<void>;
  existing: ReportTemplate | null;
  isSubmitting?: boolean;
}

interface Row {
  type: WidgetType;
  selected: boolean;
}

function buildInitialRows(existing: ReportTemplate | null): Row[] {
  if (!existing) {
    return WIDGET_CATALOG.map((w, i) => ({
      type: w.type,
      selected: i < 3,
    }));
  }
  const selectedOrder = existing.widgets.map((w) => w.type);
  const selectedSet = new Set(selectedOrder);
  const rest = WIDGET_CATALOG.filter((w) => !selectedSet.has(w.type)).map(
    (w) => w.type,
  );
  return [...selectedOrder, ...rest].map((type) => ({
    type,
    selected: selectedSet.has(type),
  }));
}

export function TemplateEditorModal({
  open,
  onClose,
  onSubmit,
  existing,
  isSubmitting,
}: Props) {
  const [name, setName] = useState("");
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    if (!open) return;
    setName(existing?.name ?? "");
    setRows(buildInitialRows(existing));
  }, [open, existing]);

  const canSave = useMemo(
    () => name.trim().length >= 2 && rows.some((r) => r.selected),
    [name, rows],
  );

  function toggle(type: WidgetType) {
    setRows((prev) =>
      prev.map((r) => (r.type === type ? { ...r, selected: !r.selected } : r)),
    );
  }

  function handleDragEnd(result: DropResult) {
    if (!result.destination) return;
    const from = result.source.index;
    const to = result.destination.index;
    if (from === to) return;
    setRows((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  async function handleSubmit() {
    const widgets = rows
      .filter((r) => r.selected)
      .map<WidgetConfig>((r) => ({ type: r.type }));
    await onSubmit({ name: name.trim(), widgets });
  }

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={existing ? "Editar template" : "Novo template"}
      description="Organize os widgets que devem aparecer no relatório. Arraste para reordenar."
      size="lg"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Nome
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Operacional mensal"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-2">
            Widgets
          </label>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="widgets">
              {(provided) => (
                <ul
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-2"
                >
                  {rows.map((row, index) => {
                    const meta = WIDGET_CATALOG.find(
                      (w) => w.type === row.type,
                    )!;
                    return (
                      <Draggable
                        key={row.type}
                        draggableId={row.type}
                        index={index}
                      >
                        {(dp, snapshot) => (
                          <li
                            ref={dp.innerRef}
                            {...dp.draggableProps}
                            className={`flex items-start gap-3 rounded-md border bg-card px-3 py-2 ${
                              snapshot.isDragging
                                ? "border-primary shadow-md"
                                : "border-border/60"
                            }`}
                          >
                            <button
                              type="button"
                              {...dp.dragHandleProps}
                              aria-label="Arrastar"
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <GripVertical className="size-4 mt-0.5" />
                            </button>
                            <Checkbox
                              checked={row.selected}
                              onCheckedChange={() => toggle(row.type)}
                              aria-label={meta.label}
                              className="mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium">
                                {meta.label}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {meta.description}
                              </div>
                            </div>
                          </li>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSave || isSubmitting}
          >
            {existing ? "Salvar" : "Criar template"}
          </Button>
        </div>
      </div>
    </FormModal>
  );
}
