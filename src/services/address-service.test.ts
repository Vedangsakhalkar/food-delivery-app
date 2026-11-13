import { describe, expect, it, vi } from "vitest";
import { MAX_ADDRESSES, createAddressService } from "@/services/address-service";
import { ConflictError, NotFoundError } from "@/lib/errors";
import { addressSchema } from "@/validators/address";
import type { Address } from "@/models/address";
import type { User } from "@/models/user";
import type { AddressRepository } from "@/repositories/address-repository";

const user = { id: "u1" } as User;
const input = addressSchema.parse({
  label: "Home",
  line1: "12 Baner Rd",
  city: "Pune",
  pincode: "411045",
});
const addr = (n: number) => ({ id: `a${n}` }) as Address;

const setup = (existing: Address[] = []) => {
  const repo: AddressRepository = {
    list: vi.fn(async () => existing),
    find: vi.fn(async () => existing[0] ?? null),
    insert: vi.fn(async () => addr(9)),
    update: vi.fn(async () => addr(1)),
    remove: vi.fn(async () => true),
  };
  return { repo, svc: createAddressService(repo) };
};

describe("addressSchema", () => {
  it.each(["12345", "1234567", "abcdef", "41104 5"])("rejects pincode %s", (pincode) => {
    expect(addressSchema.safeParse({ ...input, pincode }).success).toBe(false);
  });
  it("requires label, street and city", () => {
    expect(addressSchema.safeParse({ ...input, label: " " }).success).toBe(false);
    expect(addressSchema.safeParse({ ...input, city: "" }).success).toBe(false);
  });
});

describe("addressService", () => {
  it("makes the first address the default", async () => {
    const { repo, svc } = setup([]);
    await svc.create(user, input);
    expect(repo.insert).toHaveBeenCalledWith("u1", input, true);
  });

  it("only makes later addresses default when asked", async () => {
    const { repo, svc } = setup([addr(1)]);
    await svc.create(user, input);
    expect(repo.insert).toHaveBeenLastCalledWith("u1", input, false);
    await svc.create(user, { ...input, isDefault: true });
    expect(repo.insert).toHaveBeenLastCalledWith("u1", expect.anything(), true);
  });

  it("limits the number of saved addresses", async () => {
    const { svc } = setup(Array.from({ length: MAX_ADDRESSES }, (_, i) => addr(i)));
    await expect(svc.create(user, input)).rejects.toBeInstanceOf(ConflictError);
  });

  it("scopes everything to the signed-in user and 404s otherwise", async () => {
    const { repo, svc } = setup();
    (repo.update as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    (repo.remove as ReturnType<typeof vi.fn>).mockResolvedValue(false);
    (repo.find as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    await expect(svc.update(user, "x", input)).rejects.toBeInstanceOf(NotFoundError);
    await expect(svc.remove(user, "x")).rejects.toBeInstanceOf(NotFoundError);
    await expect(svc.getOwned(user, "x")).rejects.toBeInstanceOf(NotFoundError);
    expect(repo.update).toHaveBeenCalledWith("x", "u1", input, false);
  });
});
