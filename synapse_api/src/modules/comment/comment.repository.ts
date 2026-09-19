import { prisma } from "../../config/prisma";

/**
 * Repositorio de base de datos para los comentarios.
 * Gestiona la inserción, consulta y eliminación de comentarios en la tabla Comment de PostgreSQL.
 */
export class CommentRepository {
  /**
   * Obtiene todos los comentarios no eliminados asociados a un contenido/nota con los datos del autor.
   */
  static async findByContentId(contentId: string) {
    return await prisma.comment.findMany({
      where: {
        contentId: String(contentId),
        deleted: false,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  /**
   * Busca un comentario específico por su ID.
   */
  static async findById(id: string) {
    return await prisma.comment.findUnique({
      where: { id: String(id) },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });
  }

  /**
   * Inserta un nuevo comentario en la base de datos asociado a una nota y autor.
   */
  static async create(data: { content: string; contentId: string; authorId: string; parentId?: string | null }) {
    return await prisma.comment.create({
      data: {
        content: data.content,
        contentId: data.contentId,
        authorId: data.authorId,
        parentId: data.parentId ?? undefined,
        updatedAt: new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });
  }

  /**
   * Elimina un comentario de la base de datos por su ID.
   */
  static async delete(id: string) {
    return await prisma.comment.delete({
      where: { id: String(id) },
    });
  }
}

