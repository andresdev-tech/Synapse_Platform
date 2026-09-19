import { AuthRepository } from "./auth.repository";
import { RegisterDTO, LoginDTO, AuthResponse, OtpEmailDTO, OtpVerifyDTO, LoginAdminDTO } from "./auth.types";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { RoleNames, prisma } from "../../config/prisma";
import { SessionRepository } from "../session/session.repository";
import { AuditLogService } from "../audit-log/audit-log.service";
import { AllowedDomainService } from "../allowed-domain/allowed-domain.service";
import { AuditAction } from "../../../generated/prisma/client";
import crypto from "crypto";

/**
 * Servicio principal de autenticación y seguridad.
 * Contiene la lógica de negocio para inicio de sesión, generación de tokens JWT, emisión de códigos OTP y registro de sesiones.
 */
export class AuthService {
  /**
   * Registra la sesión activa del usuario, actualiza su fecha de último acceso y guarda el evento en la auditoría.
   */
  private static async recordUserLogin(user: { id: string; email: string }, token: string, role: string, loginType: string) {
    const expires = new Date(Date.now() + 3 * 60 * 60 * 1000);
    let session = null;
    try {
      session = await SessionRepository.createSession({
        sessionToken: crypto.randomUUID(),
        userId: user.id,
        expires,
      });
    } catch (err) {
      console.error("[AuthService] Error al guardar la sesión en DB:", err);
    }

    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
    } catch (err) {
      console.error("[AuthService] Error al actualizar lastLoginAt:", err);
    }

