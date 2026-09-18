import { ChatbotRepository } from "./chatbot.repository";
import { ChatbotService } from "./chatbot.service";
import { prisma } from './../../config/prisma';

const chatbotRepository =
  new ChatbotRepository(prisma);

export const chatbotService =
  new ChatbotService(
    chatbotRepository
  );
