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
      ({ id: "o1", code: "TDK-10001", customerId: o.customerId, status: "placed" }) as Order,
  );
  const svc = createOrderService({
    orders: {
      create,
      findById: vi.fn(async () => ({ id: "o1", customerId: "c1" }) as Order),
      transition: vi.fn(async () => true),
      listByRestaurant: vi.fn(),
      findForRestaurant: vi.fn(),
      listAll: vi.fn(),
      listByCustomer: vi.fn(async (_c: string, o: { limit: number }) =>
        Array.from({ length: o.limit }, (_, i) => ({ id: `o${i}` }) as Order),
      ),
    },
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
    await expect(svc.placeOrder(customer, input)).resolves.toMatchObject({ code: "TDK-10001" });
    expect(ok).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("hides other customers' orders", async () => {
    const { svc } = setup();
    const stranger = { id: "someone-else" } as User;
    await expect(svc.getForCustomer(stranger, "o1")).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("orderService.listForCustomer", () => {
  it("returns a page and a cursor when there are more orders", async () => {
    const { svc } = setup();
    const page = await svc.listForCustomer(customer, { limit: 3 });
    expect(page.orders).toHaveLength(3);
    expect(page.nextCursor).not.toBeNull();
  });
});

describe("orderService.cancel", () => {
  const withStatus = (status: string, transitioned = true) => {
    const transition = vi.fn(async () => transitioned);
    const svc = createOrderService({
      orders: {
        create: vi.fn(),
        findById: vi.fn(async () => ({ id: "o1", customerId: "c1", status }) as Order),
        listByCustomer: vi.fn(),
        transition,
        listByRestaurant: vi.fn(),
        findForRestaurant: vi.fn(),
        listAll: vi.fn(),
      },
      quotes: { priceCart: vi.fn() },
      addresses: { getOwned: vi.fn() },
    });
    return { svc, transition };
  };

  it("cancels a placed order", async () => {
    const { svc, transition } = withStatus("placed");
    await svc.cancel(customer, "o1");
    expect(transition).toHaveBeenCalledWith("o1", "placed", "cancelled");
  });

  it.each(["accepted", "preparing", "out_for_delivery", "delivered", "rejected", "cancelled"])(
    "refuses to cancel a %s order with 409",
    async (status) => {
      const { svc, transition } = withStatus(status);
      await expect(svc.cancel(customer, "o1")).rejects.toBeInstanceOf(ConflictError);
      expect(transition).not.toHaveBeenCalled();
    },
  );

  it("returns 409 when the restaurant accepted it first (lost the race)", async () => {
    const { svc } = withStatus("placed", false);
    await expect(svc.cancel(customer, "o1")).rejects.toThrow("can no longer be cancelled");
  });

  it("404s for someone else's order", async () => {
    const { svc } = withStatus("placed");
    await expect(svc.cancel({ id: "x" } as User, "o1")).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("ordering from a disabled restaurant", () => {
  it("is refused with 409", async () => {
    const svc = createOrderService({
      orders: {
        create: vi.fn(),
        findById: vi.fn(),
        listByCustomer: vi.fn(),
        transition: vi.fn(),
        listByRestaurant: vi.fn(),
        findForRestaurant: vi.fn(),
        listAll: vi.fn(),
      },
      quotes: {
        priceCart: async () => {
          throw new NotFoundError("This restaurant is no longer available");
        },
      },
      addresses: { getOwned: vi.fn() },
    });
    await expect(svc.placeOrder(customer, input)).rejects.toBeInstanceOf(ConflictError);
  });
});

describe("cancel notifications", () => {
  const withHook = (hook: (o: Order) => void) =>
    createOrderService({
      orders: {
        create: vi.fn(),
        findById: vi.fn(async () => ({ id: "o1", customerId: "c1", status: "placed" }) as Order),
        listByCustomer: vi.fn(),
        transition: vi.fn(async () => true),
        listByRestaurant: vi.fn(),
        findForRestaurant: vi.fn(),
        listAll: vi.fn(),
      },
      quotes: { priceCart: vi.fn() },
      addresses: { getOwned: vi.fn() },
      onStatusChanged: [hook],
    });

  it("notifies once after a customer cancels", async () => {
    const hook = vi.fn();
    await withHook(hook).cancel(customer, "o1");
    expect(hook).toHaveBeenCalledTimes(1);
  });
});
