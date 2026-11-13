import { ConflictError, NotFoundError } from "@/lib/errors";
import type { Address } from "@/models/address";
import type { User } from "@/models/user";
import { addressRepository, type AddressRepository } from "@/repositories/address-repository";
import type { AddressInput } from "@/validators/address";

export const MAX_ADDRESSES = 10;

export function createAddressService(repo: AddressRepository) {
  return {
    list: (user: User): Promise<Address[]> => repo.list(user.id),

    /** The first address a user saves becomes their default automatically. */
    async create(user: User, input: AddressInput): Promise<Address> {
      const existing = await repo.list(user.id);
      if (existing.length >= MAX_ADDRESSES) {
        throw new ConflictError(`You can save up to ${MAX_ADDRESSES} addresses`);
      }
      return repo.insert(user.id, input, input.isDefault || existing.length === 0);
    },

    async update(user: User, id: string, input: AddressInput): Promise<Address> {
      const updated = await repo.update(id, user.id, input, input.isDefault);
      if (!updated) throw new NotFoundError("Address not found");
      return updated;
    },

    async remove(user: User, id: string): Promise<void> {
      if (!(await repo.remove(id, user.id))) throw new NotFoundError("Address not found");
    },

    /** Used at checkout: the address must belong to the customer. */
    async getOwned(user: User, id: string): Promise<Address> {
      const a = await repo.find(id, user.id);
      if (!a) throw new NotFoundError("Address not found");
      return a;
    },
  };
}

export const addressService = createAddressService(addressRepository);
