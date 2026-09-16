import { z } from "zod";
import { createCommentSchema } from "./comment.schema";

export type CreateCommentDTO = z.infer<typeof createCommentSchema>;

export interface CommentResponse {
  id: string;
  content: string;
  contentId: string;
  authorId: string;
  parentId: string | null;
  approved: boolean;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  author?: {
    id: string;
    name: string | null;
    image: string | null;
    email: string;
  };
}
