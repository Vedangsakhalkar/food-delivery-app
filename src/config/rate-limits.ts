/** All rate limits in one place: max requests per window, per user (or per IP when logged out). */
export const RATE_LIMITS = {
  /** Placing orders */
  orders: { max: 10, windowMs: 60_000 },
  /** Price quotes while building a cart */
  quote: { max: 60, windowMs: 60_000 },
  /** Image uploads */
  uploads: { max: 20, windowMs: 60_000 },
  /** Account creation (per IP) */
  signup: { max: 5, windowMs: 60_000 },
  /** Order status changes by owners, cancellations, reviews */
  writes: { max: 60, windowMs: 60_000 },
} as const;
