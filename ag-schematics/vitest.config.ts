import { defineConfig } from 'vitest/config';

const noCoverageFiles = [
    './src/utils/dependency.ts',
    './src/utils/eol.ts',
    './src/utils/json-file.ts',
    './src/utils/test/tree-helpers.ts'
]
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
      exclude: ['out/**/*_spec.js', 'out/utils/dependency_spec.js', '**/node_modules/**', ...noCoverageFiles ],
      reporter: ['text', 'html', 'lcov', 'json-summary', 'json'],
    },
  },
});
