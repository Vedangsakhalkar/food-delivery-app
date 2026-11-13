import type { OrderStatus } from "@/models/order";
import { cn } from "@/lib/utils";

export const STATUS_LABEL: Record<OrderStatus, string> = {
  placed: "Placed",
  accepted: "Accepted",
  preparing: "Preparing",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

const TONE: Record<OrderStatus, string> = {
  placed: "bg-amber-100 text-amber-800",
  accepted: "bg-amber-100 text-amber-800",
  preparing: "bg-amber-100 text-amber-800",
  out_for_delivery: "bg-amber-100 text-amber-800",
  delivered: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  cancelled: "bg-red-100 text-red-700",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={cn("rounded-md px-2 py-0.5 text-xs font-semibold", TONE[status])}>
      {STATUS_LABEL[status]}
    </span>
  );
}
