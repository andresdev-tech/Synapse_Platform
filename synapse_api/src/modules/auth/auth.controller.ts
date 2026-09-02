import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { AuthRepository } from "./auth.repository";
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from "./auth.schema";
import { ZodError } from "zod";


export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const parsedData = registerSchema.parse(req.body);
      
      // ReCaptcha validation
      if (process.env.RECAPTCHA_SECRET_KEY && process.env.RECAPTCHA_SECRET_KEY !== "dummy") {
        if (!parsedData.captchaToken) {
          res.status(400).json({ error: "Por favor, completa el reCAPTCHA" });
          return;
        }
        
        const captchaRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${parsedData.captchaToken}`
        });
        const captchaData: any = await captchaRes.json();
        if (!captchaData.success) {
          res.status(400).json({ error: "Error al validar el reCAPTCHA" });
          return;
        }
      }

      const result = await AuthService.registerUser(parsedData);
      if (!result.success) {
        res.status(400).json({ error: result.error });
        return;
      }

      res.status(201).json({ success: true, data: result.data });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: error.errors[0].message });
        return;
      }
      console.error('[Login Error]', error); res.status(500).json({ error: "Error en el servidor" });
    }
  }

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
        res.status(400).json({ error: error.errors[0].message });
        return;
      }
      console.error('[Login Error]', error); res.status(500).json({ error: "Error en el servidor" });
    }
  }

  static async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const parsedData = forgotPasswordSchema.parse(req.body);
      await AuthService.requestPasswordReset(parsedData);
      res.status(200).json({ success: true });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: error.errors[0].message });
        return;
      }
      console.error('[Login Error]', error); res.status(500).json({ error: "Error en el servidor" });
    }
  }

  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const parsedData = resetPasswordSchema.parse(req.body);
      const result = await AuthService.resetPassword(parsedData);
      if (!result.success) {
        res.status(400).json({ error: result.error });
        return;
      }
      res.status(200).json({ success: true });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: error.errors[0].message });
        return;
      }
      console.error('[Login Error]', error); res.status(500).json({ error: "Error en el servidor" });
    }
  }

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
}
