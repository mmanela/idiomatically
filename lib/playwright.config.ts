import { defineConfig, devices } from '@playwright/test';

const apiUrl = 'http://localhost:8100';
const clientUrl = 'http://localhost:3100';
const mongoDatabase = 'idiomatically-e2e';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],
  globalSetup: require.resolve('./e2e/global-setup'),
  use: {
    baseURL: clientUrl,
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
  webServer: [
    {
      name: 'api',
      command: 'node -r ts-node/register server/bootstrap.ts',
      url: `${apiUrl}/hello`,
      timeout: 120_000,
      reuseExistingServer: false,
      env: {
        ...process.env,
        NODE_ENV: 'development',
        TS_NODE_PROJECT: 'server/tsconfig.json',
        PORT: '8100',
        DB_CONNECTION: 'mongodb://localhost:27017',
        MONGO_DB: mongoDatabase,
        SERVER_URL: apiUrl,
        CLIENT_URL: clientUrl,
        GOOGLE_CLIENT_ID: 'e2e-disabled',
        GOOGLE_CLIENT_SECRET: 'e2e-disabled',
        LOCAL_AUTH_ENABLED: 'true',
        ADMIN_EMAILS: ''
      }
    },
    {
      name: 'client',
      command: 'react-app-rewired start',
      url: clientUrl,
      timeout: 120_000,
      reuseExistingServer: false,
      env: {
        ...process.env,
        PORT: '3100',
        BROWSER: 'none',
        REACT_APP_SERVER: apiUrl
      }
    }
  ]
});
