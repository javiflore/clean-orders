import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vitest/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.spec.ts', 'src/**/*.spec.ts'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules', 'dist', 'src/**/*.{test,spec}.ts'],
    },
  },
  resolve: {
    alias: {
      '@': __dirname + '/src',
      '@domain': resolve(__dirname, '/src/domain'),
      '@application': resolve(__dirname, '/src/application'),
      '@infrastructure': resolve(__dirname, '/src/infrastructure'),
      '@composition': resolve(__dirname, '/src/composition'),
      '@shared': resolve(__dirname, '/src/shared'),
    },
  },
});
