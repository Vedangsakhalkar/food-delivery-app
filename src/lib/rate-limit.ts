import { RateLimitError } from "@/lib/errors";

export interface LimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

/**
 * Fixed-window in-memory limiter. MVP limitation: state is per server instance, so on a serverless
 * host each instance counts separately. The interface is small so it can be swapped for Redis later.
 */
export function createRateLimiter(
  opts: { max: number; windowMs: number },
  now: () => number = Date.now,
) {
  const hits = new Map<string, { count: number; resetAt: number }>();

  return {
    check(key: string): LimitResult {
      const t = now();
      // opportunistic cleanup so the map cannot grow without bound
      if (hits.size > 5000) {
        for (const [k, v] of hits) if (v.resetAt <= t) hits.delete(k);
      }
      let entry = hits.get(key);
      if (!entry || entry.resetAt <= t) {
        entry = { count: 0, resetAt: t + opts.windowMs };
        hits.set(key, entry);
      }
      entry.count++;
      const ok = entry.count <= opts.max;
      return {
        ok,
        remaining: Math.max(0, opts.max - entry.count),
        retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - t) / 1000)),
      };
    },
  };
}

export type RateLimiter = ReturnType<typeof createRateLimiter>;

/** Best-effort client IP behind a proxy (Vercel sets x-forwarded-for). */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

/** Throws RateLimitError (429 + Retry-After) when the key has used up its window. */
export function enforce(limiter: RateLimiter, key: string): void {
  const r = limiter.check(key);
  if (!r.ok) throw new RateLimitError("Too many requests. Please slow down.", r.retryAfterSeconds);
}
