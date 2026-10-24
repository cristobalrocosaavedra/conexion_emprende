import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    include: ["packages/**/*.test.ts", "tests/release/**/*.test.mjs"],
    maxWorkers: 2,
  },
});
