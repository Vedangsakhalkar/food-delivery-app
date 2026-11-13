import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createTestUser } from "@/test/int-helpers";
import { userService } from "@/services/user-service";
import { restaurantService } from "@/services/restaurant-service";
import { menuCategoryService } from "@/services/menu-category-service";
import { menuItemService } from "@/services/menu-item-service";
import { addressService } from "@/services/address-service";
import { orderService } from "@/services/order-service";
import { adminService } from "@/services/admin-service";
import { discoveryService } from "@/services/discovery-service";
import { ownerOrderService } from "@/services/owner-order-service";
import { itemSchema } from "@/validators/menu";
import { addressSchema } from "@/validators/address";
import { placeOrderSchema } from "@/validators/order";
import { getPool, query } from "@/lib/db";
import type { User } from "@/models/user";

type T = Awaited<ReturnType<typeof createTestUser>>;
let ownerT: T, custT: T, otherT: T;
let owner: User, customer: User, other: User;
let restaurantId = "";
let itemId = "";
let addressId = "";

const addr = () =>
  addressSchema.parse({ label: "Home", line1: "12 Baner Rd", city: "Pune", pincode: "411045" });
const order = (over: Record<string, unknown> = {}) =>
  placeOrderSchema.parse({
    restaurantId,
    lines: [{ itemId, qty: 2 }],
    addressId,
    paymentMethod: "cod",
    ...over,
  });

beforeAll(async () => {
  [ownerT, custT, otherT] = await Promise.all([
    createTestUser("owner"),
    createTestUser("customer"),
    createTestUser("customer"),
  ]);
  const ensure = (t: T) =>
    userService.ensureUser({ id: t.id, email: t.email, metadata: t.metadata });
  [owner, customer, other] = await Promise.all([ensure(ownerT), ensure(custT), ensure(otherT)]);
  const r = await restaurantService.create(owner, {
    name: "Order Test Kitchen",
    cuisine: "Test",
    address: "1 Rd",
    opensAt: "00:00",
    closesAt: "23:59",
    deliveryTimeMin: 20,
  });
  restaurantId = r.id;
  const cat = await menuCategoryService.create(owner, "Mains");
  const item = await menuItemService.create(
    owner,
    itemSchema.parse({ name: "Dosa", categoryId: cat.id, price: "100" }),
  );
  itemId = item.id;
  addressId = (await addressService.create(customer, addr())).id;
});

afterAll(async () => {
  await Promise.all([ownerT, custT, otherT].map((t) => t?.cleanup()));
  await getPool().end();
});

