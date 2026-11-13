import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/handle-error";
import { healthService } from "@/services/health-service";

export const dynamic = "force-dynamic";

export const GET = withErrorHandling(async () => {
  const result = await healthService.check();
  return NextResponse.json(result, { status: result.db === "up" ? 200 : 503 });
});
