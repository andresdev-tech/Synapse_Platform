import { prisma } from "../../config/prisma";
import { CreateAllowedDomainDTO, UpdateAllowedDomainDTO, DomainScope } from "./allowed-domain.types";

/**
 * Repositorio de acceso a datos para los dominios autorizados.
 * Realiza las operaciones directas de lectura, creación, edición y eliminación en la base de datos con Prisma.
 */
export class AllowedDomainRepository {
  /**
   * Obtiene todos los dominios registrados ordenados de más reciente a más antiguo.
   */
  static async getAll() {
    return await (prisma as any).allowedDomain.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Busca un dominio por su identificador único (ID).
   */
  static async findById(id: string) {
    return await (prisma as any).allowedDomain.findUnique({
      where: { id },
    });
  }

  /**
   * Busca un dominio por su nombre textual (ej: sena.edu.co).
   */
  static async findByDomain(domain: string) {
    return await (prisma as any).allowedDomain.findUnique({
      where: { domain: domain.toLowerCase() },
    });
  }

  /**
   * Busca un dominio específico solo si se encuentra en estado activo.
   */
  static async getActiveByDomain(domain: string) {
    return await (prisma as any).allowedDomain.findFirst({
      where: {
        domain: domain.toLowerCase(),
        isActive: true,
      },
    });
  }

  /**
   * Guarda un nuevo dominio autorizado en la base de datos.
   */
  static async create(data: CreateAllowedDomainDTO) {
    return await (prisma as any).allowedDomain.create({
      data: {
        domain: data.domain.toLowerCase().trim(),
        scope: data.scope || "USER",
        description: data.description || null,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });
  }

  /**
   * Modifica los datos de un dominio autorizado existente.
   */
  static async update(id: string, data: UpdateAllowedDomainDTO) {
    return await (prisma as any).allowedDomain.update({
      where: { id },
      data: {
        ...(data.scope ? { scope: data.scope } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Elimina un dominio autorizado de la base de datos.
   */
  static async delete(id: string) {
    return await (prisma as any).allowedDomain.delete({
      where: { id },
    });
  }

  /**
   * Cuenta la cantidad total de dominios registrados en el sistema.
   */
  static async count() {
    return await (prisma as any).allowedDomain.count();
  }
}

