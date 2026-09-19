import { RagRepository } from "./rag.repository";
import { CreateRagResourceDTO } from "./rag.types";
import { ProviderFactory } from "../chatbot/providers/provider.factory";

/**
 * Servicio de lógica de negocio para la gestión de documentos RAG y generación de embeddings con IA.
 */
export class RagService {
  private static provider = ProviderFactory.getProvider();
  private static CHUNK_SIZE = 1200;

  /**
   * Divide el texto del documento en bloques (*chunks*) de longitud fija para indexación.
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
   * Retorna la lista de todos los recursos documentales indexados en el sistema.
   */
  static async getAllResources() {
    return await RagRepository.findAll();
  }

  /**
   * Procesa un nuevo documento: lo divide en fragmentos, genera sus embeddings vectoriales de 1024 dimensiones con IA y lo guarda.
   */
  static async createResource(data: CreateRagResourceDTO, userId: string) {
    const chunks = this.splitIntoChunks(data.content);
    const embeddings = await Promise.all(
      chunks.map((chunk) => this.provider.generateEmbedding!(chunk))
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

  /**
   * Elimina un recurso RAG de la base de datos por su ID.
   */
  static async deleteResource(id: string) {
    return await RagRepository.delete(id);
  }
}

