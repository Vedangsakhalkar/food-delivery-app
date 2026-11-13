import { describe, expect, it } from "vitest";
import { EnvError, parseServerEnv } from "@/lib/env";

const valid = {
  NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "pub",
  SUPABASE_SERVICE_ROLE_KEY: "secret",
  DATABASE_URL: "postgres://u:p@h/db",
};

describe("parseServerEnv", () => {
  it("accepts a valid environment and applies defaults", () => {
    const env = parseServerEnv(valid);
    expect(env.SUPABASE_STORAGE_BUCKET).toBe("images");
    expect(env.EMAIL_FROM).toBe("onboarding@resend.dev");
  });

  it("names missing variables without leaking values", () => {
    try {
      parseServerEnv({ ...valid, DATABASE_URL: undefined, SUPABASE_SERVICE_ROLE_KEY: "" });
      expect.unreachable();
    } catch (e) {
      expect(e).toBeInstanceOf(EnvError);
      const msg = (e as Error).message;
      expect(msg).toContain("DATABASE_URL");
      expect(msg).toContain("SUPABASE_SERVICE_ROLE_KEY");
      expect(msg).not.toContain("postgres://");
    }
  });
});
