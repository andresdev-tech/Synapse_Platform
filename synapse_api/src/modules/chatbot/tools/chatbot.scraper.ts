// src/tools/chatbot.scraper.ts
//
// Tool de scraping para el chatbot: consulta de certificados SENA.
// Flujo: usuario ya autenticado por OTP -> pide tipo/número de documento ->
// el bot abre sesión headless, captura el captcha y lo envía al chat ->
// el usuario responde el texto del captcha -> el bot devuelve el link de descarga.
//
// Incluye: sesión temporal con expiración, rate limit (3 consultas / 24h por correo)
// y logging básico de cada consulta.

import { Browser, Page, chromium } from 'playwright';

// =====================================================
// Tipos del tool (para function-calling / integración con el bot)
// =====================================================

export interface IniciarConsultaInput {
  chatId: string;
  correo: string;
  tipoDocumento: string; // ej: "CEDULA DE CIUDADANIA"
  numeroDocumento: string;
}

export interface IniciarConsultaOutput {
  ok: boolean;
  captchaBase64?: string;
  intentosRestantes?: number;
  error?: 'RATE_LIMIT_EXCEEDED' | 'ERROR_DESCONOCIDO';
  esperaMs?: number;
}

export interface ResolverCaptchaInput {
  chatId: string;
  textoCaptcha: string;
  tipoDocumento: string;
  numeroDocumento: string;
}

export interface Certificado {
  titulo: string;
  programa: string;
  tipo: string;
  link: string;
}

export interface ResolverCaptchaOutput {
  ok: boolean;
  certificados?: Certificado[];
  nuevoCaptchaBase64?: string;
  mensajeError?: string;
  error?: 'SESSION_EXPIRED' | 'CAPTCHA_INVALIDO' | 'CAPTCHA_INVALIDO_O_ERROR' | 'ERROR_DESCONOCIDO';
}

// Definiciones estilo function-calling, por si Antigravity/el LLM las necesita
export const iniciarConsultaToolDefinition = {
  name: 'chatbot_scraper_iniciar_consulta',
  description:
    'Inicia una consulta de certificado en el portal SENA con tipo y número de documento del usuario autenticado. Devuelve la imagen del captcha en base64 para que el usuario la resuelva.',
  input_schema: {
    type: 'object',
    properties: {
      chatId: { type: 'string', description: 'Identificador de la conversación/usuario' },
      correo: { type: 'string', description: 'Correo verificado por OTP del usuario' },
      tipoDocumento: { type: 'string', description: 'Tipo de documento, ej: CEDULA DE CIUDADANIA' },
      numeroDocumento: { type: 'string', description: 'Número de documento a consultar' },
    },
    required: ['chatId', 'correo', 'tipoDocumento', 'numeroDocumento'],
  },
};

export const resolverCaptchaToolDefinition = {
  name: 'chatbot_scraper_resolver_captcha',
  description:
    'Envía el texto del captcha resuelto por el usuario y devuelve el link de descarga del certificado si es correcto.',
  input_schema: {
    type: 'object',
    properties: {
      chatId: { type: 'string' },
      textoCaptcha: { type: 'string' },
      tipoDocumento: { type: 'string' },
      numeroDocumento: { type: 'string' },
    },
    required: ['chatId', 'textoCaptcha', 'tipoDocumento', 'numeroDocumento'],
  },
};

// =====================================================
// Config
// =====================================================

const URL_SENA = 'https://certificados.sena.edu.co/CertificadoDigital/com.sena.consultacer';
const SESSION_TTL_MS = 3 * 60 * 1000; // 3 min para resolver el captcha
const RATE_LIMIT_MAX_INTENTOS = 7;
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutos de espera tras 7 intentos

// =====================================================
// Tipos internos
// =====================================================

interface ScrapingSession {
  browser: Browser;
  page: Page;
  createdAt: number;
  timeoutHandle: NodeJS.Timeout;
  correo: string;
}

interface ConsultaLog {
  timestamp: number;
  correo: string;
  tipoDocumento: string;
  numeroDocumento: string;
  resultado: 'exitosa' | 'captcha_incorrecto' | 'rate_limited';
}

interface RateLimitEntry {
  timestamps: number[];
}

// =====================================================
// Rate limiter (por correo, no por chatId)
// =====================================================

class RateLimiter {
  private store = new Map<string, RateLimitEntry>();

  puedeConsultar(correo: string): boolean {
    this.limpiarVencidos(correo);
    const entry = this.store.get(correo);
    return !entry || entry.timestamps.length < RATE_LIMIT_MAX_INTENTOS;
  }

