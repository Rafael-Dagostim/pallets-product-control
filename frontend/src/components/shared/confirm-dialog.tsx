"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  isLoading?: boolean;
  confirmLabel?: string;
  confirmVariant?: "destructive" | "default";
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Tem certeza?",
  description = "Essa ação não pode ser desfeita.",
  isLoading = false,
  confirmLabel,
  confirmVariant = "destructive",
}: ConfirmDialogProps) {
  const label =
    confirmLabel ?? (confirmVariant === "destructive" ? "Excluir" : "Confirmar");

  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
            className={cn(buttonVariants({ variant: confirmVariant }))}
          >
            {isLoading ? "Processando..." : label}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
