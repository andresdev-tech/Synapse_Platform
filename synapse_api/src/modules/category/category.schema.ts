import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, "El nombre de la categoría es obligatorio"),
  description: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  parentId: z.string().uuid("El ID de la categoría padre debe ser un UUID válido").optional().nullable(),
});

export const updateCategorySchema = z.object({
  name: z.string().trim().min(1).optional(),
  description: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  parentId: z.string().uuid("El ID de la categoría padre debe ser un UUID válido").optional().nullable(),
});
