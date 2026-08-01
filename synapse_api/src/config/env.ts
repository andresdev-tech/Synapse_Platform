// src/config/env.ts

import "dotenv/config";

export const env = {
  PORT: Number(process.env.PORT) || 3000,
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_SECRET: process.env.JWT_SECRET!,
  QWEN_API_KEY: process.env.QWEN_API_KEY!,
};