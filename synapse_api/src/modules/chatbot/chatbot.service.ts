import { ChatbotRepository } from "./chatbot.repository";
import { chatbotScraper } from "./tools/chatbot.scraper";
import { ProviderFactory } from "./providers/provider.factory";
import { AIProvider } from "./providers/ai-provider.interface";

export interface ChatbotMessage {
  userId: string;
  correo: string;
  message: string;
}

type FlujoState = 
  | 'fuera_de_flujo'
  | 'esperando_tipo_documento'
  | 'esperando_numero_documento'
  | 'esperando_captcha';

interface ChatbotSession {
  estado: FlujoState;
  tipoDocumento?: string;
  numeroDocumento?: string;
  ultimaActividad: number;
}

const sessionMap = new Map<string, ChatbotSession>();

function getSession(userId: string): ChatbotSession {
  const session = sessionMap.get(userId);
  if (!session || Date.now() - session.ultimaActividad > 3 * 60 * 1000) {
    const nuevaSesion = { estado: 'fuera_de_flujo' as FlujoState, ultimaActividad: Date.now() };
    sessionMap.set(userId, nuevaSesion);
    return nuevaSesion;
  }
  return session;
}

function updateSession(userId: string, data: Partial<ChatbotSession>) {
  const session = getSession(userId);
  Object.assign(session, data, { ultimaActividad: Date.now() });
  sessionMap.set(userId, session);
}

function endSession(userId: string) {
  sessionMap.delete(userId);
}

export class ChatbotService {
  private readonly provider: AIProvider;

  constructor(
    private readonly repository: ChatbotRepository
  ) {
    this.provider = ProviderFactory.getProvider();
  }

