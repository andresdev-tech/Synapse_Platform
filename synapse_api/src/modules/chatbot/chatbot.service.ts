import { ChatbotRepository } from "./chatbot.repository";
import { chatbotScraper } from "./tools/chatbot.scraper";
import { ProviderFactory } from "./providers/provider.factory";
import { AIProvider } from "./providers/ai-provider.interface";

export interface ChatbotMessage {
  userId: string;
  correo: string;
  message: string;
}

// Estados del flujo interactivo para la consulta de certificados
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

// Mapa en memoria para el seguimiento de la conversación del usuario
const sessionMap = new Map<string, ChatbotSession>();

/**
 * Obtiene o inicializa la sesión conversacional de un usuario (expira tras 3 minutos de inactividad).
 */
function getSession(userId: string): ChatbotSession {
  const session = sessionMap.get(userId);
  if (!session || Date.now() - session.ultimaActividad > 3 * 60 * 1000) {
    const nuevaSesion = { estado: 'fuera_de_flujo' as FlujoState, ultimaActividad: Date.now() };
    sessionMap.set(userId, nuevaSesion);
    return nuevaSesion;
  }
  return session;
}

/**
 * Actualiza los datos de la sesión del usuario y renueva la marca de tiempo de actividad.
 */
function updateSession(userId: string, data: Partial<ChatbotSession>) {
  const session = getSession(userId);
  Object.assign(session, data, { ultimaActividad: Date.now() });
  sessionMap.set(userId, session);
}

/**
 * Finaliza y elimina la sesión activa del usuario.
 */
function endSession(userId: string) {
  sessionMap.delete(userId);
}

/**
 * Servicio principal del Chatbot institucional.
 * Orquesta la máquina de estados para la consulta de certificados SENA y las respuestas con IA basada en RAG.
 */
export class ChatbotService {
  private readonly provider: AIProvider;

  constructor(
    private readonly repository: ChatbotRepository
  ) {
    this.provider = ProviderFactory.getProvider();
  }

  /**
   * Procesa cada mensaje enviado por el usuario, respondiendo en streaming.
   * Maneja tanto el flujo conversacional del scraper de certificados como la consulta semántica RAG a la base de conocimiento.
   */
  async *processMessage(
    data: ChatbotMessage
  ): AsyncGenerator<string, void, unknown> {
    const { userId, correo, message } = data;

    if (!userId) throw new Error("Usuario no autenticado.");
    if (!message || typeof message !== "string") throw new Error("El mensaje es obligatorio.");
    const normalizedMessage = message.trim();
    if (!normalizedMessage) throw new Error("El mensaje no puede estar vacío.");

    const session = getSession(userId);
    console.log(`[CHATBOT SERVICE] Estado actual de la sesión para usuario ${userId}: "${session.estado}"`);

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

      console.log(`[CHATBOT SERVICE] [esperando_tipo_documento] Entrada usuario: "${normalizedMessage}" -> Tipo extraído: "${tipoDoc || 'NO_VALIDO'}"`);

      if (!tipoDoc) {
        yield "Por favor, indícame tu tipo de documento válido (ej: CC, TI, CE, PEP).";
        return;
      }

      updateSession(userId, { tipoDocumento: tipoDoc, estado: 'esperando_numero_documento' });
      console.log(`[CHATBOT SERVICE] Sesión actualizada: tipoDocumento="${tipoDoc}", nuevoEstado="esperando_numero_documento"`);
      yield "Perfecto, ahora dime tu número de documento (solo los números, sin puntos ni espacios).";
      return;
    }

    if (session.estado === 'esperando_numero_documento') {
      const { tipoDocumento } = session;
      const numeroMatch = normalizedMessage.match(/\d{5,15}/);
      const numeroDoc = numeroMatch ? numeroMatch[0] : "";

      console.log(`[CHATBOT SERVICE] [esperando_numero_documento] Entrada usuario: "${normalizedMessage}" -> Número extraído: "${numeroDoc || 'NO_VALIDO'}"`);

      if (!numeroDoc) {
        yield "Por favor, indícame un número de documento válido (solo números).";
        return;
      }

      updateSession(userId, { numeroDocumento: numeroDoc, estado: 'esperando_captcha' });
      console.log(`[CHATBOT SERVICE] Sesión actualizada: numeroDocumento="${numeroDoc}", nuevoEstado="esperando_captcha"`);
      yield "Iniciando consulta del certificado, esto puede tardar unos segundos...\n\n";
      
      console.log(`[CHATBOT SERVICE] Llamando a chatbotScraper.iniciarConsulta para doc=${tipoDocumento}:${numeroDoc}...`);
      const result = await chatbotScraper.iniciarConsulta({
        chatId: userId,
        correo: correo,
        tipoDocumento: tipoDocumento || "CC",
        numeroDocumento: numeroDoc
      });

      console.log(`[CHATBOT SERVICE] Resultado de chatbotScraper.iniciarConsulta: ok=${result.ok}, error=${result.error ?? 'ninguno'}, intentosRestantes=${result.intentosRestantes ?? 'N/A'}`);

      if (result.ok) {
        yield `Resuelve el siguiente Captcha para continuar (Intentos restantes: ${result.intentosRestantes}).\n\n`;
        yield `<img src="data:image/jpeg;base64,${result.captchaBase64}" alt="Captcha" style="border-radius: 8px; margin: 8px 0;" />\n\n`;
        yield "¿Qué texto ves en la imagen?";
      } else if (result.error === 'RATE_LIMIT_EXCEEDED') {
        endSession(userId);
        const minutos = Math.max(1, Math.ceil((result.esperaMs || 0) / (1000 * 60)));
        console.warn(`[CHATBOT SERVICE] Rate limit excedido para ${correo}. Espera requerida: ${minutos} minutos.`);
        yield `Has alcanzado el límite de 10 intentos de consulta. Por favor, espera ${minutos} minuto(s) antes de volver a intentar.`;
      } else {
        endSession(userId);
        console.error(`[CHATBOT SERVICE] Error desconocido al iniciar consulta para usuario ${userId}.`);
        yield "Ocurrió un error al intentar consultar el certificado. Intenta de nuevo más tarde.";
      }
      return;
    }

