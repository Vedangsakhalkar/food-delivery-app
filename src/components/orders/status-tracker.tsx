import { STATUS_LABEL } from "@/components/orders/status-badge";
import { STATUS_FLOW } from "@/lib/order-status";
import type { OrderStatus } from "@/models/order";
import { cn } from "@/lib/utils";

/** Placed → Accepted → Preparing → Out for delivery → Delivered (mock C9). */
export function StatusTracker({ status }: { status: OrderStatus }) {
  const current = STATUS_FLOW.indexOf(status as (typeof STATUS_FLOW)[number]);
  return (
    <ol className="flex flex-wrap gap-1.5" aria-label="Order progress">
      {STATUS_FLOW.map((s, i) => {
        const done = i < current || (status === "delivered" && i === current);
        const cur = i === current && status !== "delivered";
        return (
          <li
            key={s}
            aria-current={cur ? "step" : undefined}
            className={cn(
              "min-w-[90px] flex-1 rounded-lg bg-muted px-1 py-2 text-center text-xs",
              done && "bg-green-100 font-semibold text-green-700",
              cur && "bg-primary font-semibold text-primary-foreground",
            )}
          >
            {STATUS_LABEL[s]}
          </li>
        );
      })}
    </ol>
  );
}
