import OpenAI from "openai";

// Tipos que coinciden con GeminiProvider
type ToolCallResponse = {
  type: "tool_call";
  tool: string;
  args: any;
};

type TextResponse = {
  type: "text";
  content: string;
};

type AIResponse = ToolCallResponse | TextResponse;

export class QwenProvider {
  private client: OpenAI;

  constructor() {
    const apiKey = process.env.QWEN_API_KEY;
    if (!apiKey) {
      throw new Error('QWEN_API_KEY no está configurada en las variables de entorno');
    }
    
    this.client = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
    });
  }

  async generateResponse(prompt: string, tools?: any[]): Promise<AIResponse> {
    // Convertir tools al formato de OpenAI
    const openaiTools = tools?.map(tool => ({
      type: "function" as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters || {
          type: "object",
          properties: {},
          additionalProperties: true,
        }
      }
    }));

    console.log('=== QwenProvider tools being sent ===');
    console.log('Number of tools:', openaiTools?.length);
    console.log('Tools:', JSON.stringify(openaiTools, null, 2));

    const completion = await this.client.chat.completions.create({
      model: "qwen-plus",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      tools: openaiTools && openaiTools.length > 0 ? openaiTools : undefined,
      tool_choice: openaiTools && openaiTools.length > 0 ? "auto" : undefined,
    }).catch((error) => {
      console.error('Error en Qwen API:', error);
      throw error;
    });

    const message = completion.choices[0]?.message;

    // Caso A: Qwen quiere llamar a una herramienta
    if (message?.tool_calls && message.tool_calls.length > 0) {
      const toolCall = message.tool_calls[0];
      if (toolCall.type === "function" && toolCall.function) {
        return {
          type: "tool_call",
          tool: toolCall.function.name,
          args: JSON.parse(toolCall.function.arguments)
        };
      }
    }

    // Caso B: Qwen devolvió texto normal
    const rawContent = message?.content ?? "No se obtuvo respuesta.";
    return {
      type: "text",
      content: rawContent.replace(/\\n/g, "\n").trim()
    };
  }
}
