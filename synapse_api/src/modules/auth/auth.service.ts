import { AuthRepository } from "./auth.repository";
import { RegisterDTO, LoginDTO, ForgotPasswordDTO, ResetPasswordDTO, AuthResponse, OtpEmailDTO, OtpVerifyDTO, LoginAdminDTO } from "./auth.types";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { RoleNames } from "../../config/prisma";

export class AuthService {
  private static createJwt(user: { id: string; email: string; name?: string | null; layoutPrefs?: unknown }, role: string) {
    const secret = process.env.JWT_SECRET || "default_dev_secret_for_synapse";
    const token = jwt.sign(
      { id: user.id, email: user.email, role },
      secret,
      { expiresIn: "24h" }
    );

    return {
      token,
      user: { id: user.id, name: user.name, email: user.email, role, layoutPrefs: user.layoutPrefs },
    };
  }

  private static getTransporter() {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER || "test@gmail.com",
        pass: process.env.EMAIL_PASS || "mockpassword123",
      },
    });
  }

  static async registerUser(data: RegisterDTO): Promise<AuthResponse> {
    const existingUser = await AuthRepository.findUserByEmail(data.email);
    if (existingUser) {
      return { success: false, error: "El correo ya está en uso" };
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    let userRole = await AuthRepository.findRoleByName(RoleNames.USER);
    if (!userRole) {
      userRole = await AuthRepository.createRole(RoleNames.USER);
    }

    const newUser = await AuthRepository.createUser({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      roleId: userRole.id,
      emailVerified: null
    });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await AuthRepository.createVerificationCode(data.email, code, new Date(Date.now() + 15 * 60 * 1000));

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await this.getTransporter().sendMail({
        from: '"Synapse CTMA" <no-reply@synapse.edu.co>',
        to: data.email,
        subject: "Código de Verificación - Synapse",
        html: `<h1>Bienvenido a Synapse</h1><p>Tu código de verificación es: <b>${code}</b></p>`,
      });
    } else {
      console.log(`\n[MOCK EMAIL] Para: ${data.email} | Código de verificación: ${code}\n`);
    }

    return { success: true, data: { id: newUser.id, email: newUser.email } };
  }

  static async loginUser(credentials: LoginDTO): Promise<AuthResponse> {
    const user = await AuthRepository.findUserByEmail(credentials.email);
    if (!user || !user.password) {
      return { success: false, error: "Credenciales incorrectas" };
    }

    if (!user.emailVerified) {
      return { success: false, error: "unverified_email" }; // Special string required by frontend
    }

    const isMatch = await bcrypt.compare(credentials.password, user.password);
    if (!isMatch) {
      return { success: false, error: "Credenciales incorrectas" };
    }

    const role = user.role?.name || RoleNames.USER;
    const jwtData = this.createJwt(user, role);

    return { 
      success: true, 
      data: jwtData,
    };
  }

  static async requestOtp(data: OtpEmailDTO): Promise<AuthResponse> {
    const email = data.email.trim().toLowerCase();
    let user = await AuthRepository.findUserByEmail(email);

    if (data.adminOnly) {
      if (!user || (user.role?.name !== RoleNames.ADMIN && user.role?.name !== RoleNames.SUPER_ADMIN)) {
        return {
          success: false,
          error: "Acceso denegado: Este correo no cuenta con permisos de Administrador o Super Administrador.",
        };
      }
    }

    if (!user) {
      const userRole = await AuthRepository.findRoleByName(RoleNames.USER) || await AuthRepository.createRole(RoleNames.USER);
      await AuthRepository.createUser({
        name: email.split("@")[0],
        email,
        password: null,
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
    return { success: true, data: this.createJwt(user, user.role?.name || RoleNames.USER) };
  }

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

  static async requestPasswordReset(data: ForgotPasswordDTO): Promise<AuthResponse> {
    const user = await AuthRepository.findUserByEmail(data.email);
    if (!user) {
      return { success: true };
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await AuthRepository.createPasswordResetCode(data.email, code, new Date(Date.now() + 15 * 60 * 1000));

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await this.getTransporter().sendMail({
        from: '"Synapse CTMA" <no-reply@synapse.edu.co>',
        to: data.email,
        subject: "Recuperación de Contraseña - Synapse",
        html: `<p>Tu código para recuperar la contraseña es: <b>${code}</b></p>`,
      });
    } else {
      console.log(`\n[MOCK EMAIL] Recuperación para: ${data.email} | Código: ${code}\n`);
    }

    return { success: true };
  }

  static async resetPassword(data: ResetPasswordDTO): Promise<AuthResponse> {
    const validReset = await AuthRepository.findValidPasswordResetCode(data.email, data.code);
    if (!validReset) {
      return { success: false, error: "Código inválido o expirado" };
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);
    await AuthRepository.updateUserPassword(data.email, hashedPassword);
    await AuthRepository.deletePasswordResetCodes(data.email);

    return { success: true };
  }

  static async loginAdmin(credentials: LoginAdminDTO): Promise<AuthResponse> {
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

    const role = user.role.name;
    const jwtData = this.createJwt(user, role);

    return { success: true, data: jwtData };
  }
}
