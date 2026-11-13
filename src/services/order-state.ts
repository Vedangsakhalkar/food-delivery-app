import { ConflictError } from "@/lib/errors";
import type { OrderStatus } from "@/models/order";

export type Actor = "customer" | "owner";

/**
 * The order status state machine, in one place.
 * placed -> accepted -> preparing -> out_for_delivery -> delivered   (owner)
 * placed -> rejected                                                 (owner)
 * placed -> cancelled                                                (customer, before acceptance)
 */
const TRANSITIONS: Record<OrderStatus, Partial<Record<OrderStatus, Actor>>> = {
  placed: { accepted: "owner", rejected: "owner", cancelled: "customer" },
  accepted: { preparing: "owner" },
  preparing: { out_for_delivery: "owner" },
  out_for_delivery: { delivered: "owner" },
  delivered: {},
  rejected: {},
  cancelled: {},
};

export function canTransition(from: OrderStatus, to: OrderStatus, actor: Actor): boolean {
  return TRANSITIONS[from][to] === actor;
}

/** Statuses an actor can move an order to from its current status. */
export function nextStatuses(from: OrderStatus, actor: Actor): OrderStatus[] {
  return (Object.entries(TRANSITIONS[from]) as [OrderStatus, Actor][])
    .filter(([, a]) => a === actor)
    .map(([s]) => s);
}

/** Throws 409 for an invalid transition. */
export function assertTransition(from: OrderStatus, to: OrderStatus, actor: Actor): void {
  if (!canTransition(from, to, actor)) {
    throw new ConflictError(
      `An order that is ${from.replaceAll("_", " ")} cannot be changed to ${to.replaceAll("_", " ")}`,
    );
  }
}
