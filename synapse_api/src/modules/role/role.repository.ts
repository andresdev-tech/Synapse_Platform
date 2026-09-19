import { prisma } from "../../config/prisma";
import { RoleName } from "../../../generated/prisma/client";

/**
 * Repositorio de base de datos para la gestión de roles.
 * Maneja la lectura, creación y actualización de roles en la tabla Role.
 */
export class RoleRepository {
  /**
   * Obtiene todos los roles registrados en la base de datos ordenados por fecha de creación.
   */
  static async getAllRoles() {
    return await prisma.role.findMany({
      orderBy: { createdAt: "asc" },
    });
  }

  /**
   * Busca un rol en la base de datos por su nombre (ej: ADMIN, USER).
   */
  static async findRoleByName(name: RoleName) {
    return await prisma.role.findUnique({
      where: { name },
    });
  }

  /**
   * Inserta un nuevo rol en la base de datos.
   */
  static async createRole(data: { name: RoleName; description?: string }) {
    return await prisma.role.create({
      data: {
        name: data.name,
        description: data.description || null,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Crea un rol si no existe o actualiza su descripción si ya está registrado en la base de datos.
   */
  static async upsertRole(data: { name: RoleName; description?: string }) {
    return await prisma.role.upsert({
      where: { name: data.name },
      update: { description: data.description || undefined, updatedAt: new Date() },
      create: {
        name: data.name,
        description: data.description || null,
        updatedAt: new Date(),
      },
    });
  }
}

