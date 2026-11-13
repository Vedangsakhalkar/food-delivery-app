import { formatMoney } from "@/lib/format";
import type { PriceBreakdown } from "@/services/pricing-service";

/** Subtotal, taxes, delivery fee and total (mocks C5, C6). */
export function PriceSummary({ price }: { price: PriceBreakdown }) {
  const row = (label: string, paise: number, strong = false) => (
    <div
      className={`flex items-center justify-between ${strong ? "border-t pt-3 font-semibold" : ""}`}
    >
      <span className={strong ? "" : "text-muted-foreground"}>{label}</span>
      <span>{formatMoney(paise)}</span>
    </div>
  );
  return (
    <div className="flex flex-col gap-2" aria-label="Price summary">
      {row("Subtotal", price.subtotalPaise)}
      {row("Taxes", price.taxPaise)}
      {row("Delivery fee", price.deliveryFeePaise)}
      {row("Total", price.totalPaise, true)}
    </div>
  );
}
