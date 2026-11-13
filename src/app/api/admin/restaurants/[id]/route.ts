import { NextResponse } from "next/server";
import { z } from "zod";
import { ROLES_FOR } from "@/lib/access-rules";
import { requireUser } from "@/lib/auth";
import { NotFoundError } from "@/lib/errors";
import { withErrorHandling } from "@/lib/handle-error";
import { adminService } from "@/services/admin-service";
import { setDisabledSchema } from "@/validators/admin";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withErrorHandling<Ctx>(async (req, ctx) => {
  await requireUser(ROLES_FOR.admin);
  const id = z.uuid().safeParse((await ctx.params).id);
  if (!id.success) throw new NotFoundError("Restaurant not found");
  const { disabled, reason } = setDisabledSchema.parse(await req.json().catch(() => ({})));
  return NextResponse.json({
    restaurant: await adminService.setRestaurantDisabled(id.data, disabled, reason),
  });
});
