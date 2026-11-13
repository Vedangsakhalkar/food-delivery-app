import { NextResponse } from "next/server";
import { ROLES_FOR } from "@/lib/access-rules";
import { requireUser } from "@/lib/auth";
import { withErrorHandling } from "@/lib/handle-error";
import { enforce } from "@/lib/rate-limit";
import { limiters } from "@/lib/rate-limiters";
import { quoteService } from "@/services/quote-service";
import { cartSchema } from "@/validators/order";

/** Server-computed subtotal, tax, delivery fee and total for a cart. Customers only. */
export const POST = withErrorHandling(async (req) => {
  const customer = await requireUser(ROLES_FOR.customer);
  enforce(limiters.quote, customer.id);
  const cart = cartSchema.parse(await req.json().catch(() => ({})));
  return NextResponse.json(await quoteService.quote(cart));
});
