"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useVirtualKeyboard } from "@/hooks/use-virtual-keyboard";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg" | "xl";

interface FormModalProps {
  title: string;
  description?: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: Size;
  /**
   * On mobile, switch to a bottom sheet. Defaults to true.
   */
  mobileSheet?: boolean;
}

const SIZE_TO_CLASS: Record<Size, string> = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-2xl",
};

export function FormModal({
  title,
  description,
  open,
  onClose,
  children,
  size = "md",
  mobileSheet = true,
}: FormModalProps) {
  const [isMobile, setIsMobile] = React.useState(false);
  const { keyboardHeight, viewportHeight } = useVirtualKeyboard();
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!mobileSheet) return;
    const mq = window.matchMedia("(max-width: 640px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [mobileSheet]);

  React.useEffect(() => {
    if (!(mobileSheet && isMobile && open)) return;
    const root = contentRef.current;
    if (!root) return;
    const onFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const tag = target.tagName;
      if (tag !== "INPUT" && tag !== "TEXTAREA" && tag !== "SELECT") return;
      window.setTimeout(() => {
        target.scrollIntoView({ block: "center", behavior: "smooth" });
      }, 250);
    };
    root.addEventListener("focusin", onFocus);
    return () => root.removeEventListener("focusin", onFocus);
  }, [mobileSheet, isMobile, open]);

  if (mobileSheet && isMobile) {
    return (
      <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl p-0 gap-0 flex flex-col"
          style={{
            bottom: keyboardHeight,
            maxHeight: viewportHeight
              ? `${Math.round(viewportHeight * 0.95)}px`
              : "92dvh",
          }}
        >
          <SheetHeader className="px-5 pt-5 pb-3 border-b border-border/40 text-left">
            <SheetTitle className="text-lg font-semibold">{title}</SheetTitle>
            {description && (
              <SheetDescription className="text-sm text-muted-foreground">
                {description}
              </SheetDescription>
            )}
          </SheetHeader>
          <ScrollArea className="flex-1 min-h-0">
            <div ref={contentRef} className="px-5 py-5">{children}</div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className={cn(
          "p-0 gap-0 overflow-hidden max-h-[90vh] flex flex-col",
          SIZE_TO_CLASS[size],
        )}
      >
        <DialogHeader className="px-6 pt-5 pb-3 border-b border-border/40 text-left">
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-sm text-muted-foreground">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <ScrollArea className="flex-1 min-h-0">
          <div className="px-6 py-5">{children}</div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
