"use client";

import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  labels: Record<string, string>;
  colors: Record<string, string>;
  className?: string;
}

export function StatusBadge({
  status,
  labels,
  colors,
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "rounded-full px-3 py-0.5 text-xs font-bold uppercase whitespace-nowrap",
        colors[status] || "bg-muted text-muted-foreground",
        className
      )}
    >
      {labels[status] || status}
    </span>
  );
}
