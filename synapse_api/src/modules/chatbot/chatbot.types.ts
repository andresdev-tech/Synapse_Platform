import { z } from "zod";

import { chatbotMessageSchema } from "./chatbot.schema";

export type ChatbotMessageDTO = z.infer<typeof chatbotMessageSchema>;

export interface ChatbotResponse {
  success: boolean;
  error?: string;
  data?: {
    message: string;
  };
}