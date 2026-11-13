import { describe, expect, it, vi } from "vitest";
import { createAdminService } from "@/services/admin-service";
import { NotFoundError } from "@/lib/errors";
import { adminListRestaurantsSchema, setDisabledSchema } from "@/validators/admin";
import type { Restaurant } from "@/models/restaurant";
import type { RestaurantRepository } from "@/repositories/restaurant-repository";

const repo = (over: Partial<RestaurantRepository> = {}): RestaurantRepository =>
  ({
    listForAdmin: vi.fn(async (o: { limit: number }) =>
      Array.from({ length: o.limit }, (_, i) => ({ id: `r${i}` })),
    ),
    setDisabled: vi.fn(async () => ({ id: "r1" }) as Restaurant),
    ...over,
  }) as unknown as RestaurantRepository;

describe("admin validators", () => {
  it("maps the status filter and requires a reason to disable", () => {
    expect(adminListRestaurantsSchema.parse({ status: "disabled" }).status).toBe(true);
    expect(adminListRestaurantsSchema.parse({ status: "active" }).status).toBe(false);
    expect(adminListRestaurantsSchema.parse({}).status).toBeUndefined();
    expect(setDisabledSchema.safeParse({ disabled: true }).success).toBe(false);
    expect(setDisabledSchema.safeParse({ disabled: true, reason: "Spam" }).success).toBe(true);
    expect(setDisabledSchema.safeParse({ disabled: false }).success).toBe(true);
  });
});

describe("adminService", () => {
  it("disables with a reason and clears the reason when enabling", async () => {
    const r = repo();
    const svc = createAdminService(r);
    await svc.setRestaurantDisabled("r1", true, "Spam");
    expect(r.setDisabled).toHaveBeenLastCalledWith("r1", true, "Spam");
    await svc.setRestaurantDisabled("r1", false, "ignored");
    expect(r.setDisabled).toHaveBeenLastCalledWith("r1", false, null);
  });

  it("404s for unknown restaurants", async () => {
    const svc = createAdminService(repo({ setDisabled: async () => null }));
    await expect(svc.setRestaurantDisabled("x", true, "r")).rejects.toBeInstanceOf(NotFoundError);
  });

  it("paginates", async () => {
    const page = await createAdminService(repo()).listRestaurants({ limit: 2 });
    expect(page.restaurants).toHaveLength(2);
    expect(page.nextCursor).not.toBeNull();
  });
});
