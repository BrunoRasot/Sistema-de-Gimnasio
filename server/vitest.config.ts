import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      reportsDirectory: 'coverage',
      include: ['src/**/*.ts'],
      exclude: [
        'src/tests/**',
        'src/index.ts',
        'src/server.ts',
        'src/prisma/**',
        'src/utils/emailTemplate.ts',
      ],
      thresholds: {
        statements: 60,
        branches: 50,
        functions: 55,
        lines: 65,
      },
    },
  },
});
