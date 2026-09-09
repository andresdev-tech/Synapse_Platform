import { z } from "zod";
import { registerSchema, forgotPasswordSchema, resetPasswordSchema, loginSchema, otpEmailSchema, otpVerifySchema, LoginAdmin } from "./auth.schema";

export type RegisterDTO = z.infer<typeof registerSchema>;
export type ForgotPasswordDTO = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordDTO = z.infer<typeof resetPasswordSchema>;
export type OtpEmailDTO = z.infer<typeof otpEmailSchema>;
export type OtpVerifyDTO = z.infer<typeof otpVerifySchema>;
export type LoginAdminDTO = z.infer<typeof LoginAdmin>;

export interface AuthResponse {
  success: boolean;
  error?: string;
  data?: any;
}
export type LoginDTO = z.infer<typeof loginSchema>;
