import { CommentRepository } from "./comment.repository";
import { CreateCommentDTO } from "./comment.types";

/**
 * Servicio de lógica de negocio para los comentarios en contenidos y notas.
 */
export class CommentService {
  /**
   * Obtiene todos los comentarios asociados a una nota o contenido.
   */
  static async getCommentsByNoteId(noteId: string) {
    return await CommentRepository.findByContentId(noteId);
  }

  /**
   * Valida la existencia del autor y la nota antes de registrar el nuevo comentario.
   */
  static async createComment(data: CreateCommentDTO, fallbackAuthorId?: string) {
    const authorId = data.authorId || fallbackAuthorId;
    if (!authorId) {
      throw new Error("El autor del comentario es obligatorio");
    }

    const contentId = (data.contentId || data.noteId) as string;
    if (!contentId) {
      throw new Error("El ID de la nota o contenido es obligatorio");
    }

    return await CommentRepository.create({
      content: data.content,
      contentId,
      authorId,
      parentId: data.parentId,
    });
  }

  /**
   * Elimina un comentario de la base de datos por su ID.
   */
  static async deleteComment(id: string) {
    return await CommentRepository.delete(id);
  }
}

