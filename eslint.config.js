import expoConfig from 'eslint-config-expo/flat.js';
import prettierPlugin from 'eslint-plugin-prettier';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  expoConfig,
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'error',
    },
    ignores: ['dist/*', 'node_modules/*', '.expo/*'],
  },
]);
