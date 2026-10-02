import { defineConfig, devices } from '@playwright/test';

const appUrl = 'http://localhost:3100';
const mongoDatabase = 'idiomatically-e2e';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],
  globalSetup: './e2e/global-setup.ts',
  use: {
    baseURL: appUrl,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  webServer: {
    name: 'app',
    command: 'npm run dev',
    url: `${appUrl}/hello`,
    timeout: 120_000,
    reuseExistingServer: false,
    env: {
      ...process.env,
      NODE_ENV: 'development',
      PORT: '3100',
      DB_CONNECTION: 'mongodb://localhost:27017',
      MONGO_DB: mongoDatabase,
      SERVER_URL: appUrl,
      GOOGLE_CLIENT_ID: 'e2e-disabled',
      GOOGLE_CLIENT_SECRET: 'e2e-disabled',
      LOCAL_AUTH_ENABLED: 'true',
      ADMIN_EMAILS: '',
      BETTER_AUTH_SECRET: 'idiomatically-e2e-secret-at-least-thirty-two-characters',
      VITE_HMR_PORT: '24679'
    }
  }
});
