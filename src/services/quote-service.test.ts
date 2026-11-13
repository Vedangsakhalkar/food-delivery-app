import { describe, expect, it } from "vitest";
import { createQuoteService } from "@/services/quote-service";
import { cartSchema } from "@/validators/order";
import { NotFoundError } from "@/lib/errors";
import type { MenuItem } from "@/models/menu";
import type { Restaurant } from "@/models/restaurant";

const A = "11111111-1111-4111-8111-111111111111";
const B = "22222222-2222-4222-8222-222222222222";
const R = "33333333-3333-4333-8333-333333333333";
const restaurant = { id: R, name: "Spice", opensAt: "00:00", closesAt: "23:59" } as Restaurant;
const item = (id: string, price: number, over: Partial<MenuItem> = {}) =>
  ({
    id,
    restaurantId: R,
    name: `item-${id.slice(0, 1)}`,
    pricePaise: price,
    isVeg: true,
    isAvailable: true,
    ...over,
  }) as MenuItem;

const svc = (found: Restaurant | null, items: MenuItem[]) =>
  createQuoteService(
    { findActiveById: async () => found },
    { listByRestaurant: async () => items },
  );

const noon = new Date("2026-11-14T06:30:00Z"); // 12:00 IST

describe("cartSchema", () => {
  it("rejects empty carts, bad quantities and duplicate items", () => {
    expect(cartSchema.safeParse({ restaurantId: R, lines: [] }).success).toBe(false);
    expect(cartSchema.safeParse({ restaurantId: R, lines: [{ itemId: A, qty: 21 }] }).success).toBe(
      false,
    );
    expect(
      cartSchema.safeParse({
        restaurantId: R,
        lines: [
          { itemId: A, qty: 1 },
          { itemId: A, qty: 1 },
        ],
      }).success,
    ).toBe(false);
    expect(cartSchema.safeParse({ restaurantId: R, lines: [{ itemId: A, qty: 2 }] }).success).toBe(
      true,
    );
  });
});

describe("quoteService", () => {
  it("prices from database prices, ignoring anything the client claims", async () => {
    const cart = cartSchema.parse({
      restaurantId: R,
      lines: [
        { itemId: A, qty: 2 },
        { itemId: B, qty: 1 },
      ],
    });
    const q = await svc(restaurant, [item(A, 10000), item(B, 5000)]).quote(cart, noon);
    expect(q.subtotalPaise).toBe(25000);
    expect(q.taxPaise).toBe(1250);
    expect(q.deliveryFeePaise).toBe(3000);
    expect(q.totalPaise).toBe(29250);
    expect(q.issues).toEqual([]);
  });

  it("reports unavailable and missing items and excludes them from totals", async () => {
    const cart = cartSchema.parse({
      restaurantId: R,
      lines: [
        { itemId: A, qty: 1 },
        { itemId: B, qty: 1 },
      ],
    });
    const q = await svc(restaurant, [item(A, 10000, { isAvailable: false })]).quote(cart, noon);
    expect(q.issues.map((i) => i.code).sort()).toEqual(["item_not_found", "item_unavailable"]);
    expect(q.lines).toHaveLength(0);
    expect(q.totalPaise).toBe(0);
  });

  it("flags a closed restaurant and 404s for unavailable ones", async () => {
    const cart = cartSchema.parse({ restaurantId: R, lines: [{ itemId: A, qty: 1 }] });
    const closed = { ...restaurant, opensAt: "18:00", closesAt: "22:00" } as Restaurant;
    expect((await svc(closed, [item(A, 100)]).quote(cart, noon)).issues).toContainEqual({
      code: "restaurant_closed",
    });
    await expect(svc(null, []).quote(cart, noon)).rejects.toBeInstanceOf(NotFoundError);
  });
});
