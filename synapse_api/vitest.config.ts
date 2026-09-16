import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./src/__mocks__/prisma.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    env: {
      QWEN_API_KEY: 'test_key',
      JWT_SECRET: 'test_secret',
      DATABASE_URL: 'postgres://test:test@localhost:5432/test'
    }
  },
});
