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
  error?: 'SESSION_EXPIRED' | 'CAPTCHA_INVALIDO_O_ERROR';
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
const RATE_LIMIT_MAX_INTENTOS = 3;
const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 horas

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

    if (!this.rateLimiter.puedeConsultar(correo)) {
      const esperaMs = this.rateLimiter.proximoIntentoEnMs(correo);
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

    await this.cerrarSesion(chatId);

    try {
      /* console.log */ void(`[SCRAPER] [iniciarConsulta] Lanzando navegador para ${correo}...`);
      const browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();

      /* console.log */ void(`[SCRAPER] [iniciarConsulta] Navegando a URL SENA...`);
      await page.goto(URL_SENA, { waitUntil: 'domcontentloaded' });
      
      /* console.log */ void(`[SCRAPER] [iniciarConsulta] Llenando formulario: tipo=${tipoDocumento}, doc=${numeroDocumento}`);
      await page.selectOption('select#vTIPO_DOCUMENTO', { value: tipoDocumento });
      await page.fill('input#vNUMERO_DOCUMENTO', numeroDocumento);

      /* console.log */ void(`[SCRAPER] [iniciarConsulta] Extrayendo imagen del captcha...`);
      const captchaBuffer = await page.locator('img#vCAPTCHAIMAGE').screenshot();
      /* console.log */ void(`[SCRAPER] [iniciarConsulta] Captcha obtenido, tamaño: ${captchaBuffer.length} bytes`);

      const timeoutHandle = setTimeout(() => {
        this.cerrarSesion(chatId);
      }, SESSION_TTL_MS);

      this.sessions.set(chatId, { browser, page, createdAt: Date.now(), timeoutHandle, correo });

      return {
        ok: true,
        captchaBase64: captchaBuffer.toString('base64'),
        intentosRestantes: this.rateLimiter.intentosRestantes(correo),
      };
    } catch (e) {
      console.error("[SCRAPER ERROR]", e);
      return { ok: false, error: 'ERROR_DESCONOCIDO' };
    }
  }

  async resolverCaptcha(input: ResolverCaptchaInput): Promise<ResolverCaptchaOutput> {
    const { chatId, textoCaptcha, tipoDocumento, numeroDocumento } = input;
    const session = this.sessions.get(chatId);

    if (!session) {
      return { ok: false, error: 'SESSION_EXPIRED' };
    }

    try {
      /* console.log */ void(`[SCRAPER] [resolverCaptcha] Iniciando resolución para chat ${chatId}`);
      /* console.log */ void(`[SCRAPER] [resolverCaptcha] Texto captcha: ${textoCaptcha}`);

      await session.page.fill('input#vCAPTCHATEXT', textoCaptcha);
      
      /* console.log */ void(`[SCRAPER] [resolverCaptcha] Dando clic en consultar...`);
      // Use Promise.all to wait for the click and the subsequent network activity to settle
      await Promise.all([
        session.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => /* console.log */ void('[SCRAPER] [resolverCaptcha] networkidle timeout, continuando de todos modos')),
        session.page.click('input#CONSULTAR')
      ]);

      /* console.log */ void(`[SCRAPER] [resolverCaptcha] Esperando a que el DOM se actualice tras la consulta...`);
      // Esperamos 2 segundos extra de gracia por si hay animaciones de UI o renderizado lento
      await session.page.waitForTimeout(2000);

      const rowsCount = await session.page.$$eval('#GridceContainerTbl tbody tr', rows => rows.length);
      /* console.log */ void(`[SCRAPER] [resolverCaptcha] Filas encontradas en la grilla: ${rowsCount}`);
      
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
      });

      /* console.log */ void(`[SCRAPER] [resolverCaptcha] Certificados extraídos exitosamente: ${JSON.stringify(certificados, null, 2)}`);

      this.logger.registrar({
        timestamp: Date.now(),
        correo: session.correo,
        tipoDocumento,
        numeroDocumento,
        resultado: 'exitosa',
      });

      return { ok: true, certificados };
    } catch (e) {
      console.error("[SCRAPER ERROR CAPTCHA]", e);
      this.logger.registrar({
        timestamp: Date.now(),
        correo: session.correo,
        tipoDocumento,
        numeroDocumento,
        resultado: 'captcha_incorrecto',
      });
      return { ok: false, error: 'CAPTCHA_INVALIDO_O_ERROR' };
    } finally {
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
