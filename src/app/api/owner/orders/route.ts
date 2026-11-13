import { NextResponse } from "next/server";
import { ROLES_FOR } from "@/lib/access-rules";
import { requireUser } from "@/lib/auth";
import { withErrorHandling } from "@/lib/handle-error";
import { ownerOrderService } from "@/services/owner-order-service";
import { ownerListOrdersSchema } from "@/validators/order";

export const GET = withErrorHandling(async (req) => {
  const owner = await requireUser(ROLES_FOR.owner);
  const q = ownerListOrdersSchema.parse(Object.fromEntries(new URL(req.url).searchParams));
  return NextResponse.json(
    await ownerOrderService.list(owner, { statuses: q.status, limit: q.limit, cursor: q.cursor }),
  );
});
