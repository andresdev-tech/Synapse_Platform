import OpenAI from "openai";
import { prompt } from '../prompt/system.prompt';
import { AIProvider, ChatbotProviderInput } from "./ai-provider.interface";

export class QwenProvider implements AIProvider {
  private readonly qwen: OpenAI;
  private readonly qwenEmbedding: OpenAI;

  constructor() {
    const apiKey = process.env.AI_PROVIDER_KEY_API || process.env.QWEN_API_KEY;
    if (!apiKey) {
      throw new Error("AI_PROVIDER_KEY_API no está configurada.");
    }

    this.qwen = new OpenAI({
      apiKey: apiKey,
      baseURL: process.env.AI_BASE_URL || "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
    });

    this.qwenEmbedding = new OpenAI({
      apiKey: apiKey,
      baseURL: process.env.AI_BASE_URL || "https://ws-0rdusf4e91zylnjr.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1",
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

    const temperature = process.env.AI_TEMPERATURE ? parseFloat(process.env.AI_TEMPERATURE) : 0.2;

    const stream = await this.qwen.chat.completions.create({
      model: process.env.AI_MODEL || "qwen-plus",
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
      temperature: temperature,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.qwenEmbedding.embeddings.create({
      model: process.env.AI_EMBEDDING_MODEL || "text-embedding-v4",
      input: text,
      // Only set dimensions for qwen if needed, openai might differ, but this is the QwenProvider
      dimensions: 1024,
    });

    const embedding = response.data[0]?.embedding;
    if (!embedding) {
      throw new Error("No se pudo generar el embedding.");
    }
    return embedding;
  }
}
