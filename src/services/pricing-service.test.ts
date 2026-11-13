import { describe, expect, it } from "vitest";
import { calculatePrice } from "@/services/pricing-service";

describe("calculatePrice", () => {
  it("adds subtotal, tax and delivery fee in integer paise", () => {
    const p = calculatePrice([
      { unitPricePaise: 32000, qty: 1 },
      { unitPricePaise: 5000, qty: 2 },
    ]);
    expect(p).toEqual({
      subtotalPaise: 42000,
      taxPaise: 2100,
      deliveryFeePaise: 3000,
      totalPaise: 47100,
    });
  });

  it("rounds tax half-up exactly once on the subtotal", () => {
    // 5% of 10 paise = 0.5 paise -> rounds up to 1
    expect(calculatePrice([{ unitPricePaise: 10, qty: 1 }]).taxPaise).toBe(1);
    // 5% of 9 paise = 0.45 -> 0
    expect(calculatePrice([{ unitPricePaise: 9, qty: 1 }]).taxPaise).toBe(0);
    // no per-line rounding drift: 3 x 33 paise = 99 -> 4.95 -> 5 (per-line would give 3 x 2 = 6)
    expect(calculatePrice([{ unitPricePaise: 33, qty: 3 }]).taxPaise).toBe(5);
  });

  it("returns zero for an empty cart (no delivery fee)", () => {
    expect(calculatePrice([])).toEqual({
      subtotalPaise: 0,
      taxPaise: 0,
      deliveryFeePaise: 0,
      totalPaise: 0,
    });
  });

  it("total always equals the sum of its parts", () => {
    for (const price of [1, 99, 12345, 99999]) {
      for (const qty of [1, 3, 20]) {
        const p = calculatePrice([{ unitPricePaise: price, qty }]);
        expect(p.totalPaise).toBe(p.subtotalPaise + p.taxPaise + p.deliveryFeePaise);
        expect(Number.isInteger(p.totalPaise)).toBe(true);
      }
    }
  });
});
