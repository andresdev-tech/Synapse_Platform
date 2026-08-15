import { prisma } from "../../config/prisma";

export class ChatbotRepository {
  async searchDocuments(question: string) {
    if (!question?.trim()) {
      return [];
    }

    const stopWords = new Set([
      'de', 'el', 'la', 'los', 'las',
      'un', 'una', 'sobre', 'que',
      'necesito', 'informacion',
      'como', 'es', 'en', 'y',
      'a', 'por'
    ]);

    const palabrasClave = question
      .toLowerCase()
      .replace(/[?!.,]/g, '')
      .split(/\s+/) // evita espacios dobles
      .filter(
        palabra =>
          palabra.length > 2 &&
          !stopWords.has(palabra)
      );

    if (palabrasClave.length === 0) {
      return prisma.documentos_rag.findMany({
        where: {
          activo: true,
          contenido: {
            contains: question,
            mode: "insensitive"
          }
        },
        take: 5
      });
    }

    return prisma.documentos_rag.findMany({
      where: {
        activo: true,
        OR: palabrasClave.map(palabra => ({
          contenido: {
            contains: palabra,
            mode: "insensitive"
          }
        }))
      },
      take: 5
    });
  }

  async getAllDatabase() {
    const [programas, usuarios] = await Promise.all([
      prisma.programas.findMany(),
      prisma.usuarios.findMany()
    ]);
    return { programas, usuarios };
  }

async saveHistory(data: {
  usuarioId: string;
  pregunta: string;
  respuesta: string;
}) {
  return prisma.chatbot_historial.create({
    data: {
      usuario_id: data.usuarioId,
      pregunta_usuario: data.pregunta,
      respuesta_bot: data.respuesta
    }
  });
}

  async getHistory(usuarioId: string) {
    return prisma.chatbot_historial.findMany({
      where: {
        usuario_id: usuarioId
      },
      orderBy: {
        creado_en: "asc",
      },
      select: {
        id: true,
        pregunta_usuario: true,
        respuesta_bot: true,
        creado_en: true,
      },
    });
  }
}