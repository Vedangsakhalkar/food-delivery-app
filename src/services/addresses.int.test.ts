import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createTestUser } from "@/test/int-helpers";
import { userService } from "@/services/user-service";
import { addressService } from "@/services/address-service";
import { addressSchema } from "@/validators/address";
import { getPool } from "@/lib/db";
import type { User } from "@/models/user";

let t: Awaited<ReturnType<typeof createTestUser>>;
let user: User;
const input = (label: string, isDefault = false) =>
  addressSchema.parse({ label, line1: "1 Rd", city: "Pune", pincode: "411001", isDefault });

beforeAll(async () => {
  t = await createTestUser("customer");
  user = await userService.ensureUser({ id: t.id, email: t.email, metadata: t.metadata });
});
afterAll(async () => {
  await t?.cleanup();
  await getPool().end();
});

describe("saved addresses against the real database", () => {
  it("keeps exactly one default through add, switch and delete", async () => {
    const home = await addressService.create(user, input("Home"));
    expect(home.isDefault).toBe(true);
    const work = await addressService.create(user, input("Work"));
    expect(work.isDefault).toBe(false);

    await addressService.update(user, work.id, input("Work", true));
    let list = await addressService.list(user);
    expect(list.filter((a) => a.isDefault).map((a) => a.label)).toEqual(["Work"]);

    await addressService.remove(user, work.id);
    list = await addressService.list(user);
    expect(list).toHaveLength(1);
    expect(list[0].isDefault).toBe(true);
  });

  it("does not let one user touch another's addresses", async () => {
    const other = await createTestUser("customer");
    try {
      const o = await userService.ensureUser({
        id: other.id,
        email: other.email,
        metadata: other.metadata,
      });
      const mine = (await addressService.list(user))[0];
      await expect(addressService.update(o, mine.id, input("Hack"))).rejects.toThrow("not found");
      await expect(addressService.remove(o, mine.id)).rejects.toThrow("not found");
    } finally {
      await other.cleanup();
    }
  });
});
