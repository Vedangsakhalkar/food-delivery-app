import { ConflictError, NotFoundError, ValidationError } from "@/lib/errors";
import type { Restaurant } from "@/models/restaurant";
import type { User } from "@/models/user";
import {
  restaurantRepository,
  type RestaurantRepository,
} from "@/repositories/restaurant-repository";
import { storageService } from "@/lib/supabase/storage-adapter";
import type { createStorageService } from "@/services/storage-service";
import type { RestaurantInput } from "@/validators/restaurant";

type Storage = Pick<
  ReturnType<typeof createStorageService>,
  "ownsPath" | "publicUrl" | "removeQuietly"
>;

export function createRestaurantService(repo: RestaurantRepository, storage: Storage) {
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
        const created = await repo.insert(owner.id, input);
        if (input.imagePath) return this.update(owner, input);
        return created;
      } catch (err) {
        // Two simultaneous creates: the unique(owner_id) constraint wins.
        if ((err as { code?: string }).code === "23505") {
          throw new ConflictError("You already have a restaurant");
        }
        throw err;
      }
    },

    async update(owner: User, input: RestaurantInput): Promise<Restaurant> {
      const current = await repo.findByOwner(owner.id);
      if (!current) throw new NotFoundError("You have not created a restaurant yet");

      let image: { path: string | null; url: string | null } | undefined;
      if (input.imagePath === null) image = { path: null, url: null };
      else if (typeof input.imagePath === "string") {
        if (!storage.ownsPath("restaurants", owner.id, input.imagePath)) {
          throw new ValidationError("Invalid image");
        }
        image = { path: input.imagePath, url: storage.publicUrl(input.imagePath) };
      }

      const updated = await repo.update(owner.id, input, image);
      if (!updated) throw new NotFoundError("You have not created a restaurant yet");
      // Replacing or removing an image deletes the old Storage object.
      if (image && current.imagePath && current.imagePath !== image.path) {
        await storage.removeQuietly(current.imagePath);
      }
      return updated;
    },
  };
}

export const restaurantService = createRestaurantService(restaurantRepository, storageService);
