"use client";

import { ReactNode, useCallback, useMemo } from "react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { KanbanColumn } from "./kanban-column";
import { KanbanCardWrapper } from "./kanban-card-wrapper";

export interface KanbanColumnDef {
  status: string;
  label: string;
  headerColor: string;
  headerTextColor?: string;
}

interface KanbanBoardProps<T> {
  columns: KanbanColumnDef[];
  items: T[];
  statusKey: keyof T;
  onStatusChange?: (itemId: string, newStatus: string) => Promise<void>;
  onCardClick?: (item: T) => void;
  renderCard: (item: T) => ReactNode;
  keyExtractor: (item: T) => string;
  dragDisabled?: boolean;
}

export function KanbanBoard<T>({
  columns,
  items,
  statusKey,
  onStatusChange,
  onCardClick,
  renderCard,
  keyExtractor,
  dragDisabled = false,
}: KanbanBoardProps<T>) {
  const grouped = useMemo(() => {
    const map: Record<string, T[]> = {};
    for (const col of columns) {
      map[col.status] = [];
    }
    for (const item of items) {
      const status = String(item[statusKey]);
      if (map[status]) {
        map[status].push(item);
      }
    }
    return map;
  }, [columns, items, statusKey]);

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination || !onStatusChange) return;
      const { draggableId, destination } = result;
      const newStatus = destination.droppableId;
      if (result.source.droppableId === newStatus) return;
      onStatusChange(draggableId, newStatus);
    },
    [onStatusChange]
  );

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="kanban-scroll">
        {columns.map((col) => {
          const colItems = grouped[col.status] || [];
          return (
            <KanbanColumn
              key={col.status}
              droppableId={col.status}
              label={col.label}
              headerColor={col.headerColor}
              headerTextColor={col.headerTextColor}
              count={colItems.length}
            >
              {colItems.map((item, index) => (
                <KanbanCardWrapper
                  key={keyExtractor(item)}
                  draggableId={keyExtractor(item)}
                  index={index}
                  dragDisabled={dragDisabled}
                  onClick={
                    onCardClick ? () => onCardClick(item) : undefined
                  }
                >
                  {renderCard(item)}
                </KanbanCardWrapper>
              ))}
            </KanbanColumn>
          );
        })}
      </div>
    </DragDropContext>
  );
}
