import { z } from "zod";

const passwordRegex = /^(?=.*[A-Z])(?=.*\d.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/;
const passwordMessage = "La contraseña debe tener mínimo 6 caracteres, una mayúscula, dos números y un carácter especial";
const allowedEmail = z.string().trim().toLowerCase().email("Correo inválido").refine(
  (email) => email.endsWith("@soy.sena.edu.co") || email.endsWith("@gmail.com"),
  "Solo se permiten correos @soy.sena.edu.co o @gmail.com"
);

export const registerSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  email: allowedEmail,
  password: z.string().regex(passwordRegex, passwordMessage),
  captchaToken: z.string().optional()
});

export const LoginAdmin = z.object({
  email: allowedEmail,
  captchaToken: z.string().optional()
});

export const forgotPasswordSchema = z.object({
  email: allowedEmail
});

export const resetPasswordSchema = z.object({
  email: allowedEmail,
    code: z.string().length(6, "Código inválido").refine(
      (code) => /^[0-9]{6}$/.test(code),
      "El código debe ser un número de 6 dígitos"
    ),
  newPassword: z.string().regex(passwordRegex, passwordMessage)
});
export const loginSchema = z.object({
  email: allowedEmail,
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export const otpEmailSchema = z.object({
  email: allowedEmail,
  captchaToken: z.string().optional(),
  adminOnly: z.boolean().optional(),
});
export const otpVerifySchema = z.object({
  email: allowedEmail,
  code: z.string().regex(/^\d{6}$/, "El código debe tener 6 dígitos"),
});
