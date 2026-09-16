import OpenAI from "openai";

import { prompt } from './prompt/system.prompt';

export interface ChatbotProviderInput {
  message: string;
  context: string;
}

export class ChatbotProvider {
  private readonly qwen: OpenAI;

  constructor() {
    if (!process.env.QWEN_API_KEY) {
      throw new Error(
        "QWEN_API_KEY no está configurada."
      );
    }

    this.qwen = new OpenAI({
      apiKey: process.env.QWEN_API_KEY,
      baseURL:
        process.env.QWEN_BASE_URL ||
        "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
    });
  }

  /**
   * Genera la respuesta del chatbot mediante streaming.
   */
  async *generateResponse(
    data: ChatbotProviderInput
  ): AsyncGenerator<string, void, unknown> {
    const { message, context } = data;

    const userPrompt = `
CONTEXTO DISPONIBLE:
${context || "No se encontró información relevante."}

PREGUNTA DEL USUARIO:
${message}
`;

    const stream =
      await this.qwen.chat.completions.create({
        model: process.env.QWEN_MODEL || "qwen-plus",

        messages: [
          {
            role: "system",
            content: prompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],

        temperature: 0.2,

        stream: true,
      });

    for await (const chunk of stream) {
      const content =
        chunk.choices[0]?.delta?.content;

      if (content) {
        yield content;
      }
    }
  }
}
