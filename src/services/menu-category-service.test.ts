import { describe, expect, it, vi } from "vitest";
import { createMenuCategoryService } from "@/services/menu-category-service";
import { ConflictError, NotFoundError } from "@/lib/errors";
import type { MenuCategory } from "@/models/menu";
import type { User } from "@/models/user";
import type { MenuCategoryRepository } from "@/repositories/menu-category-repository";

const owner = { id: "o1" } as User;
const cat = (id: string, sortOrder: number): MenuCategory => ({
  id,
  restaurantId: "r1",
  name: id,
  sortOrder,
});

function setup(list: MenuCategory[] = [cat("a", 0), cat("b", 1), cat("c", 2)], has = true) {
  const repo: MenuCategoryRepository = {
    list: vi.fn(async () => list),
    insert: vi.fn(async (_r, name) => cat(name, 9)),
    rename: vi.fn(async () => list[0]),
    remove: vi.fn(async () => true),
    setOrder: vi.fn(async () => {}),
  };
  const restaurants = { findByOwner: async () => (has ? ({ id: "r1" } as never) : null) };
  return { repo, svc: createMenuCategoryService(repo, restaurants) };
}

describe("menuCategoryService", () => {
  it("requires a restaurant", async () => {
    await expect(setup([], false).svc.list(owner)).rejects.toBeInstanceOf(NotFoundError);
  });

  it("maps duplicate names to 409", async () => {
    const { repo, svc } = setup();
    (repo.insert as ReturnType<typeof vi.fn>).mockRejectedValue({ code: "23505" });
    await expect(svc.create(owner, "Biryani")).rejects.toBeInstanceOf(ConflictError);
  });

  it("moves a category down by swapping order", async () => {
    const { repo, svc } = setup();
    await svc.update(owner, "a", { move: "down" });
    expect(repo.setOrder).toHaveBeenCalledWith("r1", [
      { id: "b", sortOrder: 0 },
      { id: "a", sortOrder: 1 },
      { id: "c", sortOrder: 2 },
    ]);
  });

  it("ignores moves past the ends", async () => {
    const { repo, svc } = setup();
    await svc.update(owner, "a", { move: "up" });
    expect(repo.setOrder).not.toHaveBeenCalled();
  });

  it("404s for categories outside the owner's restaurant", async () => {
    const { svc } = setup();
    await expect(svc.update(owner, "zzz", { name: "x" })).rejects.toBeInstanceOf(NotFoundError);
  });

  it("404s when deleting something that is not the owner's", async () => {
    const { repo, svc } = setup();
    (repo.remove as ReturnType<typeof vi.fn>).mockResolvedValue(false);
    await expect(svc.remove(owner, "zzz")).rejects.toBeInstanceOf(NotFoundError);
  });
});
