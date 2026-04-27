"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";

interface IntegerInputProps
  extends Omit<React.ComponentProps<"input">, "value" | "onChange" | "type"> {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  min?: number;
  max?: number;
}

export const IntegerInput = React.forwardRef<
  HTMLInputElement,
  IntegerInputProps
>(function IntegerInput({ value, onChange, min, max, ...props }, ref) {
  return (
    <Input
      ref={ref}
      inputMode="numeric"
      value={value === undefined ? "" : String(value)}
      onChange={(e) => {
        const digits = e.target.value.replace(/\D/g, "");
        if (!digits) {
          onChange(undefined);
          return;
        }
        let n = parseInt(digits, 10);
        if (min !== undefined && n < min) n = min;
        if (max !== undefined && n > max) n = max;
        onChange(n);
      }}
      {...props}
    />
  );
});
