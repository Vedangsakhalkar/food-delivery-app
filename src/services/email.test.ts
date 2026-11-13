import { describe, expect, it, vi } from "vitest";
import { createEmailService } from "@/services/email-service";
import { createNotificationService } from "@/services/notification-service";
import { esc, newOrderOwner, orderPlacedCustomer } from "@/services/email-templates";
import type { Order } from "@/models/order";
import type { EmailMessage } from "@/services/email-templates";

const order = {
  id: "o1",
  code: "DAB-10001",
  customerId: "c1",
  restaurantId: "r1",
  restaurantName: "Spice <b>Route</b>",
  address: { label: "Home", line1: "12 <script>x</script> Rd", city: "Pune", pincode: "411045" },
  status: "placed",
  rejectionReason: null,
  subtotalPaise: 20000,
  taxPaise: 1000,
  deliveryFeePaise: 3000,
  totalPaise: 24000,
  paymentMethod: "cod",
  notes: 'ring "twice"',
  createdAt: new Date(),
  items: [{ id: "i1", menuItemId: "m1", name: "Biryani & more", pricePaise: 10000, quantity: 2 }],
} as Order;

const msg = { to: "a@b.co", subject: "s", html: "<p>x</p>" };

describe("templates", () => {
  it("escapes user-controlled text", () => {
    expect(esc(`<a href="x">&'`)).not.toMatch(/[<>"']/);
    const html = orderPlacedCustomer(order, "a@b.co", "http://app").html;
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<b>Route</b>");
    expect(html).toContain("Biryani &#38; more");
    expect(html).toContain("₹240");
    expect(html).toContain("http://app/orders/o1");
  });
  it("owner email shows customer, note and a link to live orders", () => {
    const html = newOrderOwner(
      { ...order, customerName: "Asha", customerPhone: "9876543210" },
      "o@b.co",
      "http://app",
    ).html;
    expect(html).toContain("Asha");
    expect(html).toContain("9876543210");
    expect(html).toContain("/owner/orders");
  });
});

describe("emailService", () => {
  it("does nothing (and does not throw) without a configured sender", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const svc = createEmailService(null);
    expect(await svc.send(msg)).toBe(false);
    expect(await svc.send(msg)).toBe(false);
    expect(warn).toHaveBeenCalledTimes(1); // logged once
    warn.mockRestore();
  });

  it("swallows provider errors and timeouts", async () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    const failing = createEmailService({
      send: async () => {
        throw new Error("boom");
      },
    });
    expect(await failing.send(msg)).toBe(false);
    const slow = createEmailService({ send: () => new Promise(() => {}) }, 20);
    expect(await slow.send(msg)).toBe(false);
    expect(err).toHaveBeenCalledTimes(2);
    err.mockRestore();
  });

  it("reports success", async () => {
    const send = vi.fn(async () => {});
    expect(await createEmailService({ send }).send(msg)).toBe(true);
    expect(send).toHaveBeenCalledWith(msg);
  });
});

describe("notificationService.orderPlaced", () => {
  const users = {
    findById: vi.fn(async (id: string) =>
      id === "c1"
        ? ({ id, email: "cust@x.co", name: "Asha", phone: "9876543210" } as never)
        : ({ id, email: "owner@x.co", name: "Ravi", phone: null } as never),
    ),
  };
  const restaurants = { findById: vi.fn(async () => ({ id: "r1", ownerId: "o9" }) as never) };

  it("emails the customer and the restaurant owner", async () => {
    const send = vi.fn(async (m: EmailMessage) => Boolean(m));
    await createNotificationService({
      users,
      restaurants,
      email: { send },
      appUrl: "http://app",
    }).orderPlaced(order);
    expect(send.mock.calls.map((c) => c[0].to).sort()).toEqual(["cust@x.co", "owner@x.co"]);
  });

  it("never throws, even if lookups or sending fail", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const bad = {
      findById: vi.fn(async () => {
        throw new Error("db down");
      }),
    };
    const svc = createNotificationService({
      users: bad,
      restaurants,
      email: { send: vi.fn() },
      appUrl: "x",
    });
    await expect(svc.orderPlaced(order)).resolves.toBeUndefined();
    spy.mockRestore();
  });
});

describe("notificationService.statusChanged", () => {
  const users = {
    findById: vi.fn(async () => ({ id: "c1", email: "cust@x.co", name: "Asha" }) as never),
  };
  const restaurants = { findById: vi.fn() };
  const make = () => {
    const send = vi.fn(async (m: EmailMessage) => Boolean(m));
    return {
      send,
      svc: createNotificationService({ users, restaurants, email: { send }, appUrl: "http://app" }),
    };
  };

  it.each(["accepted", "out_for_delivery", "delivered", "rejected", "cancelled"] as const)(
    "emails the customer once when the order becomes %s",
    async (status) => {
      const { send, svc } = make();
      await svc.statusChanged({ ...order, status, rejectionReason: "Out of <stock>" });
      expect(send).toHaveBeenCalledTimes(1);
      expect(send.mock.calls[0][0].to).toBe("cust@x.co");
      expect(send.mock.calls[0][0].subject).toContain(order.code);
    },
  );

  it("does not email for Preparing or Placed", async () => {
    const { send, svc } = make();
    await svc.statusChanged({ ...order, status: "preparing" });
    await svc.statusChanged({ ...order, status: "placed" });
    expect(send).not.toHaveBeenCalled();
  });

  it("includes the (escaped) reason for a rejection", async () => {
    const { send, svc } = make();
    await svc.statusChanged({ ...order, status: "rejected", rejectionReason: "Out of <stock>" });
    const html = send.mock.calls[0][0].html;
    expect(html).toContain("Out of &#60;stock&#62;");
    expect(html).not.toContain("<stock>");
  });

  it("never throws when the lookup fails", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const svc = createNotificationService({
      users: {
        findById: async () => {
          throw new Error("db");
        },
      },
      restaurants,
      email: { send: vi.fn() },
      appUrl: "x",
    });
    await expect(svc.statusChanged({ ...order, status: "accepted" })).resolves.toBeUndefined();
    spy.mockRestore();
  });
});