  async *processMessage(
    data: ChatbotMessage
  ): AsyncGenerator<string, void, unknown> {
    const { userId, correo, message } = data;

    if (!userId) throw new Error("Usuario no autenticado.");
    if (!message || typeof message !== "string") throw new Error("El mensaje es obligatorio.");
    const normalizedMessage = message.trim();
    if (!normalizedMessage) throw new Error("El mensaje no puede estar vacío.");

    const session = getSession(userId);

    // ===============================
    // MÁQUINA DE ESTADOS DEL SCRAPER
    // ===============================
    if (session.estado === 'esperando_tipo_documento') {
      const upperMsg = normalizedMessage.toUpperCase();
      let tipoDoc = "";
      if (upperMsg.includes("CC") || upperMsg.includes("CEDULA") || upperMsg.includes("CIUDADANIA")) tipoDoc = "CC";
      else if (upperMsg.includes("TI") || upperMsg.includes("TARJETA") || upperMsg.includes("IDENTIDAD")) tipoDoc = "TI";
      else if (upperMsg.includes("CE") || upperMsg.includes("EXTRANJERIA")) tipoDoc = "CE";
      else if (upperMsg.includes("PEP")) tipoDoc = "PEP";

      if (!tipoDoc) {
        yield "Por favor, indícame tu tipo de documento válido (ej: CC, TI, CE, PEP).";
        return;
      }

      updateSession(userId, { tipoDocumento: tipoDoc, estado: 'esperando_numero_documento' });
      yield "Perfecto, ahora dime tu número de documento (solo los números, sin puntos ni espacios).";
      return;
    }

    if (session.estado === 'esperando_numero_documento') {
      const { tipoDocumento } = session;
      const numeroMatch = normalizedMessage.match(/\d{5,15}/);
      const numeroDoc = numeroMatch ? numeroMatch[0] : "";

      if (!numeroDoc) {
        yield "Por favor, indícame un número de documento válido (solo números).";
        return;
      }

      updateSession(userId, { numeroDocumento: numeroDoc, estado: 'esperando_captcha' });
      yield "Iniciando consulta del certificado, esto puede tardar unos segundos...\n\n";
      
      const result = await chatbotScraper.iniciarConsulta({
        chatId: userId,
        correo: correo,
        tipoDocumento: tipoDocumento || "CC", // Already "CC", "TI", "CE", "PEP"
        numeroDocumento: numeroDoc
      });

      if (result.ok) {
        yield `Resuelve el siguiente Captcha para continuar (Intentos restantes: ${result.intentosRestantes}).\n\n`;
        yield `<img src="data:image/jpeg;base64,${result.captchaBase64}" alt="Captcha" style="border-radius: 8px; margin: 8px 0;" />\n\n`;
        yield "¿Qué texto ves en la imagen?";
      } else if (result.error === 'RATE_LIMIT_EXCEEDED') {
        endSession(userId);
        const horas = Math.ceil((result.esperaMs || 0) / (1000 * 60 * 60));
        yield `Has excedido el límite de consultas. Por favor, intenta de nuevo en ${horas} horas.`;
      } else {
        endSession(userId);
        yield "Ocurrió un error al intentar consultar el certificado. Intenta de nuevo más tarde.";
      }
      return;
    }

    if (session.estado === 'esperando_captcha') {
      const { tipoDocumento, numeroDocumento } = session;
      if (!tipoDocumento || !numeroDocumento) {
        endSession(userId);
        yield "La sesión es inválida. Por favor, empieza de nuevo.";
        return;
      }

      yield "Validando captcha...\n\n";
      const result = await chatbotScraper.resolverCaptcha({
        chatId: userId,
        textoCaptcha: normalizedMessage,
        tipoDocumento, // Already "CC", "TI", "CE", "PEP"
        numeroDocumento
      });

      if (result.ok) {
        endSession(userId);
        
        const certs = result.certificados || [];
        
        if (certs.length === 0) {
          yield "Consulta exitosa, pero no se encontraron certificados disponibles para este documento hasta el momento.";
        } else {
          let msg = "¡Consulta exitosa! Puedes descargar tus certificados aquí:\n\n";
          certs.forEach(c => {
            msg += `- **${c.titulo}** (${c.tipo})\n  Programa: ${c.programa}\n  [Descargar certificado](${c.link})\n\n`;
          });
          yield msg;
        }
      } else if (result.error === 'SESSION_EXPIRED') {
        endSession(userId);
        yield "Se agotó el tiempo para resolver el captcha. Por favor, solicita tu certificado nuevamente.";
      } else {
        yield "El texto del captcha no es correcto o hubo un error. Intenta escribiéndolo de nuevo (o espera a que caduque la sesión en 3 mins).";
      }
      return;
    }

    // ===============================
    // FLUJO NORMAL RAG
    // ===============================
    const embedding = await this.provider.generateEmbedding!(normalizedMessage);
    const chunks = await this.repository.searchSimilarChunks(embedding, 5);
    const context = chunks
      .map((chunk) => `Título: ${chunk.title ?? "Sin título"}\nContenido: ${chunk.content}`)
      .join("\n\n---\n\n");

    try {
      const stream = this.provider.generateResponse({ message: normalizedMessage, context });
      
      let buffer = "";
      let firstChunks = true;
      let initCertDetected = false;

      for await (const chunk of stream) {
        if (firstChunks) {
          buffer += chunk;
          if (buffer.length < 15 && !buffer.includes("]")) {
             continue; // wait to see if it contains [INIT_CERT]
          }
          firstChunks = false;
          if (buffer.includes("[INIT_CERT]")) {
            initCertDetected = true;
            updateSession(userId, { estado: 'esperando_tipo_documento' });
            buffer = buffer.replace("[INIT_CERT]", "").trimStart();
            if (buffer) yield buffer;
          } else {
            yield buffer;
          }
        } else {
          yield chunk;
        }
      }

      if (firstChunks) {
         if (buffer.includes("[INIT_CERT]")) {
            updateSession(userId, { estado: 'esperando_tipo_documento' });
            buffer = buffer.replace("[INIT_CERT]", "").trimStart();
         }
         if (buffer) yield buffer;
      }

    } catch (error) {
      console.error("ChatbotService - Error del provider:", error);
      throw new Error("No fue posible generar la respuesta.");
    }
  }
}
