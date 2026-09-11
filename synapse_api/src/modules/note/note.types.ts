import { z } from "zod";
import { createNoteSchema, updateNoteSchema, ragDocumentSchema } from "./note.schema";

export type CreateNoteDTO = z.infer<typeof createNoteSchema>;
export type UpdateNoteDTO = z.infer<typeof updateNoteSchema>;
export type RagDocumentDTO = z.infer<typeof ragDocumentSchema>;

export interface NoteResponse {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  type: string;
  status: string;
  visibility: string;
  featured: boolean;
  isGlobal: boolean;
  authorId: string;
  categoryId: string | null;
  publishedAt: Date | null;
  viewCount: number;
  seoTitle: string | null;
  seoDescription: string | null;
  seoImage: string | null;
  createdAt: Date;
  updatedAt: Date;
  User?: {
    name: string | null;
    email?: string;
    role?: any;
  };
  Category?: {
    name: string;
  } | null;
}
