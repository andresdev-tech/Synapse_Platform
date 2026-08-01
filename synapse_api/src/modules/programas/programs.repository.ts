import { prisma } from "../../config/prisma";

export class ProgramasRepository {
  static async findAll() {
    return prisma.programas.findMany({
      orderBy: {
        id: "desc",
      },
    });
  }

  static async findById(id: number) {
    return prisma.programas.findUnique({
      where: { id },
    });
  }

  static async create(data: any) {
    return prisma.programas.create({
      data,
    });
  }

  static async update(
    id: number,
    data: any
  ) {
    return prisma.programas.update({
      where: { id },
      data,
    });
  }

  static async delete(id: number) {
    return prisma.programas.delete({
      where: { id },
    });
  }
}