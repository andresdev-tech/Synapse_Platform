import { AuthRepository } from "./auth.repository";
import { RegisterDTO, LoginDTO, ForgotPasswordDTO, ResetPasswordDTO, AuthResponse } from "./auth.types";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

export class AuthService {
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

    let userRole = await AuthRepository.findRoleByName("Usuario");
    if (!userRole) {
      userRole = await AuthRepository.createRole("Usuario");
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

  static async loginUser(data: LoginDTO): Promise<AuthResponse> {
    const user = await AuthRepository.findUserByEmail(data.email);
    if (!user || !user.password) {
      return { success: false, error: "Credenciales incorrectas" };
    }

    if (!user.emailVerified) {
      return { success: false, error: "unverified_email" }; // Special string required by frontend
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      return { success: false, error: "Credenciales incorrectas" };
    }

    const secret = process.env.JWT_SECRET || "default_dev_secret_for_synapse";
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role?.name || "Usuario" }, 
      secret, 
      { expiresIn: "24h" }
    );

    return { 
      success: true, 
      data: { 
        token, 
        user: { id: user.id, name: user.name, email: user.email, role: user.role?.name || "Usuario", layoutPrefs: user.layoutPrefs } 
      } 
    };
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
}
