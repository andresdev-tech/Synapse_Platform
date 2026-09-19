import { z } from "zod";

const validEmail = z.string().trim().toLowerCase().email("Correo electrónico inválido");

export const registerSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  email: validEmail,
  captchaToken: z.string().nullable().optional()
});

export const LoginAdmin = z.object({
  email: validEmail,
  captchaToken: z.string().nullable().optional()
});

export const loginSchema = z.object({
  email: validEmail,
});

export const otpEmailSchema = z.object({
  email: validEmail,
  captchaToken: z.string().nullable().optional(),
  adminOnly: z.boolean().optional(),
});
export const otpVerifySchema = z.object({
  email: validEmail,
  code: z.string().regex(/^\d{6}$/, "El código debe tener 6 dígitos"),
});
