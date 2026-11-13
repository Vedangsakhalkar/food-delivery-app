import { NextResponse } from "next/server";
import { ROLES_FOR } from "@/lib/access-rules";
import { requireUser } from "@/lib/auth";
import { withErrorHandling } from "@/lib/handle-error";
import { quoteService } from "@/services/quote-service";
import { cartSchema } from "@/validators/order";

/** Server-computed subtotal, tax, delivery fee and total for a cart. Customers only. */
export const POST = withErrorHandling(async (req) => {
  await requireUser(ROLES_FOR.customer);
  const cart = cartSchema.parse(await req.json().catch(() => ({})));
  return NextResponse.json(await quoteService.quote(cart));
});
