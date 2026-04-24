"use client";

import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

interface FormModalProps {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function FormModal({ title, open, onClose, children }: FormModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent showCloseButton={false} className="bg-card border-2 border-border rounded-lg max-w-md mx-4 md:mx-auto p-0 gap-0 overflow-hidden">
        <DialogHeader className="bg-secondary px-6 py-4 relative">
          <DialogTitle className="text-xl font-bold uppercase tracking-wide text-white">
            {title}
          </DialogTitle>
          <DialogClose className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-opacity">
            <X className="size-5" />
            <span className="sr-only">Fechar</span>
          </DialogClose>
        </DialogHeader>
        <div className="space-y-6 px-6 py-6">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
