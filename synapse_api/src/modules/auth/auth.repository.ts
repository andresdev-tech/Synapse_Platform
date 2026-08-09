import { prisma } from "../../config/prisma";

export class AuthRepository {
  static findUserByEmail(correo_electronico: string) {
    return prisma.usuarios.findFirst({
      where: {
        correo_electronico: correo_electronico
      }
    });
  }

  static findUserByDocument(tipo_documento: number, numero_documento: string) {
    return prisma.usuarios.findFirst({
      where: {
        tipo_documento_id: tipo_documento,
        numero_documento: numero_documento
      }
    });
  }

  static createUser(nombres: string, apellidos: string, tipo_documento: number, numero_documento: string, correo_electronico: string, fecha_nacimiento: Date, password: string, rol: number) {
    return prisma.usuarios.create({
      data: {
        nombres,
        apellidos,
        tipo_documento_id: tipo_documento,
        numero_documento: numero_documento,
        correo_electronico: correo_electronico,
        fecha_nacimiento: new Date(fecha_nacimiento),
        contrasena_hash: password,
        rol_id: rol
      }
    });
  }

  static createSession(sessionInfo: { userId: number; token: string; ipAddress: string; navegadorInfo?: string; expiresAt: Date }) {
    return prisma.sesion.create({
      data: {
        usuario_id: sessionInfo.userId,
        token_sesion: sessionInfo.token,
        ip_direccion: sessionInfo.ipAddress,
        navegador_info: sessionInfo.navegadorInfo || null,
        activa: true,
        creado_en: new Date(),
        ultima_actividad: new Date(),
        expira_en: new Date(sessionInfo.expiresAt.toISOString())
      }
    });
  }

  static updateLastLogin(userId: number) {
    return prisma.usuarios.update({
      where: {
        id: userId
      },
      data: {
        ultimo_login: new Date()
      }
    });
  }

  static udapteCodigoAndExpiresAt(correo_electronico: string, codigo: string, expiresAt: Date) {
    return prisma.usuarios.update({
      where: {
        correo_electronico: correo_electronico
      },
      data: {
        codigo_2fa: codigo,
        expiracion_2fa: new Date(expiresAt.toISOString())
      }
    });
  }

  static findUserByCodigo(correo_electronico: string, codigo: string) {
    return prisma.usuarios.findMany({
      where: {
        correo_electronico: correo_electronico,
        codigo_2fa: codigo
      }
    });
  }

  static updateUserPassword(correo_electronico: string, codigo: string, password: string) {
    return prisma.usuarios.update({
      where: {
        correo_electronico: correo_electronico,
        codigo_2fa: codigo
      },
      data: {
        codigo_2fa: null,
        expiracion_2fa: null,
        contrasena_hash: password
      }
    });
  }
}
