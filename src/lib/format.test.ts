import { describe, expect, it } from "vitest";
import { formatDate, formatMoney, formatTimeIST, rupeesToPaise } from "@/lib/format";

describe("formatMoney", () => {
  it("formats whole and fractional rupees", () => {
    expect(formatMoney(61800)).toBe("₹618");
    expect(formatMoney(61850)).toBe("₹618.50");
    expect(formatMoney(0)).toBe("₹0");
    expect(formatMoney(12345600)).toBe("₹1,23,456");
  });
});

describe("rupeesToPaise", () => {
  it("converts without float drift", () => {
    expect(rupeesToPaise("199.99")).toBe(19999);
    expect(rupeesToPaise(0.1 + 0.2)).toBe(30);
    expect(() => rupeesToPaise("abc")).toThrow();
  });
});

describe("IST dates", () => {
  it("formats in Asia/Kolkata regardless of host time zone", () => {
    const d = "2026-11-08T14:12:00Z"; // 19:42 IST
    expect(formatTimeIST(d).toLowerCase()).toBe("7:42 pm");
    expect(formatDate(d)).toBe("8 Nov 2026");
  });
});
