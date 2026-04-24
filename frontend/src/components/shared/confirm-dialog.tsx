"use client";

import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Tem certeza?",
  description = "Essa ação não pode ser desfeita.",
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent showCloseButton={false} className="bg-card border-2 border-border rounded-lg max-w-sm mx-4 md:mx-auto p-0 gap-0 overflow-hidden">
        <DialogHeader className="bg-secondary px-6 py-4 relative">
          <DialogTitle className="text-lg font-bold uppercase tracking-wide text-white">
            {title}
          </DialogTitle>
          <DialogClose className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-opacity">
            <X className="size-5" />
            <span className="sr-only">Fechar</span>
          </DialogClose>
        </DialogHeader>
        <div className="px-6 py-6 space-y-4">
          <DialogDescription className="text-muted-foreground">
            {description}
          </DialogDescription>
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 font-bold uppercase"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              className="flex-1 font-bold uppercase"
              disabled={isLoading}
            >
              {isLoading ? "Excluindo..." : "Excluir"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
