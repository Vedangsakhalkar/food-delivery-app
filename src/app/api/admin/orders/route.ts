import { NextResponse } from "next/server";
import { ROLES_FOR } from "@/lib/access-rules";
import { requireUser } from "@/lib/auth";
import { withErrorHandling } from "@/lib/handle-error";
import { adminService } from "@/services/admin-service";
import { adminListOrdersSchema } from "@/validators/admin";

/** Read-only: admin only. */
export const GET = withErrorHandling(async (req) => {
  await requireUser(ROLES_FOR.admin);
  const q = adminListOrdersSchema.parse(Object.fromEntries(new URL(req.url).searchParams));
  return NextResponse.json(await adminService.listOrders(q));
});
