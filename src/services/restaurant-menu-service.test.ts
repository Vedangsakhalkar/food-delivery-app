import { describe, expect, it } from "vitest";
import { createRestaurantMenuService } from "@/services/restaurant-menu-service";
import { NotFoundError } from "@/lib/errors";
import type { Restaurant } from "@/models/restaurant";
import type { MenuItem } from "@/models/menu";

const restaurant = {
  id: "r1",
  ownerId: "secret",
  name: "R",
  opensAt: "10:00",
  closesAt: "22:00",
} as Restaurant;
const item = (id: string, categoryId: string, over: Partial<MenuItem> = {}) =>
  ({
    id,
    categoryId,
    restaurantId: "r1",
    name: id,
    description: "",
    pricePaise: 100,
    isVeg: true,
    isAvailable: true,
    imagePath: "internal/path",
    imageUrl: null,
    ...over,
  }) as MenuItem;

const svc = (found: Restaurant | null) =>
  createRestaurantMenuService(
    { findActiveById: async () => found },
    {
      list: async () => [
        { id: "c1", restaurantId: "r1", name: "Biryani", sortOrder: 0 },
        { id: "c2", restaurantId: "r1", name: "Empty", sortOrder: 1 },
        { id: "c3", restaurantId: "r1", name: "Breads", sortOrder: 2 },
      ],
    },
    { listByRestaurant: async () => [item("a", "c1"), item("b", "c3", { isAvailable: false })] },
  );

describe("restaurantMenuService.getWithMenu", () => {
  it("groups items by category in order, skips empty categories and keeps unavailable items", async () => {
    const res = await svc(restaurant).getWithMenu("r1");
    expect(res.categories.map((c) => c.name)).toEqual(["Biryani", "Breads"]);
    expect(res.categories[1].items[0].isAvailable).toBe(false);
  });

  it("never leaks owner id or storage paths", async () => {
    const json = JSON.stringify(await svc(restaurant).getWithMenu("r1"));
    expect(json).not.toContain("secret");
    expect(json).not.toContain("internal/path");
  });

  it("404s for unknown or disabled restaurants", async () => {
    await expect(svc(null).getWithMenu("x")).rejects.toBeInstanceOf(NotFoundError);
  });
});
