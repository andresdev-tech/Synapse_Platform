import { prisma } from "../../config/prisma";
import { CreateAllowedDomainDTO, UpdateAllowedDomainDTO, DomainScope } from "./allowed-domain.types";

export class AllowedDomainRepository {
  static async getAll() {
    return await (prisma as any).allowedDomain.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  static async findById(id: string) {
    return await (prisma as any).allowedDomain.findUnique({
      where: { id },
    });
  }

  static async findByDomain(domain: string) {
    return await (prisma as any).allowedDomain.findUnique({
      where: { domain: domain.toLowerCase() },
    });
  }

  static async getActiveByDomain(domain: string) {
    return await (prisma as any).allowedDomain.findFirst({
      where: {
        domain: domain.toLowerCase(),
        isActive: true,
      },
    });
  }

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

  static async delete(id: string) {
    return await (prisma as any).allowedDomain.delete({
      where: { id },
    });
  }

  static async count() {
    return await (prisma as any).allowedDomain.count();
  }
}
