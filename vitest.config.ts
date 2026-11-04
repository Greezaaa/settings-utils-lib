import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    // Resolve @su-labs/core entry points to source so tests don't need a prior build
    alias: [
      { find: /^@su-labs\/core\/theme$/, replacement: resolve(__dirname, 'projects/su-labs/core/theme/src/public-api.ts') },
      { find: /^@su-labs\/core$/, replacement: resolve(__dirname, 'projects/su-labs/core/src/public-api.ts') },
    ],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: resolve(__dirname, 'vitest.setup.ts'),
    coverage: {
      reporter: ['text', 'html'],
    },
  },
});
