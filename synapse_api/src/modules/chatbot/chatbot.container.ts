import { ChatbotProvider } from "./chatbot.provider";
import { ChatbotRepository } from "./chatbot.repository";
import { ChatbotService } from "./chatbot.service";
import { EmbeddingService } from "./embedding.service";
import { prisma } from './../../config/prisma';


const embeddingService =
  new EmbeddingService();

const chatbotRepository =
  new ChatbotRepository(prisma);

const chatbotProvider =
  new ChatbotProvider();

export const chatbotService =
  new ChatbotService(
    embeddingService,
    chatbotRepository,
    chatbotProvider
  );
