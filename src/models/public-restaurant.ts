import type { Restaurant } from "@/models/restaurant";

/** What anyone may see about a restaurant. Never includes owner or admin fields. */
export type PublicRestaurant = Pick<
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

export const toPublic = (r: Restaurant): PublicRestaurant => ({
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
