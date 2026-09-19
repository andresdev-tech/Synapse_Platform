import { prisma } from "../../config/prisma";

/**
 * Repositorio de base de datos para la gestión de usuarios.
 * Realiza consultas y actualizaciones sobre la tabla User en PostgreSQL.
 */
export class UserRepository {
  /**
   * Obtiene todos los usuarios con su información básica y rol asociado.
   */
  static async findAll() {
    return await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
  }

  /**
   * Consulta las preferencias de diseño y personalización de interfaz guardadas para un usuario.
   */
  static async findLayoutById(userId: string) {
    return await prisma.user.findUnique({
      where: { id: String(userId) },
      select: { layoutPrefs: true },
    });
  }

  /**
   * Actualiza el campo de preferencias de interfaz de un usuario en la base de datos.
   */
  static async updateLayout(userId: string, layoutPrefs: any) {
    return await prisma.user.update({
      where: { id: String(userId) },
      data: {
        layoutPrefs: typeof layoutPrefs === "string" ? layoutPrefs : JSON.stringify(layoutPrefs),
      },
    });
  }
}

