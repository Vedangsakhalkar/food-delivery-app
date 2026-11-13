import { describe, expect, it } from "vitest";
import { clientIp, createRateLimiter, enforce } from "@/lib/rate-limit";
import { RateLimitError } from "@/lib/errors";
import { toErrorResponse } from "@/lib/handle-error";

describe("createRateLimiter", () => {
  it("allows up to max requests per window, then blocks with a retry time", () => {
    let t = 0;
    const l = createRateLimiter({ max: 3, windowMs: 10_000 }, () => t);
    expect([1, 2, 3].map(() => l.check("a").ok)).toEqual([true, true, true]);
    const blocked = l.check("a");
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSeconds).toBe(10);
    t = 4000;
    expect(l.check("a").retryAfterSeconds).toBe(6);
  });

  it("counts keys independently and resets after the window", () => {
    let t = 0;
    const l = createRateLimiter({ max: 1, windowMs: 1000 }, () => t);
    expect(l.check("a").ok).toBe(true);
    expect(l.check("b").ok).toBe(true);
    expect(l.check("a").ok).toBe(false);
    t = 1000;
    expect(l.check("a").ok).toBe(true);
  });

  it("reports remaining requests", () => {
    const l = createRateLimiter({ max: 2, windowMs: 1000 });
    expect(l.check("k").remaining).toBe(1);
    expect(l.check("k").remaining).toBe(0);
  });
});

describe("enforce", () => {
  it("throws a 429 RateLimitError whose response has Retry-After and the standard body", async () => {
    const l = createRateLimiter({ max: 1, windowMs: 30_000 });
    enforce(l, "u1");
    let err: unknown;
    try {
      enforce(l, "u1");
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(RateLimitError);
    const res = toErrorResponse(err);
    expect(res.status).toBe(429);
    expect(res.headers.get("retry-after")).toBe("30");
    expect((await res.json()).error.code).toBe("rate_limited");
  });
});

describe("clientIp", () => {
  it("uses the first x-forwarded-for entry", () => {
    const req = new Request("http://x", { headers: { "x-forwarded-for": "1.2.3.4, 10.0.0.1" } });
    expect(clientIp(req)).toBe("1.2.3.4");
    expect(clientIp(new Request("http://x"))).toBe("unknown");
  });
});
