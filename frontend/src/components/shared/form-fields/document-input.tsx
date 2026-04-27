"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { maskCPF, maskCNPJ, maskDocument, unmask } from "@/lib/masks";

type Kind = "cpf" | "cnpj" | "auto";

interface DocumentInputProps
  extends Omit<React.ComponentProps<"input">, "value" | "onChange"> {
  value: string;
  onChange: (masked: string) => void;
  kind?: Kind;
}

export const DocumentInput = React.forwardRef<
  HTMLInputElement,
  DocumentInputProps
>(function DocumentInput(
  { value, onChange, kind = "auto", placeholder, ...props },
  ref,
) {
  const mask =
    kind === "cpf" ? maskCPF : kind === "cnpj" ? maskCNPJ : maskDocument;

  const maxLength = kind === "cpf" ? 14 : kind === "cnpj" ? 18 : 18;

  const resolvedPlaceholder =
    placeholder ??
    (kind === "cpf"
      ? "000.000.000-00"
      : kind === "cnpj"
        ? "00.000.000/0000-00"
        : "CPF ou CNPJ");

  return (
    <Input
      ref={ref}
      inputMode="numeric"
      autoComplete="off"
      maxLength={maxLength}
      placeholder={resolvedPlaceholder}
      value={value ? mask(value) : ""}
      onChange={(e) => {
        const raw = unmask(e.target.value);
        onChange(raw);
      }}
      {...props}
    />
  );
});
