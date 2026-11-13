import { describe, expect, it, vi } from "vitest";
import { createReviewService } from "@/services/review-service";
import { ConflictError, NotFoundError } from "@/lib/errors";
import { reviewSchema } from "@/validators/order";
import type { Order } from "@/models/order";
import type { Review } from "@/models/review";
import type { User } from "@/models/user";

const customer = { id: "c1" } as User;
const order = (over: Partial<Order> = {}) =>
  ({ id: "o1", customerId: "c1", restaurantId: "r1", status: "delivered", ...over }) as Order;

function setup(o: Order | null = order(), createImpl?: () => Promise<Review>) {
  const create = vi.fn(createImpl ?? (async () => ({ id: "rv1" }) as Review));
  const svc = createReviewService(
    {
      create,
      listByRestaurant: vi.fn(async (_r: string, o: { limit: number }) =>
        Array.from({ length: o.limit }, (_, i) => ({ id: `${i}` }) as Review),
      ),
    },
    { findById: async () => o },
  );
  return { svc, create };
}

describe("reviewSchema", () => {
  it("requires a whole rating of 1 to 5 and trims an optional comment", () => {
    expect(reviewSchema.safeParse({ rating: 0 }).success).toBe(false);
    expect(reviewSchema.safeParse({ rating: 6 }).success).toBe(false);
    expect(reviewSchema.safeParse({ rating: 3.5 }).success).toBe(false);
    expect(reviewSchema.parse({ rating: 5, comment: "  great  " }).comment).toBe("great");
    expect(reviewSchema.parse({ rating: 5, comment: "   " }).comment).toBeNull();
    expect(reviewSchema.safeParse({ rating: 5, comment: "x".repeat(501) }).success).toBe(false);
  });
});

describe("reviewService.create", () => {
  it("saves a review for the customer's delivered order", async () => {
    const { svc, create } = setup();
    await svc.create(customer, "o1", { rating: 4, comment: null });
    expect(create).toHaveBeenCalledWith({
      orderId: "o1",
      restaurantId: "r1",
      customerId: "c1",
      rating: 4,
      comment: null,
    });
  });

  it.each([
    "placed",
    "accepted",
    "preparing",
    "out_for_delivery",
    "rejected",
    "cancelled",
  ] as const)("refuses a %s order with 409", async (status) => {
    const { svc, create } = setup(order({ status }));
    await expect(svc.create(customer, "o1", { rating: 5, comment: null })).rejects.toBeInstanceOf(
      ConflictError,
    );
    expect(create).not.toHaveBeenCalled();
  });

  it("404s for orders that are not the customer's", async () => {
    await expect(
      setup(order({ customerId: "x" })).svc.create(customer, "o1", { rating: 5, comment: null }),
    ).rejects.toBeInstanceOf(NotFoundError);
    await expect(
      setup(null).svc.create(customer, "o1", { rating: 5, comment: null }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("maps the unique constraint to 'already reviewed' (409)", async () => {
    const { svc } = setup(order(), async () => {
      throw Object.assign(new Error("dup"), { code: "23505" });
    });
    await expect(svc.create(customer, "o1", { rating: 5, comment: null })).rejects.toThrow(
      "already reviewed",
    );
  });

  it("lists reviews with a next cursor", async () => {
    const page = await setup().svc.listForRestaurant("r1", { limit: 2 });
    expect(page.reviews).toHaveLength(2);
    expect(page.nextCursor).not.toBeNull();
  });
});

import { listReviewsSchema } from "@/validators/discovery";

describe("listReviewsSchema", () => {
  it("defaults to 10 and caps the page size", () => {
    expect(listReviewsSchema.parse({}).limit).toBe(10);
    expect(listReviewsSchema.safeParse({ limit: "100" }).success).toBe(false);
  });
});
