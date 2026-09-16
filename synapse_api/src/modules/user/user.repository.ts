import { prisma } from "../../config/prisma";

export class UserRepository {
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

  static async findLayoutById(userId: string) {
    return await prisma.user.findUnique({
      where: { id: String(userId) },
      select: { layoutPrefs: true },
    });
  }

  static async updateLayout(userId: string, layoutPrefs: any) {
    return await prisma.user.update({
      where: { id: String(userId) },
      data: {
        layoutPrefs: typeof layoutPrefs === "string" ? layoutPrefs : JSON.stringify(layoutPrefs),
      },
    });
  }
}
