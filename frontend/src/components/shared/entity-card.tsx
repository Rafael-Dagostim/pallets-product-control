"use client";

import { cn } from "@/lib/utils";

interface EntityCardProps {
  title: string;
  subtitle?: string;
  badge?: {
    label: string;
    variant?: "active" | "open" | "canceled" | "production" | "done";
  };
  metadata?: { label: string; value: string }[];
  onClick?: () => void;
  className?: string;
}

const badgeColors = {
  active: "bg-status-active text-white",
  open: "bg-status-open text-white",
  canceled: "bg-status-canceled text-white",
  production: "bg-status-production text-white",
  done: "bg-status-active text-white",
};

export function EntityCard({
  title,
  subtitle,
  badge,
  metadata,
  onClick,
  className,
}: EntityCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-card border-2 border-border rounded-lg p-4 md:p-5",
        "shadow-sm transition-transform",
        onClick && "cursor-pointer hover:scale-[1.01]",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold uppercase truncate">{title}</h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
        {badge && (
          <span
            className={cn(
              "shrink-0 px-3 py-1 rounded-full text-xs font-bold uppercase",
              badgeColors[badge.variant || "open"]
            )}
          >
            {badge.label}
          </span>
        )}
      </div>
      {metadata && metadata.length > 0 && (
        <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2">
          {metadata.map((item) => (
            <span key={item.label} className="text-sm">
              <span className="text-muted-foreground">{item.label}: </span>
              <span className="font-bold">{item.value}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
