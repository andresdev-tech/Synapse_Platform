import { z } from "zod";
import { createRagResourceSchema } from "./rag.schema";

export type CreateRagResourceDTO = z.infer<typeof createRagResourceSchema>;

export interface RagResourceItem {
  id: string;
  name: string;
  url: string;
  type: string;
  mimeType: string | null;
  size: number | null;
  altText: string | null;
  uploadedById: string | null;
  createdAt: Date;
  updatedAt: Date;
  chunks: number;
  indexed: boolean;
}
