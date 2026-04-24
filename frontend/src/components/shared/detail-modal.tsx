"use client";

import { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface DetailModalProps {
  title: string;
  open: boolean;
  onClose: () => void;
  badge?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "md" | "lg";
}

export function DetailModal({
  title,
  open,
  onClose,
  badge,
  children,
  footer,
  size = "lg",
}: DetailModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className={cn(
          "p-0 gap-0 border-2 border-border rounded-xl overflow-hidden",
          size === "lg" ? "max-w-2xl" : "max-w-md"
        )}
      >
        <DialogHeader className="bg-secondary px-6 py-4">
          <div className="flex items-center justify-between gap-3">
            <DialogTitle className="text-white font-bold text-lg">
              {title}
            </DialogTitle>
            {badge}
          </div>
        </DialogHeader>

        <div className="px-6 py-5 overflow-y-auto max-h-[60vh] space-y-4 bg-card">
          {children}
        </div>

        {footer && (
          <div className="px-6 py-4 border-t border-border/30 bg-card flex items-center gap-3 justify-end">
            {footer}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