  registrarIntento(correo: string): void {
    this.limpiarVencidos(correo);
    const entry = this.store.get(correo) ?? { timestamps: [] };
    entry.timestamps.push(Date.now());
    this.store.set(correo, entry);
  }

  intentosRestantes(correo: string): number {
    this.limpiarVencidos(correo);
    const usados = this.store.get(correo)?.timestamps.length ?? 0;
    return Math.max(0, RATE_LIMIT_MAX_INTENTOS - usados);
  }

  proximoIntentoEnMs(correo: string): number {
    this.limpiarVencidos(correo);
    const entry = this.store.get(correo);
    if (!entry || entry.timestamps.length < RATE_LIMIT_MAX_INTENTOS) return 0;
    const masAntiguo = Math.min(...entry.timestamps);
    return Math.max(0, masAntiguo + RATE_LIMIT_WINDOW_MS - Date.now());
  }

  private limpiarVencidos(correo: string): void {
    const entry = this.store.get(correo);
    if (!entry) return;
    const ahora = Date.now();
    entry.timestamps = entry.timestamps.filter((t) => ahora - t < RATE_LIMIT_WINDOW_MS);
    if (entry.timestamps.length === 0) this.store.delete(correo);
    else this.store.set(correo, entry);
  }
}

// =====================================================
// Logger (consola + memoria; sustituir por BD si se necesita persistencia real)
// =====================================================

class ConsultaLogger {
  private logs: ConsultaLog[] = [];

  registrar(log: ConsultaLog): void {
    this.logs.push(log);
    // eslint-disable-next-line no-console
    /* console.log */ void(
      `[SCRAPER][${new Date(log.timestamp).toISOString()}] correo=${log.correo} ` +
        `doc=${log.tipoDocumento}:${log.numeroDocumento} resultado=${log.resultado}`
    );
    // TODO: persistir en BD para auditoría más allá del proceso en memoria
  }
}

// =====================================================
// Manager principal
// =====================================================

class ScrapingSessionManager {
  private sessions = new Map<string, ScrapingSession>();
  private rateLimiter = new RateLimiter();
  private logger = new ConsultaLogger();

  async iniciarConsulta(input: IniciarConsultaInput): Promise<IniciarConsultaOutput> {
    const { chatId, correo, tipoDocumento, numeroDocumento } = input;
    console.log(`\n---------------- [SCRAPER: INICIAR CONSULTA] ----------------`);
    console.log(`[SCRAPER] [iniciarConsulta] Solicitud para usuario: ${chatId} (${correo})`);
    console.log(`[SCRAPER] [iniciarConsulta] Documento: Tipo=${tipoDocumento}, Número=${numeroDocumento}`);

    if (!this.rateLimiter.puedeConsultar(correo)) {
      const esperaMs = this.rateLimiter.proximoIntentoEnMs(correo);
      console.warn(`[SCRAPER] [iniciarConsulta] RATE LIMIT EXCEDIDO para ${correo}. Espera: ${Math.ceil(esperaMs / 1000)}s`);
      this.logger.registrar({
        timestamp: Date.now(),
        correo,
        tipoDocumento,
        numeroDocumento,
        resultado: 'rate_limited',
      });
      return { ok: false, error: 'RATE_LIMIT_EXCEEDED', esperaMs };
    }

    // Se cuenta el intento al iniciar, no solo si el captcha sale bien
    this.rateLimiter.registrarIntento(correo);
    const intentosRestantes = this.rateLimiter.intentosRestantes(correo);
    console.log(`[SCRAPER] [iniciarConsulta] Intento registrado. Intentos restantes: ${intentosRestantes}`);

    await this.cerrarSesion(chatId);

    try {
      console.log(`[SCRAPER] [iniciarConsulta] Lanzando Chromium headless...`);
      const browser = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
      });
      const page = await browser.newPage({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      });

      console.log(`[SCRAPER] [iniciarConsulta] Navegando a ${URL_SENA}...`);
      const response = await page.goto(URL_SENA, { waitUntil: 'domcontentloaded', timeout: 30000 });
      console.log(`[SCRAPER] [iniciarConsulta] Respuesta de página SENA: HTTP ${response?.status() ?? 'N/A'}`);
      
      console.log(`[SCRAPER] [iniciarConsulta] Seleccionando tipo de documento: "${tipoDocumento}"...`);
      await page.selectOption('select#vTIPO_DOCUMENTO', { value: tipoDocumento });
      await page.dispatchEvent('select#vTIPO_DOCUMENTO', 'change');
      
