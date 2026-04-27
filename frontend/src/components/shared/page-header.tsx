"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
  children,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {children}
        {actionLabel && onAction && (
          <Button onClick={onAction}>
            <Plus className="size-4 mr-1" />
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
