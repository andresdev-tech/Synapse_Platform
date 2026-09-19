import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { AuthRepository } from "./auth.repository";
import { registerSchema, loginSchema, otpEmailSchema, otpVerifySchema, LoginAdmin } from "./auth.schema";
import { ZodError } from "zod";

/**
 * Controlador de autenticación y accesos.
 * Maneja el inicio de sesión convencional, acceso con código OTP al correo, verificación de email y login administrativo.
 */
export class AuthController {
  /**
   * Procesa el inicio de sesión de usuarios con correo y contraseña.
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const parsedData = loginSchema.parse(req.body);
      
      const result = await AuthService.loginUser(parsedData);
      if (!result.success) {
        res.status(401).json({ error: result.error });
        return;
      }

      res.status(200).json({ success: true, data: result.data });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: error.issues[0].message });
        return;
      }
      console.error('[Login Error]', error); res.status(500).json({ error: "Error en el servidor" });
    }
  }

  /**
   * Recibe la solicitud para generar y enviar un código de verificación OTP al correo electrónico.
   * Valida el reCAPTCHA si está activo y comprueba el dominio del correo.
   */
  static async requestOtp(req: Request, res: Response): Promise<void> {
    try {
      const parsedData = otpEmailSchema.parse(req.body);

      if (process.env.RECAPTCHA_SECRET_KEY && process.env.RECAPTCHA_SECRET_KEY !== "dummy") {
        if (!parsedData.captchaToken) {
          res.status(400).json({ error: "Por favor, completa el reCAPTCHA" });
          return;
        }

        const captchaRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `secret=${encodeURIComponent(process.env.RECAPTCHA_SECRET_KEY)}&response=${encodeURIComponent(parsedData.captchaToken)}`,
        });
        const captchaData = await captchaRes.json() as { success?: boolean; 'error-codes'?: string[] };
        if (!captchaData.success) {
          console.error("[reCAPTCHA Verification Failed]", captchaData);
          res.status(400).json({ error: "Error al validar el reCAPTCHA" });
          return;
        }
      }

      const result = await AuthService.requestOtp(parsedData);

      if (!result.success) {
        res.status(403).json({ error: result.error });
        return;
      }

      res.status(200).json({ success: true, data: result.data });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: error.issues[0].message });
        return;
      }
      console.error("[OTP Request Error]", error);
      res.status(500).json({ error: "No se pudo enviar el código." });
    }
  }

  /**
   * Valida el código OTP ingresado por el usuario y le otorga su sesión/token de acceso.
   */
  static async verifyOtp(req: Request, res: Response): Promise<void> {
    try {
      const parsedData = otpVerifySchema.parse(req.body);
      const result = await AuthService.verifyOtp(parsedData);

      if (!result.success) {
        res.status(401).json({ error: result.error });
        return;
      }

      res.status(200).json({ success: true, data: result.data });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: error.issues[0].message });
        return;
      }
      console.error("[OTP Verify Error]", error);
      res.status(500).json({ error: "No se pudo verificar el código." });
    }
  }

  /**
   * Confirma la verificación del correo electrónico de una cuenta a través de un código.
   */
  static async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email, code } = req.body;
      if (!email || !code) {
        res.status(400).json({ error: "Faltan datos" });
        return;
      }

      const verification = await AuthRepository.findVerificationCode(email, code);
      if (!verification) {
        res.status(400).json({ error: "Código inválido o expirado" });
        return;
      }

      await AuthRepository.updateUserEmailVerified(email);
      await AuthRepository.deleteVerificationCodes(email);

      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  /**
   * Procesa el inicio de sesión exclusivo para cuentas con rol administrativo.
   */
  static async loginAdmin(req: Request, res: Response): Promise<void> {
    try {
      const parsedData = LoginAdmin.parse(req.body);

      if (process.env.RECAPTCHA_SECRET_KEY && process.env.RECAPTCHA_SECRET_KEY !== "dummy") {
        if (!parsedData.captchaToken) {
          res.status(400).json({ error: "Por favor, completa el reCAPTCHA" });
          return;
        }

        const captchaRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `secret=${encodeURIComponent(process.env.RECAPTCHA_SECRET_KEY)}&response=${encodeURIComponent(parsedData.captchaToken)}`,
        });
        const captchaData = await captchaRes.json() as { success?: boolean; 'error-codes'?: string[] };
        if (!captchaData.success) {
          console.error("[reCAPTCHA Verification Failed (Admin)]", captchaData);
          res.status(400).json({ error: "Error al validar el reCAPTCHA" });
          return;
        }
      }

      const result = await AuthService.loginAdmin(parsedData);
      if (!result.success) {
        res.status(401).json({ error: result.error });
        return;
      }

      res.status(200).json({ success: true, data: result.data });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: error.issues[0].message });
        return;
      }
      console.error('[Login Error]', error); res.status(500).json({ error: "Error en el servidor" });
    }
  }

  /**
   * Registra una nueva cuenta con rol de Administrador en el sistema.
   */
  static async CreateAdmin(req: Request, res: Response): Promise<void> {
    const data = req.body;
    const result = await AuthService.createadmin(data);
    if (!result) {
      res.status(401).json({ error: "Error al crear el admin" });
      return;
    }
    res.status(200).json({ success: true, data: result.data });
  }
}

