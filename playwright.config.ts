import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/mobile",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "list",
  use: {
    ...devices["Pixel 7"],
    baseURL: "http://127.0.0.1:3012",
    launchOptions: {
      executablePath: process.env.PW_CHROMIUM_PATH || undefined,
    },
    trace: "retain-on-failure",
  },
  webServer: {
    command: "node scripts/serve-mobile.mjs",
    url: "http://127.0.0.1:3012",
    reuseExistingServer: !process.env.CI,
    timeout: 20000,
  },
});
