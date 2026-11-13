import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 3100);
/** Point the suite at a deployed site (smoke test) instead of starting a local server. */
const REMOTE = process.env.E2E_BASE_URL;

/** End-to-end tests. `npm run e2e` starts its own server (dev locally, build+start in CI). */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: REMOTE ?? `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: REMOTE
    ? undefined
    : {
        command: process.env.CI
          ? `npm run build && npm run start -- -p ${PORT}`
          : `npm run dev -- -p ${PORT}`,
        url: `http://localhost:${PORT}`,
        reuseExistingServer: !process.env.CI,
        // The journey signs users in server-side. When the project's publishable key is missing locally,
        // E2E_ALLOW_SECRET_AS_ANON=1 lets the *local test server* use the secret key instead. This puts
        // the secret into that server's client bundle, so only ever use it on localhost, never in CI/deploys.
        env:
          !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.E2E_ALLOW_SECRET_AS_ANON
            ? { NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "" }
            : undefined,
        timeout: 240_000,
      },
});
