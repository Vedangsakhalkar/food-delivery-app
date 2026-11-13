import { describe, expect, it, vi } from "vitest";
import { createOrderService } from "@/services/order-service";
import { ConflictError, NotFoundError } from "@/lib/errors";
import { placeOrderSchema } from "@/validators/order";
import type { Order } from "@/models/order";
import type { User } from "@/models/user";
import type { Quote } from "@/services/quote-service";

const R = "33333333-3333-4333-8333-333333333333";
const A = "11111111-1111-4111-8111-111111111111";
const ADDR = "44444444-4444-4444-8444-444444444444";
const customer = { id: "c1" } as User;
const input = placeOrderSchema.parse({
  restaurantId: R,
  lines: [{ itemId: A, qty: 2 }],
  addressId: ADDR,
  paymentMethod: "cod",
  notes: " ring twice ",
});

const quote = (over: Partial<Quote> = {}): Quote => ({
  restaurant: { id: R, name: "Spice", isOpen: true },
  lines: [
    { itemId: A, name: "Biryani", isVeg: false, qty: 2, unitPricePaise: 10000, linePaise: 20000 },
  ],
  issues: [],
  subtotalPaise: 20000,
  taxPaise: 1000,
  deliveryFeePaise: 3000,
  totalPaise: 24000,
  ...over,
});

function setup(q: Quote = quote(), hooks: Array<(o: Order) => void | Promise<void>> = []) {
  const create = vi.fn(
    async (o) =>
      ({ id: "o1", code: "DAB-10001", customerId: o.customerId, status: "placed" }) as Order,
  );
  const svc = createOrderService({
    orders: { create, findById: vi.fn(async () => ({ id: "o1", customerId: "c1" }) as Order) },
    quotes: {
      priceCart: async () => ({ restaurant: { id: R } as never, items: new Map(), quote: q }),
    },
    addresses: {
      getOwned: async () => ({
        id: ADDR,
        userId: "c1",
        label: "Home",
        line1: "12 Baner",
        city: "Pune",
        pincode: "411045",
        isDefault: true,
      }),
    },
    onPlaced: hooks,
  });
  return { svc, create };
}

describe("placeOrderSchema", () => {
  it("only accepts cash on delivery", () => {
    expect(placeOrderSchema.safeParse({ ...input, paymentMethod: "card" }).success).toBe(false);
    expect(placeOrderSchema.safeParse({ ...input, paymentMethod: undefined }).success).toBe(false);
    expect(input.notes).toBe("ring twice");
  });
});

describe("orderService.placeOrder", () => {
  it("saves server-computed totals and snapshots of items and address", async () => {
    const { svc, create } = setup();
    await svc.placeOrder(customer, input);
    expect(create).toHaveBeenCalledWith({
      customerId: "c1",
      restaurantId: R,
      address: { label: "Home", line1: "12 Baner", city: "Pune", pincode: "411045" },
      subtotalPaise: 20000,
      taxPaise: 1000,
      deliveryFeePaise: 3000,
      totalPaise: 24000,
      notes: "ring twice",
      items: [{ menuItemId: A, name: "Biryani", pricePaise: 10000, quantity: 2 }],
    });
  });

  it.each([
    [{ code: "restaurant_closed" } as const, "closed"],
    [{ code: "item_unavailable", itemId: A, name: "x" } as const, "no longer available"],
    [{ code: "item_not_found", itemId: A } as const, "no longer on the menu"],
  ])("refuses with 409 when %j", async (issue, text) => {
    const { svc, create } = setup(quote({ issues: [issue] }));
    const err = await svc.placeOrder(customer, input).catch((e) => e);
    expect(err).toBeInstanceOf(ConflictError);
    expect(err.message).toContain(text);
    expect(create).not.toHaveBeenCalled();
  });

  it("never fails the order because a post-order hook failed", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const ok = vi.fn();
    const failing = () => {
      throw new Error("email down");
    };
    const { svc } = setup(quote(), [failing, ok]);
    await expect(svc.placeOrder(customer, input)).resolves.toMatchObject({ code: "DAB-10001" });
    expect(ok).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("hides other customers' orders", async () => {
    const { svc } = setup();
    const stranger = { id: "someone-else" } as User;
    await expect(svc.getForCustomer(stranger, "o1")).rejects.toBeInstanceOf(NotFoundError);
  });
});
