import { describe, expect, it } from "vitest";
import {
  EMPTY_CART,
  MAX_QTY,
  cartConflicts,
  cartCount,
  cartReducer,
  parseStoredCart,
  type CartState,
} from "@/lib/cart";

const add = (s: CartState, itemId: string, restaurantId = "r1") =>
  cartReducer(s, { type: "add", restaurantId, itemId });

describe("cartReducer", () => {
  it("adds items, then increments", () => {
    let s = add(EMPTY_CART, "a");
    expect(s).toEqual({ restaurantId: "r1", lines: [{ itemId: "a", qty: 1 }] });
    s = add(s, "a");
    expect(s.lines[0].qty).toBe(2);
    expect(cartCount(add(s, "b"))).toBe(3);
  });

  it("caps quantity at the maximum", () => {
    const s = cartReducer(add(EMPTY_CART, "a"), { type: "setQty", itemId: "a", qty: 99 });
    expect(s.lines[0].qty).toBe(MAX_QTY);
    expect(add(s, "a").lines[0].qty).toBe(MAX_QTY);
  });

  it("removes an item at quantity 0 and empties the cart when nothing is left", () => {
    let s = add(add(EMPTY_CART, "a"), "b");
    s = cartReducer(s, { type: "setQty", itemId: "a", qty: 0 });
    expect(s.lines.map((l) => l.itemId)).toEqual(["b"]);
    expect(cartReducer(s, { type: "remove", itemId: "b" })).toEqual(EMPTY_CART);
  });

  it("ignores adds from another restaurant (conflict is handled by the caller)", () => {
    const s = add(EMPTY_CART, "a");
    expect(cartConflicts(s, "r2")).toBe(true);
    expect(cartConflicts(s, "r1")).toBe(false);
    expect(cartConflicts(EMPTY_CART, "r2")).toBe(false);
    expect(add(s, "x", "r2")).toBe(s);
  });
});

describe("parseStoredCart", () => {
  it("restores a valid cart and drops junk", () => {
    const raw = JSON.stringify({
      restaurantId: "r1",
      lines: [
        { itemId: "a", qty: 2 },
        { itemId: 5, qty: 1 },
        { itemId: "b", qty: -1 },
      ],
    });
    expect(parseStoredCart(raw)).toEqual({ restaurantId: "r1", lines: [{ itemId: "a", qty: 2 }] });
  });
  it("returns an empty cart for missing, malformed or tampered data", () => {
    expect(parseStoredCart(null)).toEqual(EMPTY_CART);
    expect(parseStoredCart("{not json")).toEqual(EMPTY_CART);
    expect(parseStoredCart('{"restaurantId":1,"lines":[]}')).toEqual(EMPTY_CART);
  });
});

describe("replacing the cart (one restaurant at a time)", () => {
  it("clear then add starts a new cart for the new restaurant", () => {
    const old = add(add(EMPTY_CART, "a"), "b");
    const fresh = cartReducer(cartReducer(old, { type: "clear" }), {
      type: "add",
      restaurantId: "r2",
      itemId: "x",
    });
    expect(fresh).toEqual({ restaurantId: "r2", lines: [{ itemId: "x", qty: 1 }] });
  });
});
