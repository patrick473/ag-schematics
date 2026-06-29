// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';
import sheriff from '@softarc/eslint-plugin-sheriff';
import { defineConfig } from 'eslint/config';

export default defineConfig(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
  {
    plugins: { '@softarc/sheriff': sheriff },
    rules: { '@softarc/sheriff/dependency-rule': 'error' },
  },
  {
    rules: {
      '@typescript-eslint/no-empty-object-type': ['error', { allowInterfaces: 'always' }],
    },
  },
  {
    ignores: ['dist/**', 'out/**', 'coverage/**', 'node_modules/**'],
  },
);
