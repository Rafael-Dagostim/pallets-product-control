import { z } from "zod";
import { unmask } from "./masks";

export function isValidCPF(raw: string): boolean {
  const cpf = unmask(raw);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  const calcCheck = (slice: number) => {
    let sum = 0;
    for (let i = 0; i < slice; i++) {
      sum += parseInt(cpf[i], 10) * (slice + 1 - i);
    }
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };

  return (
    calcCheck(9) === parseInt(cpf[9], 10) &&
    calcCheck(10) === parseInt(cpf[10], 10)
  );
}

export function isValidCNPJ(raw: string): boolean {
  const cnpj = unmask(raw);
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  const calcCheck = (slice: number) => {
    const weights =
      slice === 12
        ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < slice; i++) {
      sum += parseInt(cnpj[i], 10) * weights[i];
    }
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  return (
    calcCheck(12) === parseInt(cnpj[12], 10) &&
    calcCheck(13) === parseInt(cnpj[13], 10)
  );
}

export const cpfSchema = z
  .string()
  .min(1, "CPF é obrigatório")
  .refine(isValidCPF, "CPF inválido");

export const cnpjSchema = z
  .string()
  .min(1, "CNPJ é obrigatório")
  .refine(isValidCNPJ, "CNPJ inválido");

export const cpfOrCnpjSchema = z
  .string()
  .min(1, "Documento é obrigatório")
  .refine((v) => {
    const d = unmask(v);
    return d.length === 11 ? isValidCPF(v) : d.length === 14 ? isValidCNPJ(v) : false;
  }, "Informe um CPF ou CNPJ válido");

export const moneySchema = z
  .number({ message: "Informe um valor válido" })
  .nonnegative("Valor não pode ser negativo");

export const positiveMoneySchema = z
  .number({ message: "Informe um valor válido" })
  .positive("Valor deve ser maior que zero");

export const positiveIntSchema = z
  .number({ message: "Informe um valor válido" })
  .int("Use um número inteiro")
  .positive("Deve ser maior que zero");

export const nonNegativeIntSchema = z
  .number({ message: "Informe um valor válido" })
  .int("Use um número inteiro")
  .nonnegative("Não pode ser negativo");
