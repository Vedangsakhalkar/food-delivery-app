import { toPublic, type PublicRestaurant } from "@/models/public-restaurant";
import {
  searchRepository,
  type DishHit,
  type SearchRepository,
} from "@/repositories/search-repository";

const LIMIT = 20;

export function createSearchService(repo: SearchRepository) {
  return {
    /** Public search across restaurant names/cuisines and dish names. Disabled restaurants are excluded in SQL. */
    async search(term: string): Promise<{ restaurants: PublicRestaurant[]; dishes: DishHit[] }> {
      const [restaurants, dishes] = await Promise.all([
        repo.restaurants(term, LIMIT),
        repo.dishes(term, LIMIT),
      ]);
      return { restaurants: restaurants.map(toPublic), dishes };
    },
  };
}

export const searchService = createSearchService(searchRepository);
