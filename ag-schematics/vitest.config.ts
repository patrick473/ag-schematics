import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['out/**/*_spec.js'],
    exclude: ['**/node_modules/**', 'out/utils/dependency_spec.js'],
  },
});
