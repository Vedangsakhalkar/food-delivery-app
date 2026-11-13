import { NotFoundError } from "@/lib/errors";
import { isOpenNow } from "@/lib/opening-hours";
import type { Restaurant } from "@/models/restaurant";
import type { MenuItem } from "@/models/menu";
import { menuItemRepository, type MenuItemRepository } from "@/repositories/menu-item-repository";
import {
  restaurantRepository,
  type RestaurantRepository,
} from "@/repositories/restaurant-repository";
import { calculatePrice, type PriceBreakdown } from "@/services/pricing-service";
import type { CartInput } from "@/validators/order";

export type QuoteIssue =
  | { code: "restaurant_closed" }
  | { code: "item_not_found"; itemId: string }
  | { code: "item_unavailable"; itemId: string; name: string };

export interface QuoteLine {
  itemId: string;
  name: string;
  isVeg: boolean;
  qty: number;
  unitPricePaise: number;
  linePaise: number;
}

export interface Quote extends PriceBreakdown {
  restaurant: { id: string; name: string; isOpen: boolean };
  lines: QuoteLine[];
  issues: QuoteIssue[];
}

export interface PricedCart {
  restaurant: Restaurant;
  items: Map<string, MenuItem>;
  quote: Quote;
}

export function createQuoteService(
  restaurants: Pick<RestaurantRepository, "findActiveById">,
  items: Pick<MenuItemRepository, "listByRestaurant">,
) {
  return {
    /**
     * Prices a cart from database prices (the client's numbers are never trusted).
     * Problems are returned as `issues` so the UI can explain them; placing an order refuses if any exist.
     */
    async priceCart(cart: CartInput, now: Date = new Date()): Promise<PricedCart> {
      const restaurant = await restaurants.findActiveById(cart.restaurantId);
      if (!restaurant) throw new NotFoundError("This restaurant is no longer available");
      const byId = new Map((await items.listByRestaurant(restaurant.id)).map((i) => [i.id, i]));

      const issues: QuoteIssue[] = [];
      const isOpen = isOpenNow(restaurant.opensAt, restaurant.closesAt, now);
      if (!isOpen) issues.push({ code: "restaurant_closed" });

      const lines: QuoteLine[] = [];
      for (const l of cart.lines) {
        const item = byId.get(l.itemId);
        if (!item) {
          issues.push({ code: "item_not_found", itemId: l.itemId });
        } else if (!item.isAvailable) {
          issues.push({ code: "item_unavailable", itemId: item.id, name: item.name });
        } else {
          lines.push({
            itemId: item.id,
            name: item.name,
            isVeg: item.isVeg,
            qty: l.qty,
            unitPricePaise: item.pricePaise,
            linePaise: item.pricePaise * l.qty,
          });
        }
      }
      const price = calculatePrice(lines);
      return {
        restaurant,
        items: byId,
        quote: {
          restaurant: { id: restaurant.id, name: restaurant.name, isOpen },
          lines,
          issues,
          ...price,
        },
      };
    },

    async quote(cart: CartInput, now?: Date): Promise<Quote> {
      return (await this.priceCart(cart, now)).quote;
    },
  };
}

export const quoteService = createQuoteService(restaurantRepository, menuItemRepository);
