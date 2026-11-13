import { describe, expect, it, vi } from "vitest";
import { createDiscoveryService } from "@/services/discovery-service";
import { decodeCursor } from "@/lib/pagination";
import { listRestaurantsSchema } from "@/validators/discovery";
import type { Restaurant } from "@/models/restaurant";

const row = (n: number) =>
  ({
    id: `r${n}`,
    ownerId: "secret-owner",
    name: `R${n}`,
    cuisine: "x",
    address: "a",
    opensAt: "10:00",
    closesAt: "22:00",
    imageUrl: null,
    imagePath: null,
    deliveryTimeMin: 30,
    isDisabled: false,
    disabledReason: null,
    avgRating: 0,
    ratingCount: 0,
    createdAt: new Date(),
  }) as Restaurant;

describe("discoveryService.list", () => {
  it("returns a page, a cursor for the next page, and hides owner fields", async () => {
    const listActive = vi.fn(async ({ limit }: { limit: number }) =>
      Array.from({ length: limit }, (_, i) => row(i)),
    );
    const svc = createDiscoveryService({ listActive, listCuisines: async () => [] });
    const res = await svc.list(listRestaurantsSchema.parse({ limit: "2" }));
    expect(listActive).toHaveBeenCalledWith(expect.objectContaining({ limit: 3, offset: 0 }));
    expect(res.restaurants).toHaveLength(2);
    expect(decodeCursor(res.nextCursor!)).toBe(2);
    expect(JSON.stringify(res)).not.toContain("secret-owner");
    expect(JSON.stringify(res)).not.toContain("disabledReason");
  });

  it("has no next cursor on the last page", async () => {
    const svc = createDiscoveryService({
      listActive: async () => [row(1)],
      listCuisines: async () => [],
    });
    expect((await svc.list(listRestaurantsSchema.parse({}))).nextCursor).toBeNull();
  });
});

describe("listRestaurantsSchema", () => {
  it("defaults and bounds limit", () => {
    expect(listRestaurantsSchema.parse({}).limit).toBe(12);
    expect(listRestaurantsSchema.safeParse({ limit: "500" }).success).toBe(false);
  });
});

describe("filters and sort", () => {
  it("normalises cuisines and validates sort", () => {
    const q = listRestaurantsSchema.parse({ cuisine: " North Indian ,Chinese,, ", sort: "rating" });
    expect(q.cuisine).toEqual(["north indian", "chinese"]);
    expect(q.sort).toBe("rating");
    expect(listRestaurantsSchema.parse({}).cuisine).toEqual([]);
    expect(listRestaurantsSchema.safeParse({ sort: "price" }).success).toBe(false);
  });

  it("passes filters to the repository", async () => {
    const listActive = vi.fn(async () => []);
    const svc = createDiscoveryService({ listActive, listCuisines: async () => ["Pizza"] });
    await svc.list(listRestaurantsSchema.parse({ cuisine: "pizza", sort: "delivery" }));
    expect(listActive).toHaveBeenCalledWith(
      expect.objectContaining({ cuisines: ["pizza"], sort: "delivery" }),
    );
    expect(await svc.cuisines()).toEqual(["Pizza"]);
  });
});
