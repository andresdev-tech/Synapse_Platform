import { z } from "zod";
import { updateLayoutSchema } from "./user.schema";

export type UpdateLayoutDTO = z.infer<typeof updateLayoutSchema>;

export interface UserLayoutResponse {
  layoutPrefs: any;
}

export interface UserListItem {
  id: string;
  name: string | null;
  email: string;
  role: any;
}
