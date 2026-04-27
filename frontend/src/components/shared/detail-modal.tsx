"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface DetailModalProps {
  title: string;
  open: boolean;
  onClose: () => void;
  badge?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
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
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
        <SheetContent
          side="bottom"
          className="max-h-[92vh] rounded-t-2xl p-0 gap-0 flex flex-col"
        >
          <SheetHeader className="px-5 pt-5 pb-3 border-b border-border/40 text-left">
            <div className="flex items-center justify-between gap-3 pr-10">
              <SheetTitle className="text-lg font-semibold">{title}</SheetTitle>
              {badge}
            </div>
          </SheetHeader>
          <ScrollArea className="flex-1 min-h-0">
            <div className="px-5 py-5">{children}</div>
          </ScrollArea>
          {footer && (
            <div className="px-5 py-3 border-t border-border/40 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              {footer}
            </div>
          )}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className={cn(
          "p-0 gap-0 overflow-hidden max-h-[90vh] flex flex-col",
          size === "lg" ? "sm:max-w-2xl" : "sm:max-w-md",
        )}
      >
        <DialogHeader className="px-6 pt-5 pb-3 border-b border-border/40 text-left">
          <div className="flex items-center justify-between gap-3 pr-10">
            <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
            {badge}
          </div>
        </DialogHeader>
        <ScrollArea className="flex-1 min-h-0">
          <div className="px-6 py-5">{children}</div>
        </ScrollArea>
        {footer && (
          <div className="px-6 py-3 border-t border-border/40 flex gap-2 justify-end">
            {footer}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
