import { AIProvider } from "./ai-provider.interface";
import { QwenProvider } from "./qwen.provider";

/**
 * Fábrica para la instanciación dinámica del proveedor de Inteligencia Artificial.
 * Permite cambiar de modelo o proveedor mediante variables de entorno sin modificar el resto del sistema.
 */
export class ProviderFactory {
  /**
   * Retorna una instancia del proveedor de IA configurado (por defecto Qwen / Alibaba Cloud).
   */
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

