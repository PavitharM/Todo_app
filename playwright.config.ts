import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 45000,
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:8081",
    channel: "chrome",
    viewport: { width: 390, height: 844 },
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  reporter: "list",
});
