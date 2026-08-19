import { prisma } from "../../config/prisma";
import { generateUUID } from '../../common/utils/uuidcreate'

export class ProgramasRepository {
  static async findAll() {
    return prisma.programas.findMany({
      orderBy: {
        id: "desc",
      },
    });
  }

  static async findById(id: string) {
    return prisma.programas.findUnique({
      where: { id },
    });
  }

  static async create(data: any) {
    return prisma.programas.create({
      data: {
        id: data.id,
        nombre: data.nombre,
        slug: data.slug,
        sector: data.sector,
        estado: data.estado,
        imagen_url: null,
        descripcion: data.descripcion,
        programas_horarios: {
          create: data.horarios.map((horario: any) => ({
            id: generateUUID(),
            modalidad: horario.modalidad,
            jornada: horario.jornada,
            horarios_json: horario.horarios
          }))
        }
      },
    });
  }

  static async update(
    id: string,
    data: any
  ) {
    return prisma.programas.update({
      where: { id },
      data: {
        ...data,
        programas_horarios: {
          deleteMany: {},
          create: data.programas_horarios
        }
      },
    });
  }

  static async delete(id: string) {
    return prisma.programas.delete({
      where: { id },
    });
  }
}