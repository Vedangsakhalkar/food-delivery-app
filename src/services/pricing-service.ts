import { DELIVERY_FEE_PAISE, TAX_RATE_PERCENT } from "@/config/pricing";

export interface PriceBreakdown {
  subtotalPaise: number;
  taxPaise: number;
  deliveryFeePaise: number;
  totalPaise: number;
}

/**
 * The only place that does order maths. Everything is integer paise; tax is rounded
 * half-up once, on the subtotal. Used by the quote endpoint and when an order is placed.
 */
export function calculatePrice(
  lines: { unitPricePaise: number; qty: number }[],
  opts: { taxPercent?: number; deliveryFeePaise?: number } = {},
): PriceBreakdown {
  const taxPercent = opts.taxPercent ?? TAX_RATE_PERCENT;
  const deliveryFeePaise = lines.length === 0 ? 0 : (opts.deliveryFeePaise ?? DELIVERY_FEE_PAISE);
  const subtotalPaise = lines.reduce((sum, l) => sum + l.unitPricePaise * l.qty, 0);
  const taxPaise = Math.floor((subtotalPaise * taxPercent + 50) / 100);
  return {
    subtotalPaise,
    taxPaise,
    deliveryFeePaise,
    totalPaise: subtotalPaise + taxPaise + deliveryFeePaise,
  };
}
