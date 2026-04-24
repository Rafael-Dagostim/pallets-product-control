"use client";

import { ReactNode } from "react";
import { Draggable } from "@hello-pangea/dnd";

interface KanbanCardWrapperProps {
  draggableId: string;
  index: number;
  onClick?: () => void;
  children: ReactNode;
  dragDisabled?: boolean;
}

export function KanbanCardWrapper({
  draggableId,
  index,
  onClick,
  children,
  dragDisabled = false,
}: KanbanCardWrapperProps) {
  return (
    <Draggable draggableId={draggableId} index={index} isDragDisabled={dragDisabled}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`transition-shadow rounded-lg ${
            dragDisabled
              ? "cursor-pointer hover:shadow-md"
              : snapshot.isDragging
                ? "shadow-lg cursor-grabbing"
                : "hover:shadow-md cursor-grab"
          }`}
        >
          {children}
        </div>
      )}
    </Draggable>
  );
}
