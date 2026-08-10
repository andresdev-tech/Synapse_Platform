import { prisma } from "../../config/prisma";

export class ProgramasRepository {
  static async findAll() {
    return prisma.programa.findMany({
      orderBy: {
        id: "desc",
      },
    });
  }

  static async findById(id: number) {
    return prisma.programa.findUnique({
      where: { id },
    });
  }

  static async create(data: any) {
    return prisma.programa.create({
      data,
    });
  }

  static async update(
    id: number,
    data: any
  ) {
    return prisma.programa.update({
      where: { id },
      data,
    });
  }

  static async delete(id: number) {
    return prisma.programa.delete({
      where: { id },
    });
  }
}