describe("placing an order against the real database", () => {
  it("creates order + items + snapshots with server-computed totals", async () => {
    const o = await orderService.placeOrder(customer, order({ notes: "ring twice" }));
    expect(o.code).toMatch(/^DAB-\d+$/);
    expect(o.status).toBe("placed");
    expect(o).toMatchObject({
      subtotalPaise: 20000,
      taxPaise: 1000,
      deliveryFeePaise: 3000,
      totalPaise: 24000,
    });
    expect(o.items).toEqual([
      expect.objectContaining({ name: "Dosa", pricePaise: 10000, quantity: 2 }),
    ]);
    expect(o.address).toMatchObject({ label: "Home", pincode: "411045" });

    // later menu and address edits must not change history
    await query("update menu_items set name = 'Renamed', price_paise = 99999 where id = $1", [
      itemId,
    ]);
    await addressService.remove(customer, addressId);
    const again = await orderService.getForCustomer(customer, o.id);
    expect(again.items[0]).toMatchObject({ name: "Dosa", pricePaise: 10000 });
    expect(again.address.line1).toBe("12 Baner Rd");
    await query("update menu_items set name = 'Dosa', price_paise = 10000 where id = $1", [itemId]);
    addressId = (await addressService.create(customer, addr())).id;
  });

  it("refuses unavailable items, closed restaurants and other people's addresses", async () => {
    await query("update menu_items set is_available = false where id = $1", [itemId]);
    await expect(orderService.placeOrder(customer, order())).rejects.toThrow("no longer available");
    await query("update menu_items set is_available = true where id = $1", [itemId]);

    await query("update restaurants set opens_at = '00:00', closes_at = '00:01' where id = $1", [
      restaurantId,
    ]);
    const noonIst = new Date("2026-11-14T06:30:00Z");
    await expect(orderService.placeOrder(customer, order(), noonIst)).rejects.toThrow("closed");
    await query("update restaurants set opens_at = '00:00', closes_at = '23:59' where id = $1", [
      restaurantId,
    ]);

    await expect(orderService.placeOrder(other, order())).rejects.toThrow("Address not found");
  });

  it("only the customer can read their order", async () => {
    const o = await orderService.placeOrder(customer, order());
    await expect(orderService.getForCustomer(other, o.id)).rejects.toThrow("Order not found");
  });

  it("cancels a placed order, but not one the restaurant already accepted", async () => {
    const a = await orderService.placeOrder(customer, order());
    const cancelled = await orderService.cancel(customer, a.id);
    expect(cancelled.status).toBe("cancelled");
    await expect(orderService.cancel(customer, a.id)).rejects.toThrow("cannot be changed");

    const b = await orderService.placeOrder(customer, order());
    await query("update orders set status = 'accepted' where id = $1", [b.id]);
    await expect(orderService.cancel(customer, b.id)).rejects.toThrow("cannot be changed");
  });

  it("compare-and-set transition loses the race instead of overwriting", async () => {
    const o = await orderService.placeOrder(customer, order());
    const { orderRepository } = await import("@/repositories/order-repository");
    expect(await orderRepository.transition(o.id, "placed", "accepted")).toBe(true);
    expect(await orderRepository.transition(o.id, "placed", "cancelled")).toBe(false);
    expect((await orderService.getForCustomer(customer, o.id)).status).toBe("accepted");
  });

  it("owner moves an order through the full lifecycle, with customer contact visible", async () => {
    const o = await orderService.placeOrder(customer, order());
    const list = await ownerOrderService.list(owner, {
      statuses: ["placed"],
      limit: 20,
    });
    const mine = list.orders.find((x) => x.id === o.id);
    expect(mine?.customerName).toBe("Test User");
    expect(mine?.customerPhone).toBe("9876543210");

    for (const next of ["accepted", "preparing", "out_for_delivery", "delivered"] as const) {
      const updated = await ownerOrderService.updateStatus(owner, o.id, next);
      expect(updated.status).toBe(next);
    }
    await expect(ownerOrderService.updateStatus(owner, o.id, "preparing")).rejects.toThrow(
      "cannot be changed",
    );
    expect((await orderService.getForCustomer(customer, o.id)).status).toBe("delivered");
  });

  it("stores a rejection reason and shows it to the customer", async () => {
    const o = await orderService.placeOrder(customer, order());
    await ownerOrderService.updateStatus(owner, o.id, "rejected", "Out of stock");
    const seen = await orderService.getForCustomer(customer, o.id);
    expect(seen.status).toBe("rejected");
    expect(seen.rejectionReason).toBe("Out of stock");
  });

  it("another owner cannot see or change this restaurant's orders", async () => {
    const o = await orderService.placeOrder(customer, order());
    const t2 = await createTestUser("owner");
    try {
      const owner2 = await userService.ensureUser({
        id: t2.id,
        email: t2.email,
        metadata: t2.metadata,
      });
      await restaurantService.create(owner2, {
        name: "Other Kitchen",
        cuisine: "x",
        address: "x",
        opensAt: "10:00",
        closesAt: "22:00",
        deliveryTimeMin: 20,
      });
      await expect(ownerOrderService.updateStatus(owner2, o.id, "accepted")).rejects.toThrow(
        "Order not found",
      );
      const theirs = await ownerOrderService.list(owner2, { statuses: ["placed"], limit: 50 });
      expect(theirs.orders.some((x) => x.id === o.id)).toBe(false);
    } finally {
      await t2.cleanup();
    }
  });

  it("admin can disable a restaurant: hidden from discovery, ordering refused, then re-enabled", async () => {
    await adminService.setRestaurantDisabled(restaurantId, true, "Policy violation");
    const listed = await discoveryService.list({ limit: 50, cuisine: [] });
    expect(listed.restaurants.some((r) => r.id === restaurantId)).toBe(false);
    await expect(orderService.placeOrder(customer, order())).rejects.toThrow("no longer available");
    const mine = await restaurantService.getMine(owner);
    expect(mine.isDisabled).toBe(true);
    expect(mine.disabledReason).toBe("Policy violation");

    await adminService.setRestaurantDisabled(restaurantId, false);
    expect((await restaurantService.getMine(owner)).disabledReason).toBeNull();
    await expect(orderService.placeOrder(customer, order())).resolves.toBeTruthy();
    const all = await adminService.listRestaurants({ limit: 100 });
    expect(
      all.restaurants.some((r) => r.id === restaurantId && r.ownerEmail === ownerT.email),
    ).toBe(true);
  });

  it("admin lists all orders and can filter by status and code", async () => {
    const o = await orderService.placeOrder(customer, order());
    const byCode = await adminService.listOrders({ code: o.code.toLowerCase(), limit: 10 });
    expect(byCode.orders.map((x) => x.id)).toEqual([o.id]);
    expect(byCode.orders[0].customerName).toBe("Test User");
    const placed = await adminService.listOrders({ status: "placed", limit: 100 });
    expect(placed.orders.every((x) => x.status === "placed")).toBe(true);
    expect(placed.orders.some((x) => x.id === o.id)).toBe(true);
    expect((await adminService.listOrders({ code: "%", limit: 10 })).orders).toHaveLength(0);
  });

  it("admin lists users, filterable by role and by email", async () => {
    const owners = await adminService.listUsers({ role: "owner", q: ownerT.email, limit: 10 });
    expect(owners.users.map((u) => u.id)).toEqual([owner.id]);
    expect(owners.users[0].role).toBe("owner");
    const customers = await adminService.listUsers({
      role: "customer",
      q: ownerT.email,
      limit: 10,
    });
    expect(customers.users).toHaveLength(0);
    expect((await adminService.listUsers({ q: "%", limit: 10 })).users).toHaveLength(0);
  });
});
