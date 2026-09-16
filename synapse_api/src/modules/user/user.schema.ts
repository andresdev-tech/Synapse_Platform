import { z } from "zod";

export const updateLayoutSchema = z.object({
  layoutPrefs: z.any(),
});
