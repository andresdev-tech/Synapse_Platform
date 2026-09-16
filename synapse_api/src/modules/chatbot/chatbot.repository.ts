import { prisma } from './../../config/prisma';

export interface ChatbotChunk {
  id: string;
  content: string;
  chunkIndex: number;
  contentId: string | null;
  resourceId: string;
  title: string | null;
  similarity: number;
}

export class ChatbotRepository {
  constructor(
    private readonly Prisma: typeof prisma
  ) {}

  /**
   * Busca los DocumentChunk más similares
   * utilizando pgvector.
   */
  async searchSimilarChunks(
    embedding: number[],
    limit = 5
  ): Promise<ChatbotChunk[]> {
    if (!embedding.length) {
      throw new Error(
        "El embedding no puede estar vacío."
      );
    }

    /**
     * Convertimos el vector a la representación
     * esperada por PostgreSQL:
     *
     * [0.123,0.456,...]
     */
    const vector = `[${embedding.join(",")}]`;

    const chunks =
      await this.Prisma.$queryRaw<ChatbotChunk[]>`
        SELECT
          dc.id,
          dc.content,
          dc."chunkIndex",
          dc."contentId",
          dc."resourceId",
          c.title,
          1 - (dc.embedding <=> ${vector}::vector) AS similarity
        FROM "DocumentChunk" dc
        LEFT JOIN "Content" c
          ON c.id = dc."contentId"
        WHERE
          c.status = 'PUBLISHED'
          OR dc."contentId" IS NULL
        ORDER BY
          dc.embedding <=> ${vector}::vector
        LIMIT ${limit}
      `;

    return chunks;
  }
}
