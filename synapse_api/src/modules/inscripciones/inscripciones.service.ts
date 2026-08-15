import { prisma } from "../../config/prisma";
export class InscripcionesService {
  static async getAllInscripciones() {
    const inscripciones = await prisma.inscripcion.findMany({
      include: {
        usuario: {
          select: {
            nombres: true,
            apellidos: true,
          }
        },
        programa: {
          select: {
            nombre: true,
            sector: true
          }
        }
      },
      orderBy: {
        creado_en: 'desc'
      }
    });

    // Mapear los datos para que coincidan con la estructura que espera el frontend (Panel Admin)
    return inscripciones.map(ins => ({
      id: ins.id,
      usuario: `${ins.usuario.nombres} ${ins.usuario.apellidos}`,
      programa: ins.programa.nombre,
      estado: ins.estado,
      fecha_inscripcion: ins.creado_en,
      // Extra properties just in case
      programa_id: ins.programa_id,
      usuario_id: ins.usuario_id,
      observaciones: ins.observaciones
    }));
  }
}
