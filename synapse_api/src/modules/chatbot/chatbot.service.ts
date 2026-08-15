import { ChatbotRepository } from "./chatbot.repository";
import { QwenProvider } from "./providers/qwen.provider";
import { chatbotPrompt } from "./prompts/chatbot.prompt";
import { buildContext } from "./utils/context-builder.util";
import { getUsersInfo, updateUser } from "./tools/users.tool";
import { sseManager } from "./sse.manager";

export class ChatbotService {
  private repository: ChatbotRepository;
  private provider: QwenProvider;

  constructor() {
    this.repository = new ChatbotRepository();
    this.provider = new QwenProvider();
  }

  private getTools() {
    return [
      {
        name: "get_user_info",
        description:
          "Obtiene la información del usuario autenticado. Úsalo cuando el usuario pregunte por sus datos personales, quiera ver su información, o necesite saber qué datos tiene registrados.",
        parameters: {
          type: "object",
          properties: {},
          required: []
        }
      },
      {
        name: "update_user_data",
        description:
          "Actualiza los datos del usuario autenticado. Úsalo cuando el usuario solicite cambiar, modificar o actualizar cualquier dato personal como nombre, correo, fecha de nacimiento, documento, etc. Los campos a actualizar deben incluirse en los argumentos.",
        parameters: {
          type: "object",
          properties: {
            nombres: { type: "string", description: "Nombres del usuario" },
            apellidos: { type: "string", description: "Apellidos del usuario" },
            correo_electronico: { type: "string", description: "Correo electrónico del usuario" },
            fecha_nacimiento: { type: "string", description: "Fecha de nacimiento en formato YYYY-MM-DD" },
            numero_documento: { type: "string", description: "Número de documento de identidad" },
            tipo_documento_id: { type: "number", description: "ID del tipo de documento" }
          },
          required: []
        }
      },
    ];
  }

  private async executeTool(
    toolName: string,
    usuarioId: string,
    args: any
  ) {
    console.log('=== executeTool called ===');
    console.log('toolName:', toolName);
    console.log('usuarioId:', usuarioId);
    console.log('args:', args);

    switch (toolName) {
      case "get_user_info":
        return await getUsersInfo(usuarioId);

      case "update_user_data":
        return await updateUser(usuarioId, args);

      default:
        throw new Error(`Tool no soportada: ${toolName}`);
    }
  }

  async askQuestion(
    usuarioId: string,
    question: string
    
  ) {
    const documents =
      await this.repository.searchDocuments(question);

    const context =
      buildContext(documents);

    const prompt = `
${chatbotPrompt}

CONTEXTO:

${context}

PREGUNTA:

${question}
`;

    const aiResponse =
      await this.provider.generateResponse(
        prompt,
        this.getTools()
      );

    /**
     * Ejemplo esperado desde QwenProvider:
     *
     * {
     *   type: "tool_call",
     *   tool: "get_user_info",
     *   args: {}
     * }
     *
     * o
     *
     * {
     *   type: "text",
     *   content: "respuesta"
     * }
     */

    let finalResponse: string;
    let currentAiResponse = aiResponse;
    let toolResultContext = "";
    let iterations = 0;
    const maxIterations = 5;

    while (
      typeof currentAiResponse === "object" && 
      currentAiResponse?.type === "tool_call" && 
      iterations < maxIterations
    ) {
      iterations++;
      console.log(`=== Tool call detected (iteration ${iterations}) ===`);
      console.log('aiResponse.tool:', currentAiResponse.tool);
      console.log('aiResponse.args:', currentAiResponse.args);

      const toolResult = await this.executeTool(
        currentAiResponse.tool,
        usuarioId,
        currentAiResponse.args
      );

      console.log('=== Tool result ===');
      console.log('toolResult:', toolResult);

      toolResultContext += `\n\n[Llamada a herramienta: ${currentAiResponse.tool} con argumentos: ${JSON.stringify(currentAiResponse.args)}]\nResultado:\n${JSON.stringify(toolResult, null, 2)}`;

      currentAiResponse = await this.provider.generateResponse(
        `
Pregunta original:
${question}

Historial de herramientas ejecutadas:
${toolResultContext}

Genera una respuesta clara para el usuario, o usa otra herramienta si es necesario para completar la solicitud.
`,
        this.getTools()
      );

      console.log(`=== Follow-up response (iteration ${iterations}) ===`);
      console.log('currentAiResponse:', currentAiResponse);
    }

    if (typeof currentAiResponse === "string") {
      finalResponse = currentAiResponse;
    } else if (currentAiResponse?.type === "text") {
      finalResponse = currentAiResponse.content;
    } else if (currentAiResponse?.type === "tool_call") {
      finalResponse = "Error: Se excedió el límite de llamadas a herramientas.";
    } else {
      finalResponse = "Error: respuesta inválida";
    }

    await this.repository.saveHistory({
      usuarioId,
      pregunta: question,
      respuesta: finalResponse,
    });

    // Enviar respuesta vía SSE para actualización en tiempo real
    sseManager.sendToUser(usuarioId, {
      type: 'message',
      data: {
        question,
        response: finalResponse,
        timestamp: new Date().toISOString()
      }
    });

    return {
      response: finalResponse,
    };
  }

  async getHistory(usuarioId: string) {
    return this.repository.getHistory(usuarioId);
  }
}