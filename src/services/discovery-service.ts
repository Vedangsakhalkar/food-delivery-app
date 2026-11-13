import { decodeCursor, encodeCursor } from "@/lib/pagination";
import { toPublic, type PublicRestaurant } from "@/models/public-restaurant";
import {
  restaurantRepository,
  type RestaurantRepository,
} from "@/repositories/restaurant-repository";
import type { ListRestaurantsQuery } from "@/validators/discovery";

export function createDiscoveryService(repo: Pick<RestaurantRepository, "listActive">) {
  return {
    /** Public list of active restaurants. Fetches one extra row to know if there is a next page. */
    async list(q: ListRestaurantsQuery): Promise<{
      restaurants: PublicRestaurant[];
      nextCursor: string | null;
    }> {
      const offset = decodeCursor(q.cursor);
      const rows = await repo.listActive({ limit: q.limit + 1, offset });
      const hasMore = rows.length > q.limit;
      return {
        restaurants: rows.slice(0, q.limit).map(toPublic),
        nextCursor: hasMore ? encodeCursor(offset + q.limit) : null,
      };
    },
  };
}

export const discoveryService = createDiscoveryService(restaurantRepository);
