import { randomUUID } from "node:crypto";
import { prisma } from "../../config/prisma";
import { CreateRagResourceDTO } from "./rag.types";

export interface CreateRagResourceParams {
  data: CreateRagResourceDTO;
  userId: string;
  chunks: string[];
  embeddings: number[][];
}

/**
 * Repositorio de base de datos para los documentos RAG y sus fragmentos vectoriales.
 * Guarda recursos en la tabla Resource y vectores en la tabla DocumentChunk usando la extensión pgvector de PostgreSQL.
 */
export class RagRepository {
  /**
   * Obtiene todos los documentos registrados con el conteo de fragmentos vectoriales asociados.
   */
  static async findAll() {
    const resources = await prisma.resource.findMany({
      where: { type: "DOCUMENT" },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { documentChunks: true } } },
    });

    return resources.map((resource) => ({
      ...resource,
      size: resource.size ? Number(resource.size) : null,
      chunks: resource._count.documentChunks,
      indexed: resource._count.documentChunks > 0,
      _count: undefined,
    }));
  }

  /**
   * Busca un recurso documental por su ID.
   */
  static async findById(id: string) {
    return await prisma.resource.findUnique({
      where: { id: String(id) },
    });
  }

  /**
   * Guarda el documento en la tabla Resource e inserta cada fragmento con su vector en DocumentChunk dentro de una transacción.
   */
  static async createWithChunks(params: CreateRagResourceParams) {
    const { data, userId, chunks, embeddings } = params;
    const resourceId = randomUUID();

    return await prisma.$transaction(async (transaction) => {
      const createdResource = await transaction.resource.create({
        data: {
          id: resourceId,
          name: data.name.trim().slice(0, 255),
          url: data.url.trim(),
          type: "DOCUMENT",
          mimeType: typeof data.mimeType === "string" ? data.mimeType.slice(0, 255) : null,
          size:
            Number.isFinite(Number(data.size)) && Number(data.size) > 0
              ? BigInt(Math.round(Number(data.size)))
              : null,
          altText: typeof data.altText === "string" ? data.altText.trim().slice(0, 255) : null,
          uploadedById: userId,
          updatedAt: new Date(),
        },
      });

      for (let index = 0; index < chunks.length; index += 1) {
        const vector = `[${embeddings[index].join(",")}]`;
        await transaction.$executeRaw`
          INSERT INTO "DocumentChunk" ("id", "content", "embedding", "chunkIndex", "resourceId")
          VALUES (${randomUUID()}::uuid, ${chunks[index]}, ${vector}::vector, ${index}, ${resourceId}::uuid)
        `;
      }

      return {
        ...createdResource,
        size: createdResource.size ? Number(createdResource.size) : null,
        chunks: chunks.length,
        indexed: true,
      };
    });
  }

  /**
   * Elimina un recurso documental y sus fragmentos asociados de la base de datos.
   */
  static async delete(id: string) {
    return await prisma.resource.delete({
      where: { id: String(id) },
    });
  }
}

