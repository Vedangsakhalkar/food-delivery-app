import { describe, expect, it, vi } from "vitest";
import { createUserService, resolveRole } from "@/services/user-service";
import type { UserRepository } from "@/repositories/user-repository";
import type { User } from "@/models/user";

describe("resolveRole", () => {
  it.each([
    ["customer", "customer"],
    ["owner", "owner"],
    ["admin", "customer"],
    ["superuser", "customer"],
    [undefined, "customer"],
  ])("%s -> %s", (input, expected) => {
    expect(resolveRole(input)).toBe(expected);
  });
});

describe("ensureUser", () => {
  const identity = {
    id: "u1",
    email: "a@b.c",
    metadata: { name: " Asha ", phone: "9876543210", role: "admin" },
  };

  it("creates the row on first login with a whitelisted role", async () => {
    const insertIfMissing = vi.fn(async (u) => ({ ...u, createdAt: new Date() }) as User);
    const repo: UserRepository = { findById: async () => null, insertIfMissing };
    const user = await createUserService(repo).ensureUser(identity);
    expect(insertIfMissing).toHaveBeenCalledWith({
      id: "u1",
      email: "a@b.c",
      name: "Asha",
      phone: "9876543210",
      role: "customer",
    });
    expect(user.role).toBe("customer");
  });

  it("returns the existing row without inserting", async () => {
    const existing = { id: "u1", role: "owner" } as User;
    const insertIfMissing = vi.fn();
    const repo: UserRepository = { findById: async () => existing, insertIfMissing };
    expect(await createUserService(repo).ensureUser(identity)).toBe(existing);
    expect(insertIfMissing).not.toHaveBeenCalled();
  });
});
