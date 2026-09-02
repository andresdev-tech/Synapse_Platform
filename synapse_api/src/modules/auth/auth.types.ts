import { z } from "zod";
import { registerSchema, forgotPasswordSchema, resetPasswordSchema } from "./auth.schema";

export type RegisterDTO = z.infer<typeof registerSchema>;
export type ForgotPasswordDTO = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordDTO = z.infer<typeof resetPasswordSchema>;

export interface AuthResponse {
  success: boolean;
  error?: string;
  data?: any;
}
export type LoginDTO = { email: string; password: string; };
