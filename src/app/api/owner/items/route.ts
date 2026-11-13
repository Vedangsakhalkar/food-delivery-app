import { NextResponse } from "next/server";
import { ROLES_FOR } from "@/lib/access-rules";
import { requireUser } from "@/lib/auth";
import { withErrorHandling } from "@/lib/handle-error";
import { menuItemService } from "@/services/menu-item-service";
import { itemSchema } from "@/validators/menu";

export const GET = withErrorHandling(async () => {
  const owner = await requireUser(ROLES_FOR.owner);
  return NextResponse.json({ items: await menuItemService.list(owner) });
});

export const POST = withErrorHandling(async (req) => {
  const owner = await requireUser(ROLES_FOR.owner);
  const input = itemSchema.parse(await req.json().catch(() => ({})));
  return NextResponse.json({ item: await menuItemService.create(owner, input) }, { status: 201 });
});
