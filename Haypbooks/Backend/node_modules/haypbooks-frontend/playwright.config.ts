import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src/__tests__/e2e',
  timeout: 60_000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:3000',
    // Retain traces on failure so CI can upload them; `retain-on-failure` keeps traces for failed tests
    trace: 'retain-on-failure',
    // take screenshots on failure and capture videos for failed tests to help CI debugging
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: true,
    actionTimeout: 10_000,
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
