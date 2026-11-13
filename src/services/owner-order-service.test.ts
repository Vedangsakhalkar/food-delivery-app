import { describe, expect, it, vi } from "vitest";
import { createOwnerOrderService } from "@/services/owner-order-service";
import { ConflictError, NotFoundError } from "@/lib/errors";
import { ownerListOrdersSchema, updateStatusSchema } from "@/validators/order";
import type { Order, OrderStatus } from "@/models/order";
import type { User } from "@/models/user";

const owner = { id: "o1" } as User;

function setup(status: OrderStatus = "placed", opts: { found?: boolean; won?: boolean } = {}) {
  const { found = true, won = true } = opts;
  const transition = vi.fn(async () => won);
  const listByRestaurant = vi.fn(async (_r: string, o: { limit: number }) =>
    Array.from({ length: o.limit }, (_, i) => ({ id: `o${i}` }) as Order),
  );
  const svc = createOwnerOrderService(
    {
      create: vi.fn(),
      findById: vi.fn(),
      listByCustomer: vi.fn(),
      listByRestaurant,
      findForRestaurant: vi.fn(async () => (found ? ({ id: "x", status } as Order) : null)),
      transition,
    },
    { findByOwner: async () => ({ id: "r1" }) as never },
  );
  return { svc, transition, listByRestaurant };
}

describe("validators", () => {
  it("defaults to orders in progress and validates statuses", () => {
    expect(ownerListOrdersSchema.parse({}).status).toEqual([
      "placed",
      "accepted",
      "preparing",
      "out_for_delivery",
    ]);
    expect(ownerListOrdersSchema.parse({ status: "delivered, rejected" }).status).toEqual([
      "delivered",
      "rejected",
    ]);
    expect(ownerListOrdersSchema.safeParse({ status: "bogus" }).success).toBe(false);
  });
  it("requires a reason to reject", () => {
    expect(updateStatusSchema.safeParse({ status: "rejected" }).success).toBe(false);
    expect(
      updateStatusSchema.safeParse({ status: "rejected", reason: "Out of stock" }).success,
    ).toBe(true);
    expect(updateStatusSchema.safeParse({ status: "accepted" }).success).toBe(true);
  });
});

describe("ownerOrderService.updateStatus", () => {
  it("accepts a placed order", async () => {
    const { svc, transition } = setup("placed");
    await svc.updateStatus(owner, "x", "accepted");
    expect(transition).toHaveBeenCalledWith("x", "placed", "accepted", null);
  });

  it("stores the rejection reason", async () => {
    const { svc, transition } = setup("placed");
    await svc.updateStatus(owner, "x", "rejected", "Out of stock");
    expect(transition).toHaveBeenCalledWith("x", "placed", "rejected", "Out of stock");
  });

  it.each([
    ["placed", "delivered"],
    ["placed", "preparing"],
    ["delivered", "preparing"],
    ["cancelled", "accepted"],
    ["preparing", "accepted"],
  ] as const)("refuses %s -> %s with 409", async (from, to) => {
    const { svc, transition } = setup(from);
    await expect(svc.updateStatus(owner, "x", to)).rejects.toBeInstanceOf(ConflictError);
    expect(transition).not.toHaveBeenCalled();
  });

  it("404s for orders of other restaurants", async () => {
    await expect(
      setup("placed", { found: false }).svc.updateStatus(owner, "x", "accepted"),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("409s when the order changed under the owner", async () => {
    await expect(
      setup("placed", { won: false }).svc.updateStatus(owner, "x", "accepted"),
    ).rejects.toBeInstanceOf(ConflictError);
  });
});

describe("ownerOrderService.list", () => {
  it("paginates within the owner's restaurant", async () => {
    const { svc, listByRestaurant } = setup();
    const page = await svc.list(owner, { statuses: ["placed"], limit: 2 });
    expect(listByRestaurant).toHaveBeenCalledWith("r1", expect.objectContaining({ limit: 3 }));
    expect(page.orders).toHaveLength(2);
    expect(page.nextCursor).not.toBeNull();
  });
});
