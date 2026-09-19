import { ChatbotRepository } from "./chatbot.repository";
import { ChatbotService } from "./chatbot.service";
import { prisma } from './../../config/prisma';

/**
 * Contenedor de dependencias para el módulo de Chatbot.
 * Instancia el repositorio de datos y el servicio principal asegurando un único punto de acceso.
 */
const chatbotRepository =
  new ChatbotRepository(prisma);

export const chatbotService =
  new ChatbotService(
    chatbotRepository
  );

