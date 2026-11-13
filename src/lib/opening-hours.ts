const IST = "Asia/Kolkata";

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/** Minutes since midnight in IST for the given instant. */
export function istMinutes(now: Date): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: IST,
  }).formatToParts(now);
  const h = Number(parts.find((p) => p.type === "hour")?.value);
  const m = Number(parts.find((p) => p.type === "minute")?.value);
  return h * 60 + m;
}

/**
 * Is a restaurant open at `now` (IST)? Opening time is inclusive, closing time exclusive.
 * Overnight hours (closing before opening, e.g. 18:00-02:00) wrap past midnight.
 * Single source of truth: also used by the order service to refuse orders when closed.
 */
export function isOpenNow(opensAt: string, closesAt: string, now: Date = new Date()): boolean {
  const open = toMinutes(opensAt);
  const close = toMinutes(closesAt);
  const t = istMinutes(now);
  if (open === close) return false;
  return open < close ? t >= open && t < close : t >= open || t < close;
}

/** "6:00 pm" for an "18:00" value. */
export function formatHHMM(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, "0")} ${suffix}`;
}
