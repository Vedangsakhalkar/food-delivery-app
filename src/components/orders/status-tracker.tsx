import { Bike, Check, ChefHat, ClipboardCheck, PackageCheck, Receipt } from "lucide-react";
import { STATUS_LABEL } from "@/components/orders/status-badge";
import { STATUS_FLOW } from "@/lib/order-status";
import type { OrderStatus } from "@/models/order";
import { cn } from "@/lib/utils";

const ICON = {
  placed: Receipt,
  accepted: ClipboardCheck,
  preparing: ChefHat,
  out_for_delivery: Bike,
  delivered: PackageCheck,
} as const;

/** Placed → Accepted → Preparing → Out for delivery → Delivered (mock C9), with icons and a pulsing current step. */
export function StatusTracker({ status }: { status: OrderStatus }) {
  const current = STATUS_FLOW.indexOf(status as (typeof STATUS_FLOW)[number]);
  return (
    <ol className="flex items-start" aria-label="Order progress">
      {STATUS_FLOW.map((s, i) => {
        const finished = i < current || (status === "delivered" && i === current);
        const cur = i === current && status !== "delivered";
        const Icon = finished ? Check : ICON[s];
        return (
          <li
            key={s}
            aria-current={cur ? "step" : undefined}
            className="relative flex flex-1 flex-col items-center gap-1.5 text-center"
          >
            {i > 0 && (
              <span
                aria-hidden
                className={cn(
                  "absolute top-5 right-1/2 h-0.5 w-full -translate-y-1/2",
                  i <= current ? "bg-green-600" : "bg-muted",
                )}
              />
            )}
            <span
              className={cn(
                "relative z-[1] grid size-10 place-items-center rounded-full border-2 bg-white",
                finished && "border-green-600 bg-green-600 text-white",
                cur && "animate-pulse border-primary bg-primary text-primary-foreground",
                !finished && !cur && "border-muted text-muted-foreground",
              )}
            >
              <Icon className="size-5" aria-hidden />
            </span>
            <span
              className={cn(
                "text-xs leading-tight",
                cur
                  ? "font-bold text-primary"
                  : finished
                    ? "font-semibold"
                    : "text-muted-foreground",
              )}
            >
              {STATUS_LABEL[s]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
