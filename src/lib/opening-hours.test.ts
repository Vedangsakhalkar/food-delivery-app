import { describe, expect, it } from "vitest";
import { formatHHMM, isOpenNow } from "@/lib/opening-hours";

// IST = UTC+5:30, so 12:00Z is 17:30 IST.
const ist = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  const total = (h * 60 + m - 330 + 1440) % 1440;
  return new Date(Date.UTC(2026, 10, 14, Math.floor(total / 60), total % 60));
};

describe("isOpenNow", () => {
  it("is open inside normal hours; opening inclusive, closing exclusive", () => {
    expect(isOpenNow("11:00", "23:00", ist("12:00"))).toBe(true);
    expect(isOpenNow("11:00", "23:00", ist("11:00"))).toBe(true);
    expect(isOpenNow("11:00", "23:00", ist("23:00"))).toBe(false);
    expect(isOpenNow("11:00", "23:00", ist("10:59"))).toBe(false);
    expect(isOpenNow("11:00", "23:00", ist("00:30"))).toBe(false);
  });

  it("handles overnight hours past midnight", () => {
    expect(isOpenNow("18:00", "02:00", ist("23:30"))).toBe(true);
    expect(isOpenNow("18:00", "02:00", ist("00:30"))).toBe(true);
    expect(isOpenNow("18:00", "02:00", ist("02:00"))).toBe(false);
    expect(isOpenNow("18:00", "02:00", ist("12:00"))).toBe(false);
    expect(isOpenNow("18:00", "02:00", ist("18:00"))).toBe(true);
  });

  it("uses IST regardless of the host time zone", () => {
    // 20:00Z is 01:30 IST the next day
    expect(isOpenNow("00:00", "02:00", new Date("2026-11-14T20:00:00Z"))).toBe(true);
    expect(isOpenNow("09:00", "17:00", new Date("2026-11-14T20:00:00Z"))).toBe(false);
  });

  it("treats identical open and close as closed", () => {
    expect(isOpenNow("10:00", "10:00", ist("10:00"))).toBe(false);
  });
});

describe("formatHHMM", () => {
  it.each([
    ["18:00", "6:00 pm"],
    ["00:05", "12:05 am"],
    ["12:00", "12:00 pm"],
    ["09:30", "9:30 am"],
  ])("%s -> %s", (input, out) => expect(formatHHMM(input)).toBe(out));
});
