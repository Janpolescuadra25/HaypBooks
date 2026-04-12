import { defineConfig, devices } from '@playwright/test'
import path from 'path'

const STORAGE_STATE = path.join('tests', '.auth', 'user.json')

export default defineConfig({
  testDir: './tests',
  // Only pick up Playwright spec files; exclude Jest .test.ts files in api/ and a11y/
  testMatch: ['**/sales/**/*.spec.ts', '**/auth.setup.ts'],
  timeout: 30_000,
  expect: { timeout: 8000 },
  fullyParallel: false, // auth setup must complete first
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'tests/playwright-report' }]],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: true,
    actionTimeout: 15_000,
  },
  // Auto-start Next.js dev server if not already running
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120_000,
    env: { NODE_OPTIONS: '--max-old-space-size=4096' },
  },
  projects: [
    // Auth setup runs first; saves storage state to tests/.auth/user.json
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    // All other tests use saved storage state
    {
      name: 'chromium',
      testMatch: ['**/sales/**/*.spec.ts'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: STORAGE_STATE,
      },
      dependencies: ['setup'],
    },
  ],
})
