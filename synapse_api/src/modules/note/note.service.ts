import { NoteRepository } from "./note.repository";
import { CreateNoteDTO, UpdateNoteDTO } from "./note.types";
import { ProviderFactory } from "../chatbot/providers/provider.factory";

/**
 * Servicio de lógica de negocio para la gestión de notas de estudio e indexación RAG con IA.
 */
export class NoteService {
  private static provider = ProviderFactory.getProvider();
  private static CHUNK_SIZE = 1200;

  /**
   * Genera una URL amigable (slug) única agregando un sufijo aleatorio.
   */
  static generateSlug(title: string): string {
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    return title
      .toLowerCase()
      .trim()
      .replace(/ /g, "-")
      .replace(/[^\w-]/g, "") + "-" + randomSuffix;
  }

  /**
   * Divide el texto de un documento en bloques (*chunks*) de tamaño uniforme para su posterior vectorización.
   */
  static splitIntoChunks(text: string): string[] {
    const normalizedText = text.trim().replace(/\s+/g, " ");
    const chunks: string[] = [];

    for (let index = 0; index < normalizedText.length; index += this.CHUNK_SIZE) {
      const chunk = normalizedText.slice(index, index + this.CHUNK_SIZE).trim();
      if (chunk) chunks.push(chunk);
    }

    return chunks;
  }

  /**
   * Obtiene todas las notas globales públicas (opcionalmente filtradas por sección).
   */
  static async getGlobalNotes(section?: string) {
    return await NoteRepository.findGlobal(section);
  }

  /**
   * Obtiene las notas personales creadas por un usuario.
   */
  static async getPersonalNotes(userId: string) {
    return await NoteRepository.findPersonal(userId);
  }

  /**
   * Obtiene las notas sugeridas por los usuarios.
   */
  static async getSuggestions() {
    return await NoteRepository.findSuggestions();
  }

  /**
   * Obtiene los datos detallados de una nota por su ID.
   */
  static async getNoteById(id: string) {
    return await NoteRepository.findById(id);
  }

  /**
   * Crea una nueva nota. Si tiene un documento adjunto para RAG, lo divide en fragmentos, genera sus embeddings vectoriales y lo guarda en base de datos.
   */
  static async createNote(data: CreateNoteDTO, fallbackAuthorId?: string) {
    const authorId = data.authorId || fallbackAuthorId;
    if (!authorId) {
      throw new Error("El autor de la nota es obligatorio");
    }

    console.log('section its: ', data.section || null);

    const slug = this.generateSlug(data.title);
    const hasRag = Boolean(
      data.ragDocument?.name?.trim() &&
      data.ragDocument?.url?.trim() &&
      data.ragDocument?.content?.trim()
    );

    let chunks: string[] = [];
    let embeddings: number[][] = [];

      if (hasRag && data.ragDocument) {
      chunks = this.splitIntoChunks(data.ragDocument.content);
      embeddings = [];
      
      // Procesar secuencialmente para evitar Rate Limits (429 Too Many Requests) de la API de IA
      for (const chunk of chunks) {
        const embedding = await this.provider.generateEmbedding!(chunk);
        embeddings.push(embedding);
      }

      if (embeddings.some((embedding) => embedding.length !== 1024)) {
        throw new Error("El modelo de embeddings no devolvió vectores de 1024 dimensiones.");
      }
    }

    return await NoteRepository.createWithTransaction({
      data,
      slug,
      authorId,
      chunks,
      embeddings,
    });
  }

  /**
   * Actualiza el contenido o metadatos de una nota de estudio.
   */
  static async updateNote(id: string, data: UpdateNoteDTO) {
    return await NoteRepository.update(id, data);
  }

  /**
   * Elimina una nota por su ID.
   */
  static async deleteNote(id: string) {
    return await NoteRepository.delete(id);
  }

  /**
   * Registra o alterna la reacción de un usuario en una nota.
   */
  static async toggleReaction(id: string, type: "LIKE" | "LOVE" | "USEFUL" | "IMPORTANT" | "DISLIKE", userId?: string, sessionId?: string) {
    return await NoteRepository.toggleReaction(id, type, userId, sessionId);
  }
}

