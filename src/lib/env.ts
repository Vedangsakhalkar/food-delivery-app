import { z } from "zod";

/** Variables that are safe to expose to the browser. */
const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

/** Server-only variables. Never import this module from a component. */
const serverSchema = publicSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_STORAGE_BUCKET: z.string().min(1).default("images"),
  DATABASE_URL: z.string().min(1),
  DATABASE_URL_MIGRATIONS: z.string().min(1).optional(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().min(1).default("onboarding@resend.dev"),
});

export type ServerEnv = z.infer<typeof serverSchema>;
export type PublicEnv = z.infer<typeof publicSchema>;

export class EnvError extends Error {
  constructor(public readonly missing: string[]) {
    super(`Invalid or missing environment variables: ${missing.join(", ")}. See .env.example.`);
    this.name = "EnvError";
  }
}

/** Validates a source (usually process.env). Reports variable names only, never values. */
export function parseServerEnv(source: Record<string, string | undefined>): ServerEnv {
  const result = serverSchema.safeParse(source);
  if (!result.success) {
    throw new EnvError([...new Set(result.error.issues.map((i) => String(i.path[0])))]);
  }
  return result.data;
}

let cached: ServerEnv | undefined;

/** Lazily validated server config. Throws EnvError with a clear message on first use. */
export function getEnv(): ServerEnv {
  cached ??= parseServerEnv(process.env);
  return cached;
}

/** Public config. Property access must be literal so Next can inline NEXT_PUBLIC_ vars. */
export function getPublicEnv(): PublicEnv {
  const result = publicSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
  if (!result.success) {
    throw new EnvError([...new Set(result.error.issues.map((i) => String(i.path[0])))]);
  }
  return result.data;
}
