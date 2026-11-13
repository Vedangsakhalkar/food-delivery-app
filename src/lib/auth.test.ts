import { describe, expect, it } from "vitest";
import { createRequireUser } from "@/lib/auth";
import { ForbiddenError, UnauthorizedError } from "@/lib/errors";
import type { User } from "@/models/user";

const user = (role: User["role"]): User => ({
  id: "u1",
  email: "a@b.c",
  name: "A",
  phone: null,
  role,
  createdAt: new Date(),
});
const identity = { id: "u1", email: "a@b.c", metadata: {} };

describe("requireUser", () => {
  it("throws 401 when there is no session", async () => {
    const req = createRequireUser({
      getIdentity: async () => null,
      ensureUser: async () => user("customer"),
    });
    await expect(req()).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("throws 403 for the wrong role", async () => {
    const req = createRequireUser({
      getIdentity: async () => identity,
      ensureUser: async () => user("customer"),
    });
    await expect(req(["owner"])).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("returns the user when the role matches or no roles are required", async () => {
    const req = createRequireUser({
      getIdentity: async () => identity,
      ensureUser: async () => user("owner"),
    });
    await expect(req(["owner", "admin"])).resolves.toMatchObject({ role: "owner" });
    await expect(req()).resolves.toMatchObject({ id: "u1" });
  });
});
