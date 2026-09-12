import { NoteRepository } from "./note.repository";
import { CreateNoteDTO, UpdateNoteDTO } from "./note.types";
import { EmbeddingService } from "../chatbot/embedding.service";

export class NoteService {
  private static embeddingService = new EmbeddingService();
  private static CHUNK_SIZE = 1200;

  static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/ /g, "-")
      .replace(/[^\w-]/g, "");
  }

  static splitIntoChunks(text: string): string[] {
    const normalizedText = text.trim().replace(/\s+/g, " ");
    const chunks: string[] = [];

    for (let index = 0; index < normalizedText.length; index += this.CHUNK_SIZE) {
      const chunk = normalizedText.slice(index, index + this.CHUNK_SIZE).trim();
      if (chunk) chunks.push(chunk);
    }

    return chunks;
  }

  static async getGlobalNotes() {
    return await NoteRepository.findGlobal();
  }

  static async getPersonalNotes(userId: string) {
    return await NoteRepository.findPersonal(userId);
  }

  static async getSuggestions() {
    return await NoteRepository.findSuggestions();
  }

  static async getNoteById(id: string) {
    return await NoteRepository.findById(id);
  }

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
      embeddings = await Promise.all(
        chunks.map((chunk) => this.embeddingService.generateEmbedding(chunk))
      );

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

  static async updateNote(id: string, data: UpdateNoteDTO) {
    return await NoteRepository.update(id, data);
  }

  static async deleteNote(id: string) {
    return await NoteRepository.delete(id);
  }
}
