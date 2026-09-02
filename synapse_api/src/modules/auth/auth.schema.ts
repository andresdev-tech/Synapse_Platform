import { z } from "zod";

const passwordRegex = /^(?=.*[A-Z])(?=.*\d.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/;
const passwordMessage = "La contraseña debe tener mínimo 6 caracteres, una mayúscula, dos números y un carácter especial";

export const registerSchema = z.object({
  name: z.string().min(2, "El nombre es muy corto").max(100),
  email: z.string().email("Correo inválido"),
  password: z.string().regex(passwordRegex, passwordMessage),
  captchaToken: z.string().optional()
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Correo inválido")
});

export const resetPasswordSchema = z.object({
  email: z.string().email("Correo inválido"),
  code: z.string().length(6, "Código inválido"),
  newPassword: z.string().regex(passwordRegex, passwordMessage)
});
export const loginSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});
