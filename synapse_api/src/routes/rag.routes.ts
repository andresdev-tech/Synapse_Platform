import { Router, Response } from "express";
import { randomUUID } from "node:crypto";
import { prisma } from "../config/prisma";
import { AuthRequest, requireSuperAdmin, verifyToken } from "../middleware/auth.middleware";
import { EmbeddingService } from "../modules/chatbot/embedding.service";

const router = Router();
const embeddingService = new EmbeddingService();
const CHUNK_SIZE = 1200;

const splitIntoChunks = (text: string) => {
  const normalizedText = text.trim().replace(/\s+/g, " ");
  const chunks: string[] = [];

  for (let index = 0; index < normalizedText.length; index += CHUNK_SIZE) {
    const chunk = normalizedText.slice(index, index + CHUNK_SIZE).trim();
    if (chunk) chunks.push(chunk);
  }

  return chunks;
};

router.use(verifyToken, requireSuperAdmin);

router.get("/resources", async (_req: AuthRequest, res: Response) => {
  try {
    const resources = await prisma.resource.findMany({
      where: { type: "DOCUMENT" },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { DocumentChunk: true } } },
    });

    res.json(resources.map((resource) => ({
      ...resource,
      size: resource.size ? Number(resource.size) : null,
      chunks: resource._count.DocumentChunk,
      indexed: resource._count.DocumentChunk > 0,
      _count: undefined,
    })));
  } catch (error) {
    console.error("Error obteniendo recursos RAG", error);
    res.status(500).json({ error: "No se pudo cargar el catálogo documental." });
  }
});

router.post("/resources", async (req: AuthRequest, res: Response) => {
  const { name, url, mimeType, size, altText, content } = req.body ?? {};

  if (!req.user?.id || !name?.trim() || !url?.trim() || !content?.trim()) {
    res.status(400).json({ error: "El nombre, la URL y el contenido del documento son obligatorios." });
    return;
  }

  try {
    const chunks = splitIntoChunks(content);
    const embeddings = await Promise.all(chunks.map((chunk) => embeddingService.generateEmbedding(chunk)));

    if (embeddings.some((embedding) => embedding.length !== 1024)) {
      throw new Error("El modelo de embeddings no devolvió vectores de 1024 dimensiones.");
    }

    const resourceId = randomUUID();
    const resource = await prisma.$transaction(async (transaction) => {
      const createdResource = await transaction.resource.create({
        data: {
          id: resourceId,
          name: name.trim().slice(0, 255),
          url: url.trim(),
          type: "DOCUMENT",
          mimeType: typeof mimeType === "string" ? mimeType.slice(0, 255) : null,
          size: Number.isFinite(Number(size)) && Number(size) > 0 ? BigInt(Math.round(Number(size))) : null,
          altText: typeof altText === "string" ? altText.trim().slice(0, 255) : null,
          uploadedById: req.user.id,
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

      return createdResource;
    });

    res.status(201).json({ ...resource, size: resource.size ? Number(resource.size) : null, chunks: chunks.length, indexed: true });
  } catch (error) {
    console.error("Error guardando recurso RAG", error);
    res.status(500).json({ error: error instanceof Error ? error.message : "No se pudo guardar el documento." });
  }
});

router.delete("/resources/:id", async (req: AuthRequest, res: Response) => {
  try {
    await prisma.resource.delete({ where: { id: String(req.params.id) } });
    res.status(204).send();
  } catch (error) {
    console.error("Error eliminando recurso RAG", error);
    res.status(404).json({ error: "El documento no existe o ya fue eliminado." });
  }
});

export default router;