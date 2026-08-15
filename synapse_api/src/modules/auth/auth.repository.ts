import { prisma } from "../../config/prisma";
import { generateUUID } from '../../common/utils/uuidcreate'

export class AuthRepository {
  static findUserByEmail(correo_electronico: string) {
    return prisma.usuarios.findFirst({
      where: {
        correo_electronico: correo_electronico
      },
      select: {
        id: true,
        nombres: true,
        apellidos: true,
        tipo_documento_id: true,
        numero_documento: true,
        correo_electronico: true,
        password_hash: true,
        rol_id: true,
        actualizado_en: true
      }
    });
  }

  static findUserByDocument(tipo_documento: string, numero_documento: string) {
    return prisma.usuarios.findFirst({
      where: {
        tipo_documento_id: tipo_documento,
        numero_documento: numero_documento
      }
    });
  }

  static createUser(nombres: string, apellidos: string, tipo_documento: string, numero_documento: string, correo_electronico: string, fecha_nacimiento: Date, password: string, rol: string) {
    return prisma.usuarios.create({
      data: {
        id: generateUUID(),
        nombres,
        apellidos,
        tipo_documento_id: tipo_documento,
        numero_documento: numero_documento,
        correo_electronico: correo_electronico,
        fecha_nacimiento: new Date(fecha_nacimiento),
        password_hash: password,
        rol_id: rol
      }
    });
  }

  static createSession(sessionInfo: { userId: string; token: string; ipAddress: string; navegadorInfo?: string; expiresAt: Date }) {
    return prisma.sesiones.create({
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

  static updateLastLogin(userId: string) {
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
        password_hash: password
      }
    });
  }
}