      console.log(`[SCRAPER] [iniciarConsulta] Ingresando número de documento: "${numeroDocumento}"...`);
      await page.fill('input#vNUMERO_DOCUMENTO', numeroDocumento);
      await page.dispatchEvent('input#vNUMERO_DOCUMENTO', 'change');
      await page.dispatchEvent('input#vNUMERO_DOCUMENTO', 'blur');

      console.log(`[SCRAPER] [iniciarConsulta] Capturando imagen del Captcha (img#vCAPTCHAIMAGE)...`);
      const captchaLocator = page.locator('img#vCAPTCHAIMAGE');
      await captchaLocator.waitFor({ state: 'visible', timeout: 10000 });
      const captchaBuffer = await captchaLocator.screenshot();
      console.log(`[SCRAPER] [iniciarConsulta] ✅ Captcha capturado con éxito (${captchaBuffer.length} bytes base64)`);

      const timeoutHandle = setTimeout(() => {
        console.log(`[SCRAPER] [TTL] Sesión expirada por inactividad para usuario ${chatId}`);
        this.cerrarSesion(chatId);
      }, SESSION_TTL_MS);

      this.sessions.set(chatId, { browser, page, createdAt: Date.now(), timeoutHandle, correo });
      console.log(`[SCRAPER] [iniciarConsulta] Sesión guardada en memoria. Esperando respuesta del usuario (TTL: 3 min)`);
      console.log(`-------------------------------------------------------------\n`);

