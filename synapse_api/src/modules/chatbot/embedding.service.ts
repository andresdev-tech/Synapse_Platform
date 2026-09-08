import OpenAI from "openai";

export class EmbeddingService {
  private readonly qwen: OpenAI;

  constructor() {
    if (!process.env.QWEN_API_KEY) {
      throw new Error(
        "QWEN_API_KEY no está configurada."
      );
    }

    this.qwen = new OpenAI({
      apiKey: process.env.QWEN_API_KEY,
      baseURL:
        process.env.QWEN_BASE_URL ||
        "https://ws-0rdusf4e91zylnjr.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1",
    });
  }

  /**
   * Genera el vector semántico de un texto.
   *
   * Dimensiones:
   * 1536
   */
  async generateEmbedding(
    text: string
  ): Promise<number[]> {
    const response =
      await this.qwen.embeddings.create({
        model: process.env.QWEN_EMBEDDING_MODEL || "text-embedding-v4",
        input: text,
        dimensions: 1024,
      });

    const embedding =
      response.data[0]?.embedding;

    if (!embedding) {
      throw new Error(
        "No se pudo generar el embedding."
      );
    }

    return embedding;
  }
}