    if (session.estado === 'esperando_captcha') {
      const { tipoDocumento, numeroDocumento } = session;
      console.log(`[CHATBOT SERVICE] [esperando_captcha] Usuario envió respuesta de Captcha: "${normalizedMessage}" para doc=${tipoDocumento}:${numeroDocumento}`);

      if (!tipoDocumento || !numeroDocumento) {
        console.warn(`[CHATBOT SERVICE] Sesión inconsistente (falta tipo o número de doc) para usuario ${userId}`);
        endSession(userId);
        yield "La sesión es inválida. Por favor, empieza de nuevo.";
        return;
      }

      yield "Validando captcha...\n\n";
      console.log(`[CHATBOT SERVICE] Llamando a chatbotScraper.resolverCaptcha...`);
      const result = await chatbotScraper.resolverCaptcha({
        chatId: userId,
        textoCaptcha: normalizedMessage,
        tipoDocumento,
        numeroDocumento
      });

      console.log(`[CHATBOT SERVICE] Resultado de chatbotScraper.resolverCaptcha: ok=${result.ok}, error=${result.error ?? 'ninguno'}, certificadosEncontrados=${result.certificados?.length ?? 0}`);

      if (result.ok) {
        endSession(userId);
        
        const certs = result.certificados || [];
        
        if (certs.length === 0) {
          console.log(`[CHATBOT SERVICE] Consulta completada sin certificados devueltos para doc=${numeroDocumento}`);
          yield "Consulta exitosa en el portal del SENA, pero no se encontraron certificados disponibles para este documento hasta el momento.";
        } else {
          console.log(`[CHATBOT SERVICE] Se encontraron ${certs.length} certificados para doc=${numeroDocumento}. Generando enlaces...`);
          let msg = `¡Consulta exitosa! Se encontraron **${certs.length} certificado(s)** asociados a tu documento:\n\n`;
          certs.forEach((c, idx) => {
            msg += `${idx + 1}. **${c.titulo}**\n   - **Tipo:** ${c.tipo}\n   - **Programa:** ${c.programa}\n   - 📥 [Descargar Certificado PDF](${c.link})\n\n`;
          });
          yield msg;
        }
      } else if (result.error === 'SESSION_EXPIRED') {
        endSession(userId);
        console.warn(`[CHATBOT SERVICE] Sesión de captcha expirada para usuario ${userId}`);
        yield "Se agotó el tiempo para resolver el captcha (3 minutos de inactividad). Por favor, solicita tu certificado nuevamente.";
      } else if (result.error === 'CAPTCHA_INVALIDO') {
        console.warn(`[CHATBOT SERVICE] Captcha incorrecto reportado para usuario ${userId}.`);
        if (result.nuevoCaptchaBase64) {
          yield `El texto del captcha que ingresaste no coincide con la imagen.\n\nPor favor, intenta de nuevo escribiendo el texto que ves a continuación:\n\n`;
          yield `<img src="data:image/jpeg;base64,${result.nuevoCaptchaBase64}" alt="Captcha" style="border-radius: 8px; margin: 8px 0;" />\n\n`;
          yield "¿Qué texto ves en la nueva imagen?";
        } else {
          // Si no se pudo obtener nuevo screenshot de la misma sesión, iniciamos una nueva consulta automáticamente
          console.log(`[CHATBOT SERVICE] Reintentando iniciarConsulta para nuevo captcha...`);
          const restartResult = await chatbotScraper.iniciarConsulta({
            chatId: userId,
            correo,
            tipoDocumento,
            numeroDocumento
          });
          if (restartResult.ok && restartResult.captchaBase64) {
            yield `El texto del captcha no fue correcto.\n\nTe hemos generado una nueva imagen (Intentos restantes: ${restartResult.intentosRestantes}):\n\n`;
            yield `<img src="data:image/jpeg;base64,${restartResult.captchaBase64}" alt="Captcha" style="border-radius: 8px; margin: 8px 0;" />\n\n`;
            yield "¿Qué texto ves en la nueva imagen?";
          } else {
            endSession(userId);
            yield "El texto del captcha fue incorrecto y no fue posible generar una nueva sesión. Por favor intenta de nuevo.";
          }
        }
      } else {
        endSession(userId);
        console.warn(`[CHATBOT SERVICE] Captcha inválido o error en portal SENA para texto="${normalizedMessage}"`);
        yield "Ocurrió un error al procesar el captcha con el portal del SENA. Por favor, solicita tu certificado nuevamente.";
      }
      return;
    }

    // ===============================
    // FLUJO NORMAL RAG (BASE DE CONOCIMIENTO)
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
             continue; // Espera para verificar si incluye [INIT_CERT]
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

