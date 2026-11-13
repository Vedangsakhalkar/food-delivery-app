import { ConflictError, NotFoundError } from "@/lib/errors";
import { decodeCursor, encodeCursor } from "@/lib/pagination";
import { logger, serializeError } from "@/lib/logger";
import type { Order } from "@/models/order";
import type { User } from "@/models/user";
import { orderRepository, type OrderRepository } from "@/repositories/order-repository";
import { addressService, type createAddressService } from "@/services/address-service";
import { quoteService, type createQuoteService } from "@/services/quote-service";
import type { PlaceOrderInput } from "@/validators/order";

type Quotes = Pick<ReturnType<typeof createQuoteService>, "priceCart">;
type Addresses = Pick<ReturnType<typeof createAddressService>, "getOwned">;

/** Called after an order is committed (emails hook in here). Failures never affect the order. */
export type OrderPlacedHook = (order: Order) => Promise<void> | void;

const MESSAGES = {
  restaurant_closed: "This restaurant is closed right now",
  item_unavailable: "Some items are no longer available",
  item_not_found: "Some items are no longer on the menu",
} as const;

export function createOrderService(deps: {
  orders: OrderRepository;
  quotes: Quotes;
  addresses: Addresses;
  onPlaced?: OrderPlacedHook[];
}) {
  const { orders, quotes, addresses, onPlaced = [] } = deps;

  return {
    /**
     * Places a cash-on-delivery order. Everything the client sent is re-checked: the restaurant is
     * open and active, every item exists, is available and belongs to it, and the totals are
     * recomputed from database prices. Order, items and address snapshot are saved in one transaction.
     */
    async placeOrder(customer: User, input: PlaceOrderInput, now?: Date): Promise<Order> {
      const priced = await quotes.priceCart(input, now);
      const { quote } = priced;
      if (quote.issues.length > 0) {
        const first = quote.issues[0];
        throw new ConflictError(MESSAGES[first.code], { issues: quote.issues });
      }

      const a = await addresses.getOwned(customer, input.addressId);
      const order = await orders.create({
        customerId: customer.id,
        restaurantId: priced.restaurant.id,
        address: { label: a.label, line1: a.line1, city: a.city, pincode: a.pincode },
        subtotalPaise: quote.subtotalPaise,
        taxPaise: quote.taxPaise,
        deliveryFeePaise: quote.deliveryFeePaise,
        totalPaise: quote.totalPaise,
        notes: input.notes,
        items: quote.lines.map((l) => ({
          menuItemId: l.itemId,
          name: l.name,
          pricePaise: l.unitPricePaise,
          quantity: l.qty,
        })),
      });

      for (const hook of onPlaced) {
        try {
          await hook(order);
        } catch (err) {
          logger.error("order placed hook failed", { orderId: order.id, ...serializeError(err) });
        }
      }
      return order;
    },

    /** The customer's own orders, newest first, with cursor pagination. */
    async listForCustomer(
      customer: User,
      q: { limit: number; cursor?: string },
    ): Promise<{ orders: Order[]; nextCursor: string | null }> {
      const offset = decodeCursor(q.cursor);
      const rows = await orders.listByCustomer(customer.id, { limit: q.limit + 1, offset });
      return {
        orders: rows.slice(0, q.limit),
        nextCursor: rows.length > q.limit ? encodeCursor(offset + q.limit) : null,
      };
    },

    /** A customer can only ever read their own orders. */
    async getForCustomer(customer: User, id: string): Promise<Order> {
      const order = await orders.findById(id);
      if (!order || order.customerId !== customer.id) throw new NotFoundError("Order not found");
      return order;
    },
  };
}

export const orderService = createOrderService({
  orders: orderRepository,
  quotes: quoteService,
  addresses: addressService,
});
