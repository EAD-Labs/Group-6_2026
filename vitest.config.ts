import react from "@vitejs/plugin-react";
import { configDefaults, defineConfig } from "vitest/config";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    exclude: [...configDefaults.exclude, "e2e/**"],
    // Keep DOM-heavy classroom journeys and WASM PostgreSQL suites from
    // exhausting worker CPU/memory when they run together locally or in CI.
    maxWorkers: process.env.CI ? 2 : 4,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
  },
});
