import { randomUUID } from "node:crypto";
import { prisma } from "../../config/prisma";
import { CreateNoteDTO, UpdateNoteDTO, RagDocumentDTO } from "./note.types";

export interface CreateNoteParams {
  data: CreateNoteDTO;
  slug: string;
  authorId: string;
  chunks?: string[];
  embeddings?: number[][];
}

/**
 * Repositorio de base de datos para la gestión de notas y recursos de estudio (tabla Content).
 * Maneja transacciones complejas para almacenar contenidos junto a sus documentos y fragmentos vectoriales (embeddings RAG).
 */
export class NoteRepository {
  /**
   * Consulta las notas globales públicas, con su autor, categoría y reacciones.
   */
  static async findGlobal(section?: string) {
    const whereClause: any = { isGlobal: true };
    if (section) {
      whereClause.section = section;
    }
    return await prisma.content.findMany({
      where: whereClause,
      include: {
        author: { select: { name: true, role: true } },
        category: { select: { name: true } },
        reactions: { select: { userId: true, sessionId: true, type: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  /**
   * Consulta las notas privadas creadas por un usuario específico.
   */
  static async findPersonal(userId: string) {
    return await prisma.content.findMany({
      where: { authorId: String(userId), isGlobal: false },
      orderBy: { updatedAt: "desc" },
    });
  }

  /**
   * Consulta las notas creadas como sugerencias de los usuarios.
   */
  static async findSuggestions() {
    return await prisma.content.findMany({
      where: { isGlobal: false },
      include: {
        author: { select: { name: true, email: true } },
        category: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  /**
   * Busca una nota por su ID incluyendo información del autor, categoría y reacciones.
   */
  static async findById(id: string) {
    return await prisma.content.findUnique({
      where: { id: String(id) },
      include: {
        author: { select: { name: true, email: true } },
        category: { select: { name: true } },
        reactions: { select: { userId: true, sessionId: true, type: true } },
      },
    });
  }

  /**
   * Crea una nota en una transacción de base de datos.
   * Si incluye documento RAG, guarda el recurso y sus fragmentos vectoriales (embeddings de 1024 dimensiones en pgvector).
   */
  static async createWithTransaction(params: CreateNoteParams) {
    const { data, slug, authorId, chunks = [], embeddings = [] } = params;
    const contentId = randomUUID();

    return await prisma.$transaction(async (transaction) => {
      const createdNote = await transaction.content.create({
        data: {
          id: contentId,
          title: data.title,
          slug,
          body: data.body,
          excerpt: data.excerpt,
          isGlobal: data.isGlobal ?? false,
          authorId,
          seoImage: data.imageUrl,
          seoTitle: data.seoTitle,
          seoDescription: data.seoDescription,
          featured: false,
          publishedAt: data.published ? new Date() : null,
          scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
          categoryId: data.categoryId,
          type: "INFORMATION",
          status: "PUBLISHED",
          visibility: data.isGlobal ? "PUBLIC" : "PRIVATE",
          section: data.section,
          updatedAt: new Date(),
        },
      });

      if (data.ragDocument && chunks.length > 0 && embeddings.length > 0) {
        const ragDoc: RagDocumentDTO = data.ragDocument;
        const resourceId = randomUUID();

        await transaction.resource.create({
          data: {
            id: resourceId,
            name: ragDoc.name.trim().slice(0, 255),
            url: ragDoc.url.trim(),
            type: "DOCUMENT",
            mimeType: typeof ragDoc.mimeType === "string" ? ragDoc.mimeType.slice(0, 255) : null,
            size:
              Number.isFinite(Number(ragDoc.size)) && Number(ragDoc.size) > 0
                ? BigInt(Math.round(Number(ragDoc.size)))
                : null,
            altText: typeof ragDoc.altText === "string" ? ragDoc.altText.trim().slice(0, 255) : null,
            uploadedById: authorId,
            updatedAt: new Date(),
          },
        });

        await transaction.contentResource.create({
          data: {
            contentId,
            resourceId,
            position: 0,
            caption: ragDoc.name.trim().slice(0, 255),
          },
        });

        for (let index = 0; index < chunks.length; index += 1) {
          const vector = `[${embeddings[index].join(",")}]`;
          await transaction.$executeRaw`
            INSERT INTO "DocumentChunk" ("id", "content", "embedding", "chunkIndex", "resourceId", "contentId")
            VALUES (${randomUUID()}::uuid, ${chunks[index]}, ${vector}::vector, ${index}, ${resourceId}::uuid, ${contentId}::uuid)
          `;
        }
      }

      return createdNote;
    }, {
      maxWait: 10000,
      timeout: 60000,
    });
  }

  /**
   * Actualiza los campos modificados de una nota existente.
   */
  static async update(id: string, data: UpdateNoteDTO) {
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.body !== undefined) updateData.body = data.body;
    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
    if (data.isGlobal !== undefined) updateData.isGlobal = data.isGlobal;
    if (data.imageUrl !== undefined) updateData.seoImage = data.imageUrl;
    if (data.seoTitle !== undefined) updateData.seoTitle = data.seoTitle;
    if (data.seoDescription !== undefined) updateData.seoDescription = data.seoDescription;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.section !== undefined) updateData.section = data.section;
    if (data.published !== undefined) {
      updateData.publishedAt = data.published ? new Date() : null;
    }
    if (data.scheduledAt !== undefined) {
      updateData.scheduledAt = data.scheduledAt ? new Date(data.scheduledAt) : null;
    }

    return await prisma.content.update({
      where: { id: String(id) },
      data: updateData,
    });
  }

  /**
   * Elimina una nota de la base de datos por su ID.
   */
  static async delete(id: string) {
    return await prisma.content.delete({
      where: { id: String(id) },
    });
  }

  /**
   * Gestiona la reacción de un usuario sobre una nota (crea nueva, cambia tipo o elimina si ya existía la misma).
   */
  static async toggleReaction(contentId: string, type: "LIKE" | "LOVE" | "USEFUL" | "IMPORTANT" | "DISLIKE", userId?: string, sessionId?: string) {
    const whereClause = userId 
      ? { contentId, userId } 
      : { contentId, sessionId };

    const existing = await prisma.reaction.findFirst({
      where: whereClause,
    });

    if (existing) {
      if (existing.type === type) {
        // Eliminar si es la misma
        await prisma.reaction.delete({ where: { id: existing.id } });
        return { action: "removed", type: null };
      } else {
        // Actualizar si es diferente
        await prisma.reaction.update({
          where: { id: existing.id },
          data: { type },
        });
        return { action: "updated", type };
      }
    } else {
      // Crear nueva
      await prisma.reaction.create({
        data: { 
          contentId, 
          type, 
          ...(userId ? { userId } : { sessionId }) 
        },
      });
      return { action: "created", type };
    }
  }
}

