import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on',
    headless: true,
    actionTimeout: 10_000,
  },
  // Intentionally no webServer: tests will use an already-running dev server at 127.0.0.1:3000
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
