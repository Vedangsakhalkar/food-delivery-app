import { RATE_LIMITS } from "@/config/rate-limits";
import { createRateLimiter } from "@/lib/rate-limit";

/** Shared limiter instances (one per route group). */
export const limiters = {
  orders: createRateLimiter(RATE_LIMITS.orders),
  quote: createRateLimiter(RATE_LIMITS.quote),
  uploads: createRateLimiter(RATE_LIMITS.uploads),
  signup: createRateLimiter(RATE_LIMITS.signup),
  writes: createRateLimiter(RATE_LIMITS.writes),
};
