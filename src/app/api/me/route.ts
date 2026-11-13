import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { withErrorHandling } from "@/lib/handle-error";

export const GET = withErrorHandling(async () => {
  const user = await requireUser();
  return NextResponse.json({ user });
});
