import { defineConfig, devices } from '@playwright/test';

const PORT = 4320;

export default defineConfig({
  testDir: '.',
  testMatch: '*.e2e.ts',
  fullyParallel: true,
  use: { baseURL: `http://localhost:${PORT}`, serviceWorkers: 'block' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'phone', use: { ...devices['Pixel 7'] } },
  ],
  webServer: { command: 'node serve.mjs', port: PORT, reuseExistingServer: true, env: { PORT: String(PORT) } },
});
