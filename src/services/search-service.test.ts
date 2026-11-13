import { describe, expect, it, vi } from "vitest";
import { createSearchService } from "@/services/search-service";
import { likePattern } from "@/lib/like";
import { searchSchema } from "@/validators/discovery";
import type { Restaurant } from "@/models/restaurant";

describe("likePattern", () => {
  it("lowercases and escapes wildcards so input matches literally", () => {
    expect(likePattern("Bir")).toBe("%bir%");
    expect(likePattern("50%_off\\")).toBe("%50\\%\\_off\\\\%");
  });
});

describe("searchSchema", () => {
  it("requires 2+ characters and trims", () => {
    expect(searchSchema.safeParse({ q: "a" }).success).toBe(false);
    expect(searchSchema.safeParse({ q: "  " }).success).toBe(false);
    expect(searchSchema.parse({ q: " biryani " }).q).toBe("biryani");
  });
});

describe("searchService", () => {
  it("returns public restaurants and dishes", async () => {
    const restaurants = vi.fn(async () => [
      {
        id: "r1",
        ownerId: "secret",
        name: "Spice",
        cuisine: "x",
        address: "a",
        opensAt: "10:00",
        closesAt: "11:00",
      } as Restaurant,
    ]);
    const dishes = vi.fn(async () => [
      {
        id: "d1",
        name: "Biryani",
        isVeg: false,
        pricePaise: 32000,
        restaurantId: "r1",
        restaurantName: "Spice",
      },
    ]);
    const res = await createSearchService({ restaurants, dishes }).search("bir");
    expect(res.dishes[0].name).toBe("Biryani");
    expect(JSON.stringify(res.restaurants)).not.toContain("secret");
  });
});
