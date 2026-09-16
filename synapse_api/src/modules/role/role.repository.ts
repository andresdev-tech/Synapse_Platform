import { prisma } from "../../config/prisma";
import { RoleName } from "../../../generated/prisma/client";

export class RoleRepository {
  static async getAllRoles() {
    return await prisma.role.findMany({
      orderBy: { createdAt: "asc" },
    });
  }

  static async findRoleByName(name: RoleName) {
    return await prisma.role.findUnique({
      where: { name },
    });
  }

  static async createRole(data: { name: RoleName; description?: string }) {
    return await prisma.role.create({
      data: {
        name: data.name,
        description: data.description || null,
        updatedAt: new Date(),
      },
    });
  }

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