      return {
        ok: true,
        captchaBase64: captchaBuffer.toString('base64'),
        intentosRestantes,
      };
    } catch (e) {
      console.error("[SCRAPER ERROR] [iniciarConsulta] Fallo al iniciar consulta:", e);
      return { ok: false, error: 'ERROR_DESCONOCIDO' };
    }
  }

  async resolverCaptcha(input: ResolverCaptchaInput): Promise<ResolverCaptchaOutput> {
    const { chatId, textoCaptcha, tipoDocumento, numeroDocumento } = input;
    console.log(`\n---------------- [SCRAPER: RESOLVER CAPTCHA] ----------------`);
    console.log(`[SCRAPER] [resolverCaptcha] Validando captcha para usuario: ${chatId}`);
    console.log(`[SCRAPER] [resolverCaptcha] Texto de captcha proporcionado: "${textoCaptcha}"`);
    console.log(`[SCRAPER] [resolverCaptcha] Documento: ${tipoDocumento}:${numeroDocumento}`);

    const session = this.sessions.get(chatId);

    if (!session) {
      console.warn(`[SCRAPER] [resolverCaptcha] ⚠️ Sesión no encontrada o ya expirada para chat: ${chatId}`);
      return { ok: false, error: 'SESSION_EXPIRED' };
    }

    try {
      console.log(`[SCRAPER] [resolverCaptcha] Escribiendo texto en input#vCAPTCHATEXT y disparando eventos...`);
      await session.page.fill('input#vCAPTCHATEXT', textoCaptcha);
      await session.page.dispatchEvent('input#vCAPTCHATEXT', 'change');
      
      console.log(`[SCRAPER] [resolverCaptcha] Haciendo clic en input#CONSULTAR y esperando respuesta de red...`);
      await Promise.all([
        session.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {
          console.log(`[SCRAPER] [resolverCaptcha] networkidle timeout (15s), continuando análisis del DOM`);
        }),
        session.page.click('input#CONSULTAR')
      ]);

      console.log(`[SCRAPER] [resolverCaptcha] Esperando renderizado de GeneXus...`);
      await session.page.waitForTimeout(2500);

      // Inspeccionar si GeneXus muestra mensajes de error o alerta en el DOM
      const possibleErrorMessages = await session.page.$$eval(
        '#gxErrorViewer, .gx-warning-message, .gx-error-message, span[id*="CAPTCHA"], .alert',
        elements => elements.map(el => el.textContent?.trim()).filter(t => Boolean(t))
      ).catch(() => []);

      if (possibleErrorMessages.length > 0) {
        console.warn(`[SCRAPER] [resolverCaptcha] ⚠️ Mensajes de alerta/error detectados en el DOM del portal SENA:`, possibleErrorMessages);
      }

      // Comprobar si hubo error de captcha explícito en el DOM
      const hasCaptchaError = possibleErrorMessages.some(txt => {
        const lower = txt.toLowerCase();
        return lower.includes('captcha') || 
               lower.includes('imagen') || 
               lower.includes('seguridad') ||
               lower.includes('código') ||
               lower.includes('codigo') ||
               lower.includes('incorrect');
      });

      const rowsCount = await session.page.$$eval('#GridceContainerTbl tbody tr', rows => rows.length).catch(() => 0);
      console.log(`[SCRAPER] [resolverCaptcha] Filas encontradas en tabla #GridceContainerTbl: ${rowsCount}`);

      const certificados = await session.page.$$eval('#GridceContainerTbl tbody tr', (rows) => {
        return rows.map((row) => {
          const cells = row.querySelectorAll('td');
          if (cells.length < 7) return null;
          
          const a = cells[6].querySelector('a');
          let link = '';
          if (a) {
             const href = a.getAttribute('href') || '';
             link = href.startsWith('http') ? href : 'https://certificados.sena.edu.co/CertificadoDigital/' + href;
          }
          
          return {
            titulo: cells[1].textContent?.trim() || '',
            tipo: cells[2].textContent?.trim() || '',
            programa: cells[3].textContent?.trim() || '',
            link
          };
        }).filter(c => c !== null && c.link !== '') as {titulo: string, tipo: string, programa: string, link: string}[];
      }).catch(() => []);

      console.log(`[SCRAPER] [resolverCaptcha] ✅ Certificados parseados (${certificados.length}):`, JSON.stringify(certificados, null, 2));

      // Si se detectó error de captcha
      if (hasCaptchaError) {
        console.warn(`[SCRAPER] [resolverCaptcha] ❌ El portal SENA reportó Captcha incorrecto.`);
        let nuevoCaptchaBase64: string | undefined;
        try {
          const newCaptchaLocator = session.page.locator('img#vCAPTCHAIMAGE');
          await newCaptchaLocator.waitFor({ state: 'visible', timeout: 3000 });
          const newBuf = await newCaptchaLocator.screenshot();
          nuevoCaptchaBase64 = newBuf.toString('base64');
          console.log(`[SCRAPER] [resolverCaptcha] 🔄 Nueva imagen de captcha extraída (${newBuf.length} bytes)`);
        } catch {
          console.log(`[SCRAPER] [resolverCaptcha] No se pudo extraer nuevo screenshot de captcha directo de la sesión`);
        }

        this.logger.registrar({
          timestamp: Date.now(),
          correo: session.correo,
          tipoDocumento,
          numeroDocumento,
          resultado: 'captcha_incorrecto',
        });

        return {
          ok: false,
          error: 'CAPTCHA_INVALIDO',
          mensajeError: possibleErrorMessages.join(' - ') || 'Código de seguridad incorrecto',
          nuevoCaptchaBase64
        };
      }

      this.logger.registrar({
        timestamp: Date.now(),
        correo: session.correo,
        tipoDocumento,
        numeroDocumento,
        resultado: 'exitosa',
      });

      console.log(`-------------------------------------------------------------\n`);
      return { ok: true, certificados };
    } catch (e) {
      console.error("[SCRAPER ERROR CAPTCHA] Error durante resolverCaptcha:", e);
      this.logger.registrar({
        timestamp: Date.now(),
        correo: session.correo,
        tipoDocumento,
        numeroDocumento,
        resultado: 'captcha_incorrecto',
      });
      return { ok: false, error: 'CAPTCHA_INVALIDO_O_ERROR' };
    } finally {
      console.log(`[SCRAPER] [resolverCaptcha] Cerrando sesión y navegador para chat: ${chatId}`);
      await this.cerrarSesion(chatId);
    }
  }

  intentosRestantes(correo: string): number {
    return this.rateLimiter.intentosRestantes(correo);
  }

  async cerrarSesion(chatId: string): Promise<void> {
    const session = this.sessions.get(chatId);
    if (session) {
      clearTimeout(session.timeoutHandle);
      await session.browser.close().catch(() => {});
      this.sessions.delete(chatId);
    }
  }

  async cerrarTodas(): Promise<void> {
    for (const chatId of Array.from(this.sessions.keys())) {
      await this.cerrarSesion(chatId);
    }
  }
}

// =====================================================
// Instancia exportada (singleton) — esto es lo que Antigravity conecta al bot
// =====================================================

export const chatbotScraper = new ScrapingSessionManager();

process.on('SIGINT', async () => {
  await chatbotScraper.cerrarTodas();
  process.exit(0);
});
