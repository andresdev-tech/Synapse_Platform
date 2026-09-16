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

export class NoteRepository {
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
        reactions: { select: { userId: true, type: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async findPersonal(userId: string) {
    return await prisma.content.findMany({
      where: { authorId: String(userId), isGlobal: false },
      orderBy: { createdAt: "desc" },
    });
  }

  static async findSuggestions() {
    return await prisma.content.findMany({
      where: { isGlobal: false },
      include: {
        author: { select: { name: true, email: true } },
        category: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async findById(id: string) {
    return await prisma.content.findUnique({
      where: { id: String(id) },
      include: {
        author: { select: { name: true, email: true } },
        category: { select: { name: true } },
        reactions: { select: { userId: true, type: true } },
      },
    });
  }

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

    return await prisma.content.update({
      where: { id: String(id) },
      data: updateData,
    });
  }

  static async delete(id: string) {
    return await prisma.content.delete({
      where: { id: String(id) },
    });
  }

  static async toggleReaction(contentId: string, userId: string, type: "LIKE" | "LOVE" | "USEFUL" | "IMPORTANT") {
    const existing = await prisma.reaction.findFirst({
      where: { contentId, userId },
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
        data: { contentId, userId, type },
      });
      return { action: "created", type };
    }
  }
}
