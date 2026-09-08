import { ChatbotProvider } from "./chatbot.provider";
import { ChatbotRepository } from "./chatbot.repository";
import { EmbeddingService } from "./embedding.service";

export interface ChatbotMessage {
  userId: string;
  message: string;
}

export class ChatbotService {
  constructor(
    private readonly embeddingService: EmbeddingService,
    private readonly repository: ChatbotRepository,
    private readonly provider: ChatbotProvider
  ) {}

  /**
   * Procesa una consulta del usuario.
   *
   * No guarda conversaciones.
   *
   * Flujo:
   * 1. Generar embedding de la pregunta.
   * 2. Buscar DocumentChunks similares.
   * 3. Construir contexto.
   * 4. Enviar pregunta + contexto al LLM.
   * 5. Devolver respuesta mediante streaming.
   */
  async *processMessage(
    data: ChatbotMessage
  ): AsyncGenerator<string, void, unknown> {
    const { userId, message } = data;

    /**
     * --------------------------------------------------------
     * 1. Validaciones
     * --------------------------------------------------------
     */

    if (!userId) {
      throw new Error("Usuario no autenticado.");
    }

    if (!message || typeof message !== "string") {
      throw new Error("El mensaje es obligatorio.");
    }

    const normalizedMessage = message.trim();

    if (!normalizedMessage) {
      throw new Error(
        "El mensaje no puede estar vacío."
      );
    }

    /**
     * --------------------------------------------------------
     * 2. Generar embedding de la pregunta
     * --------------------------------------------------------
     */

    const embedding =
      await this.embeddingService.generateEmbedding(
        normalizedMessage
      );

    /**
     * --------------------------------------------------------
     * 3. Buscar chunks relevantes
     * --------------------------------------------------------
     */

    const chunks =
      await this.repository.searchSimilarChunks(
        embedding,
        5
      );

    /**
     * --------------------------------------------------------
     * 4. Construir contexto
     * --------------------------------------------------------
     */

    const context = chunks
      .map((chunk) => {
        return [
          `Título: ${chunk.title ?? "Sin título"}`,
          `Contenido: ${chunk.content}`,
        ].join("\n");
      })
      .join("\n\n---\n\n");

    /**
     * --------------------------------------------------------
     * 5. Consultar el LLM
     * --------------------------------------------------------
     */

    try {
      const stream =
        this.provider.generateResponse({
          message: normalizedMessage,
          context,
        });

      /**
       * ------------------------------------------------------
       * 6. Streaming
       * ------------------------------------------------------
       */

      for await (const chunk of stream) {
        yield chunk;
      }
    } catch (error) {
      console.error(
        "ChatbotService - Error del provider:",
        error
      );

      throw new Error(
        "No fue posible generar la respuesta."
      );
    }
  }
}
