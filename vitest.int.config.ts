import { defineConfig } from "vitest/config";
import path from "node:path";

/** Integration tests hit the real dev Supabase database. Run: npm run test:int */
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "server-only": path.resolve(__dirname, "src/test/server-only-stub.ts"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.int.test.ts"],
    testTimeout: 30000,
    fileParallelism: false,
  },
});
