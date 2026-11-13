import { describe, expect, it } from "vitest";
import { RESTAURANTS } from "../../db/seed-data";
import { restaurantSchema } from "@/validators/restaurant";

describe("demo seed data", () => {
  it("has 6-30 restaurants with unique slugs and several cuisines", () => {
    expect(RESTAURANTS.length).toBeGreaterThanOrEqual(6);
    expect(RESTAURANTS.length).toBeLessThanOrEqual(30);
    expect(new Set(RESTAURANTS.map((r) => r.slug)).size).toBe(RESTAURANTS.length);
    expect(new Set(RESTAURANTS.flatMap((r) => r.cuisine.split(","))).size).toBeGreaterThan(5);
  });

  it.each(RESTAURANTS.map((r) => [r.name, r] as const))(
    "%s passes the same validation as the app",
    (_n, r) => {
      expect(
        restaurantSchema.safeParse({
          name: r.name,
          cuisine: r.cuisine,
          address: r.address,
          opensAt: r.opensAt,
          closesAt: r.closesAt,
          deliveryTimeMin: r.deliveryTimeMin,
        }).success,
      ).toBe(true);
      for (const c of r.categories) {
        expect(c.items.length).toBeGreaterThan(0);
        for (const i of c.items) {
          expect(i.price).toBeGreaterThan(0);
          expect(i.emoji.length).toBeGreaterThan(0);
        }
      }
      const names = r.categories.map((c) => c.name.toLowerCase());
      expect(new Set(names).size).toBe(names.length);
    },
  );

  it("every dish name is unique within its restaurant (the seed matches rows by name)", () => {
    for (const r of RESTAURANTS) {
      const names = r.categories.flatMap((c) => c.items.map((i) => i.name.toLowerCase()));
      expect(new Set(names).size, r.name).toBe(names.length);
    }
  });
});
