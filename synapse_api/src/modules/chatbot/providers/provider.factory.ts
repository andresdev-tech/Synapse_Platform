import { AIProvider } from "./ai-provider.interface";
import { QwenProvider } from "./qwen.provider";

export class ProviderFactory {
  static getProvider(): AIProvider {
    const providerName = process.env.AI_PROVIDER || 'alibaba';

    switch (providerName.toLowerCase()) {
      case 'alibaba':
      case 'qwen':
      default:
        return new QwenProvider();
    }
  }
}
