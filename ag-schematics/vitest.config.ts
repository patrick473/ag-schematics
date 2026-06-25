import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['out/**/*_spec.js'],
    exclude: ['**/node_modules/**', 'out/utils/dependency_spec.js'],
    coverage: {
      provider: 'v8',
      reportsDirectory: 'coverage',
      include: ['out/**/*.js'],
      exclude: ['out/**/*_spec.js', 'out/utils/dependency_spec.js', '**/node_modules/**'],
      reporter: ['text', 'html', 'lcov', 'json-summary', 'json'],
    },
  },
});
