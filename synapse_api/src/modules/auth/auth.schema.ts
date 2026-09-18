import { z } from "zod";

const allowedEmail = z.string().trim().toLowerCase().email("Correo inválido").refine(
  (email) => email.endsWith("@soy.sena.edu.co") || email.endsWith("@gmail.com"),
  "Solo se permiten correos @soy.sena.edu.co o @gmail.com"
);

export const registerSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  email: allowedEmail,
  captchaToken: z.string().nullable().optional()
});

export const LoginAdmin = z.object({
  email: allowedEmail,
  captchaToken: z.string().nullable().optional()
});

export const loginSchema = z.object({
  email: allowedEmail,
});

export const otpEmailSchema = z.object({
  email: allowedEmail,
  captchaToken: z.string().nullable().optional(),
  adminOnly: z.boolean().optional(),
});
export const otpVerifySchema = z.object({
  email: allowedEmail,
  code: z.string().regex(/^\d{6}$/, "El código debe tener 6 dígitos"),
});
