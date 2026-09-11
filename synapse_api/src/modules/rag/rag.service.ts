import { RagRepository } from "./rag.repository";
import { CreateRagResourceDTO } from "./rag.types";
import { EmbeddingService } from "../chatbot/embedding.service";

export class RagService {
  private static embeddingService = new EmbeddingService();
  private static CHUNK_SIZE = 1200;

  static splitIntoChunks(text: string): string[] {
    const normalizedText = text.trim().replace(/\s+/g, " ");
    const chunks: string[] = [];

    for (let index = 0; index < normalizedText.length; index += this.CHUNK_SIZE) {
      const chunk = normalizedText.slice(index, index + this.CHUNK_SIZE).trim();
      if (chunk) chunks.push(chunk);
    }

    return chunks;
  }

  static async getAllResources() {
    return await RagRepository.findAll();
  }

  static async createResource(data: CreateRagResourceDTO, userId: string) {
    const chunks = this.splitIntoChunks(data.content);
    const embeddings = await Promise.all(
      chunks.map((chunk) => this.embeddingService.generateEmbedding(chunk))
    );

    if (embeddings.some((embedding) => embedding.length !== 1024)) {
      throw new Error("El modelo de embeddings no devolvió vectores de 1024 dimensiones.");
    }

    return await RagRepository.createWithChunks({
      data,
      userId,
      chunks,
      embeddings,
    });
  }

  static async deleteResource(id: string) {
    return await RagRepository.delete(id);
  }
}
