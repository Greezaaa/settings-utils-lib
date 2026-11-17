import { resolve } from 'path';
import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^@su-labs\/core\/(.+)$/,
        replacement: resolve(
          __dirname,
          'projects/su-labs/core/$1/src/public-api.ts'
        ),
      },
      {
        find: /^@su-labs\/table$/,
        replacement: resolve(
          __dirname,
          'dist/su-labs/table/fesm2022/su-labs-table.mjs'
        ),
      },
      {
        find: /^@su-labs\/core$/,
        replacement: resolve(
          __dirname,
          'projects/su-labs/core/src/public-api.ts'
        ),
      },
    ],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    exclude: [...configDefaults.exclude],
    setupFiles: resolve(__dirname, 'vitest.setup.ts'),
    coverage: {
      reporter: ['text', 'html'],
    },
  },
});
