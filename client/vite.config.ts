import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
  build: {
    // ExcelJS se carga como chunk independiente y minificado; su tamaño conocido
    // supera el umbral genérico de Vite sin afectar el bundle inicial.
    chunkSizeWarningLimit: 1000,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      reportsDirectory: 'coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/test/**',
        'src/setupTests.ts',
        'src/main.tsx',
        'src/components/ui/**',
        'src/types/**',
      ],
      thresholds: {
        statements: 28,
        branches: 20,
        functions: 23,
        lines: 32,
      },
    },
  },
});
