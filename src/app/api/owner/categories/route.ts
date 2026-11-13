import { NextResponse } from "next/server";
import { ROLES_FOR } from "@/lib/access-rules";
import { requireUser } from "@/lib/auth";
import { withErrorHandling } from "@/lib/handle-error";
import { menuCategoryService } from "@/services/menu-category-service";
import { categorySchema } from "@/validators/menu";

export const GET = withErrorHandling(async () => {
  const owner = await requireUser(ROLES_FOR.owner);
  return NextResponse.json({ categories: await menuCategoryService.list(owner) });
});

export const POST = withErrorHandling(async (req) => {
  const owner = await requireUser(ROLES_FOR.owner);
  const { name } = categorySchema.parse(await req.json().catch(() => ({})));
  return NextResponse.json(
    { category: await menuCategoryService.create(owner, name) },
    { status: 201 },
  );
});
