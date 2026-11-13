import type { OrderStatus } from "@/models/order";

/** The happy path, in order. Rejected and cancelled are side exits. */
export const STATUS_FLOW = [
  "placed",
  "accepted",
  "preparing",
  "out_for_delivery",
  "delivered",
] as const;

export const FINAL_STATUSES: readonly OrderStatus[] = ["delivered", "rejected", "cancelled"];
export const isFinalStatus = (s: OrderStatus) => FINAL_STATUSES.includes(s);
