/**
 * Estructura de entrada para el proveedor de IA del chatbot.
 */
export interface ChatbotProviderInput {
  message: string;
  context: string;
}

/**
 * Contrato de interfaz que debe implementar cualquier proveedor de IA (Qwen, OpenAI, etc.).
 */
export interface AIProvider {
  /**
   * Genera la respuesta del chatbot en tiempo real mediante un generador asíncrono (streaming).
   */
  generateResponse(data: ChatbotProviderInput): AsyncGenerator<string, void, unknown>;

  /**
   * Genera el vector de embedding numérico para un texto dado.
   */
  generateEmbedding?(text: string): Promise<number[]>;
}

