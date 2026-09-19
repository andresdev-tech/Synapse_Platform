interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface UserRateLimitData {
  timestamps: number[];
}

export class ChatbotRateLimiter {
  private dailyLimits = new Map<string, UserRateLimitData>();
  private ddosLimits = new Map<string, UserRateLimitData>();

  private dailyConfig: RateLimitConfig = { maxRequests: 30, windowMs: 24 * 60 * 60 * 1000 };
  private ddosConfig: RateLimitConfig = { maxRequests: 10, windowMs: 5 * 60 * 1000 };

  private cleanOldTimestamps(data: UserRateLimitData, windowMs: number, now: number) {
    data.timestamps = data.timestamps.filter((t) => now - t < windowMs);
  }

  public checkRateLimit(userId: string): { allowed: boolean; reason?: string } {
    const now = Date.now();

    // DDoS Check
    let ddosData = this.ddosLimits.get(userId);
    if (!ddosData) {
      ddosData = { timestamps: [] };
      this.ddosLimits.set(userId, ddosData);
    }
    this.cleanOldTimestamps(ddosData, this.ddosConfig.windowMs, now);
    if (ddosData.timestamps.length >= this.ddosConfig.maxRequests) {
      return { allowed: false, reason: 'Demasiadas solicitudes en poco tiempo. Por favor espera 5 minutos.' };
    }

    // Daily Check
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

  public recordRequest(userId: string) {
    const now = Date.now();

    let ddosData = this.ddosLimits.get(userId);
    if (ddosData) ddosData.timestamps.push(now);

    let dailyData = this.dailyLimits.get(userId);
    if (dailyData) dailyData.timestamps.push(now);
  }
}

export const chatRateLimiter = new ChatbotRateLimiter();
