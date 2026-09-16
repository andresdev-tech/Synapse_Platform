import { z } from "zod";

export const ragDocumentSchema = z.object({
  name: z.string().trim().min(1, "El nombre del documento es obligatorio"),
  url: z.string().trim().min(1, "La URL del documento es obligatoria"),
  content: z.string().trim().min(1, "El contenido del documento es obligatorio"),
  mimeType: z.string().optional().nullable(),
  size: z.union([z.number(), z.string()]).optional().nullable(),
  altText: z.string().optional().nullable(),
});

export const createNoteSchema = z.object({
  title: z.string().trim().min(1, "El título es obligatorio"),
  body: z.string().trim().min(1, "El contenido es obligatorio"),
  excerpt: z.string().optional().nullable(),
  isGlobal: z.boolean().optional().default(false),
  authorId: z.string().uuid("El ID de autor debe ser un UUID válido").optional(),
  imageUrl: z.string().optional().nullable(),
  published: z.boolean().optional(),
  categoryId: z.string().uuid("El ID de categoría debe ser un UUID válido").optional().nullable(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  section: z.string().trim().optional().nullable(),
  ragDocument: ragDocumentSchema.optional().nullable(),
});

export const updateNoteSchema = z.object({
  title: z.string().trim().min(1).optional(),
  body: z.string().trim().min(1).optional(),
  excerpt: z.string().optional().nullable(),
  isGlobal: z.boolean().optional(),
  imageUrl: z.string().optional().nullable(),
  published: z.boolean().optional(),
  categoryId: z.string().uuid("El ID de categoría debe ser un UUID válido").optional().nullable(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  section: z.string().trim().optional().nullable(),
});
