export function maskCPF(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function maskCNPJ(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

export function maskDocument(value: string): string {
  const digits = value.replace(/\D/g, "");
  return digits.length <= 11 ? maskCPF(value) : maskCNPJ(value);
}

export function maskPhoneBR(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
  return digits
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

export function maskIntPositive(value: string, max?: number): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  const n = parseInt(digits, 10);
  if (max !== undefined && n > max) return String(max);
  return String(n);
}

/**
 * Formats a numeric value as BRL currency (without the R$ prefix).
 * Accepts either a number (assumed to be in whole BRL, e.g. 1234.56)
 * or a string of raw digits (assumed to be cents, e.g. "123456" → "1.234,56").
 */
export function maskCurrencyBRL(value: string | number): string {
  let cents: number;
  if (typeof value === "number") {
    cents = Math.round(value * 100);
  } else {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "";
    cents = parseInt(digits, 10);
  }
  const reais = cents / 100;
  return reais.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Parses a BRL-formatted string ("1.234,56") into a JS number (1234.56).
 * Returns NaN if the input has no digits.
 */
export function parseCurrencyBRL(value: string): number {
  const digits = value.replace(/\D/g, "");
  if (!digits) return NaN;
  return parseInt(digits, 10) / 100;
}

export function unmask(value: string): string {
  return value.replace(/\D/g, "");
}
