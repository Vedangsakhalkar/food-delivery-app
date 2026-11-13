const IST = "Asia/Kolkata";

/** Formats integer paise as rupees, e.g. 61800 -> "₹618" and 61850 -> "₹618.50". */
export function formatMoney(paise: number): string {
  const rupees = paise / 100;
  const whole = Number.isInteger(rupees);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(rupees);
}

/** Converts a rupee amount typed by a user (e.g. "199.5") to integer paise. */
export function rupeesToPaise(value: string | number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) throw new Error("Invalid amount");
  return Math.round(n * 100);
}

/** e.g. "8 Nov 2026" in IST. */
export function formatDate(input: Date | string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: IST,
  }).format(new Date(input));
}

/** e.g. "7:42 pm" in IST. */
export function formatTimeIST(input: Date | string): string {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: IST,
  }).format(new Date(input));
}

/** e.g. "8 Nov 2026, 7:42 pm" in IST. */
export function formatDateTime(input: Date | string): string {
  return `${formatDate(input)}, ${formatTimeIST(input)}`;
}
