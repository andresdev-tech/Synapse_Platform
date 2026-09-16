import { z } from "zod";
import { extractImageQuerySchema } from "./extract.schema";

export type ExtractImageQueryDTO = z.infer<typeof extractImageQuerySchema>;

export interface ExtractImageResponse {
  imageUrl: string | null;
  error?: string;
}
