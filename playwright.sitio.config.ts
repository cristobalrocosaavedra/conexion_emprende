import { defineConfig, devices } from "@playwright/test";
// Sitio web estático (apps/web/out) servido como en Cloudflare Pages.
export default defineConfig({
  testDir: "./tests/sitio",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "list",
  use: {
    ...devices["Desktop Chrome"],
    viewport: { width: 1366, height: 900 },
    baseURL: "http://127.0.0.1:3013",
    launchOptions: {
      args: ["--enable-unsafe-swiftshader"],
      executablePath: process.env.PW_CHROMIUM_PATH || undefined,
    },
    trace: "retain-on-failure",
  },
  webServer: {
    command: "node scripts/web/servir-sitio.mjs",
    url: "http://127.0.0.1:3013",
    reuseExistingServer: !process.env.CI,
    timeout: 20000,
  },
});