    try {
      await AuditLogService.logEvent({
        actorId: user.id,
        action: AuditAction.LOGIN,
        entity: "Session",
        entityId: session?.id || null,
        metadata: {
          email: user.email,
          role,
          loginType,
          expiresAt: expires,
        },
      });
    } catch (err) {
      console.error("[AuthService] Error al guardar audit log de inicio de sesión:", err);
    }
  }

  /**
   * Genera y firma el token de seguridad JWT para el usuario con vigencia de 3 horas.
   */
  private static createJwt(user: { id: string; email: string; name?: string | null; layoutPrefs?: unknown }, role: string) {
    const secret = process.env.JWT_SECRET || "default_dev_secret_for_synapse";
    const token = jwt.sign(
      { id: user.id, email: user.email, role },
      secret,
      { expiresIn: "3h" }
    );

    return {
      token,
      user: { id: user.id, name: user.name, email: user.email, role, layoutPrefs: user.layoutPrefs },
    };
  }

  /**
   * Configura y retorna el servicio de transporte para el envío de correos electrónicos.
   */
  private static getTransporter() {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER || "test@gmail.com",
        pass: process.env.EMAIL_PASS || "mockpassword123",
      },
    });
  }

  /**
   * Valida permisos, dominios permitidos y disponibilidad de correo para crear un nuevo usuario administrador.
   */
  static async createadmin(data: any) {
    try {
      const domainCheck = await AllowedDomainService.isDomainAllowed(data.email, "ADMIN");
      if (!domainCheck.allowed) {
        return { success: false, error: domainCheck.error || "Solo se permiten correos con dominios autorizados para administración." };
      }

      const emailExist = await AuthRepository.findUserByEmail(data.email);
      if (emailExist) {
        return { success: false, error: "El correo ya está en uso" };
      }
      const role = await AuthRepository.findRoleByName(RoleNames.SUPER_ADMIN);
      if (!role) {
        console.log(role)
        return { success: false, error: "El rol no existe" };
      }
      console.log('role', role)
      const dta = await AuthRepository.createadmin(data);
      return { data: dta }
    } catch (error) {
      return { success: false, error: error };
    }
  }

  /**
   * Procesa el inicio de sesión convencional de un usuario mediante correo electrónico.
   */
  static async loginUser(credentials: LoginDTO): Promise<AuthResponse> {
    const user = await AuthRepository.findUserByEmail(credentials.email);
    if (!user) {
      return { success: false, error: "Credenciales incorrectas" };
    }

    if (!user.emailVerified) {
      return { success: false, error: "unverified_email" }; // Requerido por el frontend
    }

    const role = user.role?.name || RoleNames.USER;
    const jwtData = this.createJwt(user, role);

    await this.recordUserLogin(user, jwtData.token, role, "password");

    return { 
      success: true, 
      data: jwtData,
    };
  }

  /**
   * Valida el dominio del correo, crea el usuario si es nuevo, genera un código OTP de 6 dígitos y lo envía por correo.
   */
  static async requestOtp(data: OtpEmailDTO): Promise<AuthResponse> {
    const email = data.email.trim().toLowerCase();

    const targetScope = data.adminOnly ? "ADMIN" : "USER";
    const domainCheck = await AllowedDomainService.isDomainAllowed(email, targetScope);
    if (!domainCheck.allowed) {
      return {
        success: false,
        error: domainCheck.error || "Dominio de correo no autorizado para este tipo de acceso.",
      };
    }

    let user = await AuthRepository.findUserByEmail(email);

    if (data.adminOnly) {
      if (!user || (user.role?.name !== RoleNames.ADMIN && user.role?.name !== RoleNames.SUPER_ADMIN)) {
        return {
          success: false,
          error: "Acceso denegado: Este correo no cuenta con permisos de Administrador o Super Administrador.",
        };
      }
    } else {
      if (user && (user.role?.name === RoleNames.ADMIN || user.role?.name === RoleNames.SUPER_ADMIN)) {
        return {
          success: false,
          error: "Esta cuenta pertenece al personal administrativo. Por favor, utiliza el acceso designado para tu perfil.",
        };
      }
    }

    if (!user) {
      const userRole = await AuthRepository.findRoleByName(RoleNames.USER) || await AuthRepository.createRole(RoleNames.USER);
      await AuthRepository.createUser({
        name: email.split("@")[0],
        email,
        roleId: userRole.id,
        emailVerified: null,
      });
      user = await AuthRepository.findUserByEmail(email);
    }

    if (!user) return { success: false, error: "No se pudo crear el usuario." };

    await AuthRepository.deleteVerificationCodes(email);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await AuthRepository.createVerificationCode(email, code, new Date(Date.now() + 10 * 60 * 1000));

    await this.sendCode(email, code, "Código de acceso - Synapse");
    return { success: true, data: { email } };
  }

  /**
   * Verifica la validez del código OTP ingresado y retorna la sesión con el token JWT del usuario.
   */
  static async verifyOtp(data: OtpVerifyDTO): Promise<AuthResponse> {
    const email = data.email.trim().toLowerCase();
    const user = await AuthRepository.findUserByEmail(email);

    if (!user) {
      return { success: false, error: "No existe una cuenta asociada a este correo." };
    }

    const verification = await AuthRepository.findVerificationCode(email, data.code);
    if (!verification) {
      return { success: false, error: "Código inválido o expirado." };
    }

    await AuthRepository.updateUserEmailVerified(email);
    await AuthRepository.deleteVerificationCodes(email);

    const role = user.role?.name || RoleNames.USER;
    const jwtData = this.createJwt(user, role);

    await this.recordUserLogin(user, jwtData.token, role, "otp");

    return { success: true, data: jwtData };
  }

  /**
   * Envía el correo electrónico con el código OTP de acceso o lo imprime en consola si no hay credenciales SMTP.
   */
  private static async sendCode(email: string, code: string, subject: string) {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await this.getTransporter().sendMail({
        from: '"Synapse CTMA" <no-reply@synapse.edu.co>',
        to: email,
        subject,
        html: `<h1>Synapse</h1><p>Tu código de acceso es: <b>${code}</b></p><p>Este código vence en 10 minutos.</p>`,
      });
    } else {
      console.log(`\n[MOCK EMAIL] Para: ${email} | Código OTP: ${code}\n`);
    }
  }

  /**
   * Procesa la autenticación exclusiva para el portal de administración validando rol y dominio permitido.
   */
  static async loginAdmin(credentials: LoginAdminDTO): Promise<AuthResponse> {
    const domainCheck = await AllowedDomainService.isDomainAllowed(credentials.email, "ADMIN");
    if (!domainCheck.allowed) {
      return { success: false, error: domainCheck.error || "Dominio no autorizado para el portal administrativo." };
    }

    const user = await AuthRepository.findUserByEmail(credentials.email);
    if (!user) {
      return { success: false, error: "Credenciales incorrectas" };
    }

    if (!user.emailVerified) {
      return { success: false, error: "unverified_email" };
    }

    const validAdminRoles = [RoleNames.ADMIN, RoleNames.SUPER_ADMIN];
    const userRole = (user.role?.name || "") as any;

    const isAdmin = validAdminRoles.includes(userRole);
    if (!isAdmin) {
      return { success: false, error: "unauthorized" };
    }

    const role = user.role?.name || "GUEST";
    const jwtData = this.createJwt(user, role);

    await this.recordUserLogin(user, jwtData.token, role, "admin_password");

    return { success: true, data: jwtData };
  }
}

