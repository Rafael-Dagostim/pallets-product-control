"use client";

import { ReactNode } from "react";
import { Droppable } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  droppableId: string;
  label: string;
  headerColor: string;
  headerTextColor?: string;
  count: number;
  children: ReactNode;
}

export function KanbanColumn({
  droppableId,
  label,
  headerColor,
  headerTextColor = "text-white",
  count,
  children,
}: KanbanColumnProps) {
  return (
    <div className="min-w-[280px] w-[85vw] md:w-[300px] lg:w-0 lg:flex-1 snap-center shrink-0 flex flex-col max-h-[calc(100vh-220px)]">
      <div
        className={cn(
          "rounded-t-lg px-4 py-3 flex items-center justify-between",
          headerColor,
          headerTextColor
        )}
      >
        <span className="font-bold uppercase text-sm tracking-wide">
          {label}
        </span>
        <span className="bg-white/20 rounded-full px-2.5 py-0.5 text-xs font-bold">
          {count}
        </span>
      </div>
      <Droppable droppableId={droppableId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "flex-1 overflow-y-auto rounded-b-lg border border-t-0 border-border/30 p-3 space-y-3 transition-colors",
              snapshot.isDraggingOver ? "bg-primary/5" : "bg-card/50"
            )}
          >
            {children}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
