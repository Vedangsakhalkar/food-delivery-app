import { isOpenNow } from "@/lib/opening-hours";
import type { Restaurant } from "@/models/restaurant";

/** What anyone may see about a restaurant. Never includes owner or admin fields. */
export type PublicRestaurant = {
  /** Computed on the server from opening hours (IST) at request time. */
  isOpen: boolean;
} & Pick<
  Restaurant,
  | "id"
  | "name"
  | "cuisine"
  | "address"
  | "imageUrl"
  | "deliveryTimeMin"
  | "avgRating"
  | "ratingCount"
  | "opensAt"
  | "closesAt"
>;

export const toPublic = (r: Restaurant, now: Date = new Date()): PublicRestaurant => ({
  isOpen: isOpenNow(r.opensAt, r.closesAt, now),
  id: r.id,
  name: r.name,
  cuisine: r.cuisine,
  address: r.address,
  imageUrl: r.imageUrl,
  deliveryTimeMin: r.deliveryTimeMin,
  avgRating: r.avgRating,
  ratingCount: r.ratingCount,
  opensAt: r.opensAt,
  closesAt: r.closesAt,
});

export interface PublicMenuItem {
  id: string;
  name: string;
  description: string;
  pricePaise: number;
  isVeg: boolean;
  isAvailable: boolean;
  imageUrl: string | null;
}

export interface PublicMenuCategory {
  id: string;
  name: string;
  items: PublicMenuItem[];
}

export interface RestaurantWithMenu {
  restaurant: PublicRestaurant;
  categories: PublicMenuCategory[];
}
