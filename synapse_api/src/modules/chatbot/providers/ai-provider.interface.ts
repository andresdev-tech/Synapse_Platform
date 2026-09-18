export interface ChatbotProviderInput {
  message: string;
  context: string;
}

export interface AIProvider {
  generateResponse(data: ChatbotProviderInput): AsyncGenerator<string, void, unknown>;
  generateEmbedding?(text: string): Promise<number[]>;
}
