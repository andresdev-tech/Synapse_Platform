import { prisma } from "../../config/prisma";

export interface CreateSessionDTO {
  sessionToken: string;
  userId: string;
  expires: Date;
}

/**
 * Repositorio para la gestión de sesiones de usuario en base de datos.
 * Maneja la creación, búsqueda y eliminación de tokens de sesión activos.
 */
export class SessionRepository {
  /**
   * Registra una nueva sesión con su token único, ID de usuario y fecha de expiración.
   */
  static async createSession(data: CreateSessionDTO) {
    return await prisma.session.create({
      data: {
        sessionToken: data.sessionToken,
        userId: data.userId,
        expires: data.expires,
      },
    });
  }

  /**
   * Busca los datos de una sesión activa por su token, trayendo la información básica del usuario.
   */
  static async findSessionByToken(sessionToken: string) {
    return await prisma.session.findUnique({
      where: { sessionToken },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            status: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * Elimina una sesión específica de la base de datos a partir de su token (cierre de sesión).
   */
  static async deleteSession(sessionToken: string) {
    return await prisma.session.delete({
      where: { sessionToken },
    });
  }

  /**
   * Elimina todas las sesiones activas asociadas a un usuario en particular.
   */
  static async deleteUserSessions(userId: string) {
    return await prisma.session.deleteMany({
      where: { userId },
    });
  }
}

