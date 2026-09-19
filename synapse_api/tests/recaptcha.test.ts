import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { AuthService } from '../src/modules/auth/auth.service';

describe('Critical reCAPTCHA Security & Validation Test Suite (Standard Google reCAPTCHA)', () => {
  const ORIGINAL_ENV = process.env;
  const TEST_SECRET_KEY = '6LeIx0cTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';
  const MOCK_VALID_TOKEN = 'valid-recaptcha-token-abc123xyz';
  const TARGET_USER_EMAIL = 'aprendiz@soy.sena.edu.co';
  const TARGET_ADMIN_EMAIL = 'admin@soy.sena.edu.co';

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...ORIGINAL_ENV, RECAPTCHA_SECRET_KEY: TEST_SECRET_KEY };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
    vi.restoreAllMocks();
  });

  // =========================================================================
  // 1. HAPPY PATH: Token válido y cumplimiento del protocolo
  // =========================================================================
  describe('1. Happy Path & Protocol Compliance', () => {
    it('debería comunicarse con Google siteverify con formato x-www-form-urlencoded y permitir OTP si el token es válido', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          challenge_ts: new Date().toISOString(),
          hostname: 'synapse.edu.co',
        }),
      } as any);

      const authServiceSpy = vi.spyOn(AuthService, 'requestOtp').mockResolvedValueOnce({
        success: true,
        data: { email: TARGET_USER_EMAIL },
      });

      const response = await request(app)
        .post('/api/auth/otp/request')
        .send({
          email: TARGET_USER_EMAIL,
          captchaToken: MOCK_VALID_TOKEN,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verificación estricta de la petición saliente a la API de Google
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const [calledUrl, fetchOptions] = fetchSpy.mock.calls[0];
      expect(calledUrl).toBe('https://www.google.com/recaptcha/api/siteverify');
      expect(fetchOptions?.method).toBe('POST');
      expect((fetchOptions?.headers as Record<string, string>)['Content-Type']).toBe('application/x-www-form-urlencoded');
      expect(fetchOptions?.body).toBe(
        `secret=${encodeURIComponent(TEST_SECRET_KEY)}&response=${encodeURIComponent(MOCK_VALID_TOKEN)}`
      );

      // Verificar que el servicio downstream se ejecutó
      expect(authServiceSpy).toHaveBeenCalledTimes(1);
    });

    it('debería permitir login admin cuando el captcha es válido y el usuario tiene privilegios', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as any);

      const authAdminSpy = vi.spyOn(AuthService, 'loginAdmin').mockResolvedValueOnce({
        success: true,
        data: {
          token: 'mock-jwt-token',
          user: { id: 'admin-1', name: 'Admin', email: TARGET_ADMIN_EMAIL, role: 'ADMIN' },
        },
      });

      const response = await request(app)
        .post('/api/auth/loginadmin')
        .send({
          email: TARGET_ADMIN_EMAIL,
          captchaToken: MOCK_VALID_TOKEN,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(authAdminSpy).toHaveBeenCalledTimes(1);
    });
  });

  // =========================================================================
  // 2. CRITICAL DEFENSE: Evasión por Token Ausente o Vacío (Bot Mitigation)
  // =========================================================================
  describe('2. Bypass & Missing Token Defense (Bot Mitigation)', () => {
    it('CRÍTICO: debe rechazar inmediatamente la petición si no se envía captchaToken', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch');
      const authServiceSpy = vi.spyOn(AuthService, 'requestOtp');

      const response = await request(app)
        .post('/api/auth/otp/request')
        .send({
          email: TARGET_USER_EMAIL,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Por favor, completa el reCAPTCHA');

      // CRÍTICO: No debe gastar recursos llamando a Google ni ejecutar AuthService
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(authServiceSpy).not.toHaveBeenCalled();
    });

    it('CRÍTICO: debe rechazar si captchaToken es null', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch');
      const authServiceSpy = vi.spyOn(AuthService, 'requestOtp');

      const response = await request(app)
        .post('/api/auth/otp/request')
        .send({
          email: TARGET_USER_EMAIL,
          captchaToken: null,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Por favor, completa el reCAPTCHA');
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(authServiceSpy).not.toHaveBeenCalled();
    });

    it('CRÍTICO: debe rechazar en loginadmin si captchaToken es omitido', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch');
      const authAdminSpy = vi.spyOn(AuthService, 'loginAdmin');

      const response = await request(app)
        .post('/api/auth/loginadmin')
        .send({
          email: TARGET_ADMIN_EMAIL,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Por favor, completa el reCAPTCHA');
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(authAdminSpy).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // 3. REJECTION & ATTACK RESISTANCE: Tokens Inválidos, Falsificados o Repetidos
  // =========================================================================
  describe('3. Rejection & Attack Resistance (Forged Tokens & Replay Attacks)', () => {
    it('CRÍTICO: debe rechazar token falsificado cuando Google devuelve invalid-input-response', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          'error-codes': ['invalid-input-response'],
        }),
      } as any);

      const authServiceSpy = vi.spyOn(AuthService, 'requestOtp');

      const response = await request(app)
        .post('/api/auth/otp/request')
        .send({
          email: TARGET_USER_EMAIL,
          captchaToken: 'forged_fake_token_123',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Error al validar el reCAPTCHA');
      expect(authServiceSpy).not.toHaveBeenCalled();
    });

    it('CRÍTICO: debe mitigar ataques de repetición (Replay Attack) cuando Google devuelve timeout-or-duplicate', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          'error-codes': ['timeout-or-duplicate'],
        }),
      } as any);

      const authServiceSpy = vi.spyOn(AuthService, 'requestOtp');

      const response = await request(app)
        .post('/api/auth/otp/request')
        .send({
          email: TARGET_USER_EMAIL,
          captchaToken: 'previously_used_token_456',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Error al validar el reCAPTCHA');
      expect(authServiceSpy).not.toHaveBeenCalled();
    });

    it('CRÍTICO: debe rechazar tokens con caracteres maliciosos (XSS, SQLi, inyección) codificándolos de forma segura', async () => {
      const maliciousToken = '<script>alert("xss")</script>\' OR 1=1 -- &secret=injected';
      
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          'error-codes': ['invalid-input-response'],
        }),
      } as any);

      const response = await request(app)
        .post('/api/auth/otp/request')
        .send({
          email: TARGET_USER_EMAIL,
          captchaToken: maliciousToken,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Error al validar el reCAPTCHA');

      const [, fetchOptions] = fetchSpy.mock.calls[0];
      expect(fetchOptions?.body).toContain(encodeURIComponent(maliciousToken));
      expect(fetchOptions?.body).not.toContain('<script>');
    });
  });

  // =========================================================================
  // 4. FAIL-CLOSED STRATEGY & NETWORK RESILIENCE: Caídas de red o errores de Google
  // =========================================================================
  describe('4. Fail-Closed Strategy & Infrastructure Resilience', () => {
    it('CRÍTICO: debe aplicar fail-closed y retornar 500 seguro si la llamada de red a Google falla (DNS/Timeout)', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('ECONNRESET - Google unreachable'));

      const authServiceSpy = vi.spyOn(AuthService, 'requestOtp');

      const response = await request(app)
        .post('/api/auth/otp/request')
        .send({
          email: TARGET_USER_EMAIL,
          captchaToken: MOCK_VALID_TOKEN,
        });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('No se pudo enviar el código.');
      expect(authServiceSpy).not.toHaveBeenCalled();
    });

    it('CRÍTICO: debe manejar respuestas corruptas / no-JSON de Google sin colapsar el proceso Node', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        json: async () => {
          throw new SyntaxError('Unexpected token < in JSON at position 0 (HTML Gateway Error)');
        },
      } as any);

      const authServiceSpy = vi.spyOn(AuthService, 'requestOtp');

      const response = await request(app)
        .post('/api/auth/otp/request')
        .send({
          email: TARGET_USER_EMAIL,
          captchaToken: MOCK_VALID_TOKEN,
        });

      expect(response.status).toBe(500);
      expect(authServiceSpy).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // 5. SECRETS SANITIZATION & ENVIRONMENT ISOLATION: Fuga de llaves privadas
  // =========================================================================
  describe('5. Secret Key Leak Prevention & Environment Isolation', () => {
    it('CRÍTICO: Jamás debe exponer la RECAPTCHA_SECRET_KEY en la respuesta al cliente', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          'error-codes': ['invalid-input-secret'],
        }),
      } as any);

      const response = await request(app)
        .post('/api/auth/otp/request')
        .send({
          email: TARGET_USER_EMAIL,
          captchaToken: MOCK_VALID_TOKEN,
        });

      const responseString = JSON.stringify(response.body) + JSON.stringify(response.headers);
      expect(responseString).not.toContain(TEST_SECRET_KEY);
    });

    it('debería permitir modo desarrollo cuando RECAPTCHA_SECRET_KEY no está configurada o es "dummy"', async () => {
      process.env.RECAPTCHA_SECRET_KEY = 'dummy';
      const fetchSpy = vi.spyOn(globalThis, 'fetch');

      const authServiceSpy = vi.spyOn(AuthService, 'requestOtp').mockResolvedValueOnce({
        success: true,
        data: { email: TARGET_USER_EMAIL },
      });

      const response = await request(app)
        .post('/api/auth/otp/request')
        .send({
          email: TARGET_USER_EMAIL,
        });

      expect(response.status).toBe(200);
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(authServiceSpy).toHaveBeenCalledTimes(1);
    });
  });
});
