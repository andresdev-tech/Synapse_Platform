import { z } from "zod";

export const createCommentSchema = z.object({
  content: z.string().trim().min(1, "El contenido del comentario es obligatorio"),
  noteId: z.string().uuid("El ID de la nota debe ser un UUID válido").optional(),
  contentId: z.string().uuid("El ID del contenido debe ser un UUID válido").optional(),
  authorId: z.string().uuid("El ID del autor debe ser un UUID válido").optional(),
  parentId: z.string().uuid("El ID del comentario padre debe ser un UUID válido").optional().nullable(),
}).refine((data) => Boolean(data.noteId || data.contentId), {
  message: "Se debe proporcionar noteId o contentId",
  path: ["contentId"],
});
