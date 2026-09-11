import { CommentRepository } from "./comment.repository";
import { CreateCommentDTO } from "./comment.types";

export class CommentService {
  static async getCommentsByNoteId(noteId: string) {
    return await CommentRepository.findByContentId(noteId);
  }

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

  static async deleteComment(id: string) {
    return await CommentRepository.delete(id);
  }
}
