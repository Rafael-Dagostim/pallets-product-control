"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { maskCurrencyBRL, parseCurrencyBRL } from "@/lib/masks";
import { cn } from "@/lib/utils";

interface CurrencyInputProps
  extends Omit<React.ComponentProps<"input">, "value" | "onChange" | "type"> {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  prefix?: string;
}

export const CurrencyInput = React.forwardRef<
  HTMLInputElement,
  CurrencyInputProps
>(function CurrencyInput(
  { value, onChange, prefix = "R$", className, ...props },
  ref,
) {
  const display =
    value === undefined || Number.isNaN(value) ? "" : maskCurrencyBRL(value);

  return (
    <div className="relative">
      <span
        aria-hidden
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
      >
        {prefix}
      </span>
      <Input
        ref={ref}
        inputMode="numeric"
        value={display}
        onChange={(e) => {
          const parsed = parseCurrencyBRL(e.target.value);
          onChange(Number.isNaN(parsed) ? undefined : parsed);
        }}
        className={cn("pl-10", className)}
        {...props}
      />
    </div>
  );
});
