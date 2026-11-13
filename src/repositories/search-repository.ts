import { query } from "@/lib/db";
import { likePattern } from "@/lib/like";
import { toRestaurant, type RestaurantRow } from "@/repositories/restaurant-repository";
import type { Restaurant } from "@/models/restaurant";

export interface DishHit {
  id: string;
  name: string;
  isVeg: boolean;
  pricePaise: number;
  restaurantId: string;
  restaurantName: string;
}

export interface SearchRepository {
  restaurants(term: string, limit: number): Promise<Restaurant[]>;
  dishes(term: string, limit: number): Promise<DishHit[]>;
}

export const searchRepository: SearchRepository = {
  async restaurants(term, limit) {
    const res = await query<RestaurantRow>(
      `select * from restaurants
       where is_disabled = false and (lower(name) like $1 or lower(cuisine) like $1)
       order by rating_count desc, name limit $2`,
      [likePattern(term), limit],
    );
    return res.rows.map(toRestaurant);
  },

  async dishes(term, limit) {
    const res = await query<{
      id: string;
      name: string;
      is_veg: boolean;
      price_paise: number;
      restaurant_id: string;
      restaurant_name: string;
    }>(
      `select i.id, i.name, i.is_veg, i.price_paise, r.id as restaurant_id, r.name as restaurant_name
       from menu_items i join restaurants r on r.id = i.restaurant_id
       where r.is_disabled = false and lower(i.name) like $1
       order by i.name limit $2`,
      [likePattern(term), limit],
    );
    return res.rows.map((r) => ({
      id: r.id,
      name: r.name,
      isVeg: r.is_veg,
      pricePaise: r.price_paise,
      restaurantId: r.restaurant_id,
      restaurantName: r.restaurant_name,
    }));
  },
};
