/**
 * Applies CPF mask: 000.000.000-00
 */
export function maskCPF(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

/**
 * Strips all non-digit characters from a string
 */
export function unmask(value: string): string {
  return value.replace(/\D/g, "");
}
