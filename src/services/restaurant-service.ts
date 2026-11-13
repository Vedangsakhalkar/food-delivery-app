import { ConflictError, NotFoundError } from "@/lib/errors";
import type { Restaurant } from "@/models/restaurant";
import type { User } from "@/models/user";
import {
  restaurantRepository,
  type RestaurantRepository,
} from "@/repositories/restaurant-repository";
import type { RestaurantInput } from "@/validators/restaurant";

export function createRestaurantService(repo: RestaurantRepository) {
  return {
    /** The signed-in owner's own restaurant. */
    async getMine(owner: User): Promise<Restaurant> {
      const restaurant = await repo.findByOwner(owner.id);
      if (!restaurant) throw new NotFoundError("You have not created a restaurant yet");
      return restaurant;
    },

    /** Restaurants self-onboard and go live immediately (no approval step). */
    async create(owner: User, input: RestaurantInput): Promise<Restaurant> {
      if (await repo.findByOwner(owner.id)) {
        throw new ConflictError("You already have a restaurant");
      }
      try {
        return await repo.insert(owner.id, input);
      } catch (err) {
        // Two simultaneous creates: the unique(owner_id) constraint wins.
        if ((err as { code?: string }).code === "23505") {
          throw new ConflictError("You already have a restaurant");
        }
        throw err;
      }
    },

    async update(owner: User, input: RestaurantInput): Promise<Restaurant> {
      const updated = await repo.update(owner.id, input);
      if (!updated) throw new NotFoundError("You have not created a restaurant yet");
      return updated;
    },
  };
}

export const restaurantService = createRestaurantService(restaurantRepository);
