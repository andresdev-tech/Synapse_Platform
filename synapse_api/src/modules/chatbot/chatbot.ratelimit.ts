interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface UserRateLimitData {
  timestamps: number[];
}

/**
 * Limitador de frecuencia (Rate Limiter) en memoria para el Chatbot.
 * Controla dos niveles de restricción por usuario:
 * 1. Protección contra ráfagas/DDoS: máximo 10 peticiones en 5 minutos.
 * 2. Límite diario: máximo 30 mensajes en 24 horas.
 */
export class ChatbotRateLimiter {
  private dailyLimits = new Map<string, UserRateLimitData>();
  private ddosLimits = new Map<string, UserRateLimitData>();

  private dailyConfig: RateLimitConfig = { maxRequests: 30, windowMs: 24 * 60 * 60 * 1000 };
  private ddosConfig: RateLimitConfig = { maxRequests: 10, windowMs: 5 * 60 * 1000 };

  /**
   * Limpia las marcas de tiempo anteriores a la ventana de tiempo especificada.
   */
  private cleanOldTimestamps(data: UserRateLimitData, windowMs: number, now: number) {
    data.timestamps = data.timestamps.filter((t) => now - t < windowMs);
  }

  /**
   * Comprueba si el usuario tiene permitido realizar una nueva petición al chatbot según sus límites.
   */
  public checkRateLimit(userId: string): { allowed: boolean; reason?: string } {
    const now = Date.now();

    // Verificación de ráfagas / DDoS
    let ddosData = this.ddosLimits.get(userId);
    if (!ddosData) {
      ddosData = { timestamps: [] };
      this.ddosLimits.set(userId, ddosData);
    }
    this.cleanOldTimestamps(ddosData, this.ddosConfig.windowMs, now);
    if (ddosData.timestamps.length >= this.ddosConfig.maxRequests) {
      return { allowed: false, reason: 'Demasiadas solicitudes en poco tiempo. Por favor espera 5 minutos.' };
    }

    // Verificación de cuota diaria
    let dailyData = this.dailyLimits.get(userId);
    if (!dailyData) {
      dailyData = { timestamps: [] };
      this.dailyLimits.set(userId, dailyData);
    }
    this.cleanOldTimestamps(dailyData, this.dailyConfig.windowMs, now);
    if (dailyData.timestamps.length >= this.dailyConfig.maxRequests) {
      return { allowed: false, reason: 'Has alcanzado el límite de 30 mensajes por día.' };
    }

    return { allowed: true };
  }

  /**
   * Registra una nueva petición realizada por el usuario, guardando la marca de tiempo actual.
   */
  public recordRequest(userId: string) {
    const now = Date.now();

    let ddosData = this.ddosLimits.get(userId);
    if (ddosData) ddosData.timestamps.push(now);

    let dailyData = this.dailyLimits.get(userId);
    if (dailyData) dailyData.timestamps.push(now);
  }
}

export const chatRateLimiter = new ChatbotRateLimiter();

