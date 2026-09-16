import { z } from "zod";

export const createRagResourceSchema = z.object({
  name: z.string().trim().min(1, "El nombre del documento es obligatorio"),
  url: z.string().trim().min(1, "La URL del documento es obligatoria"),
  content: z.string().trim().min(1, "El contenido del documento es obligatorio"),
  mimeType: z.string().optional().nullable(),
  size: z.union([z.number(), z.string()]).optional().nullable(),
  altText: z.string().optional().nullable(),
});
