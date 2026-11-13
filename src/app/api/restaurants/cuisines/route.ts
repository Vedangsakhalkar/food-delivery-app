import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/handle-error";
import { discoveryService } from "@/services/discovery-service";

/** Public: distinct cuisines of active restaurants, for the filter chips. */
export const GET = withErrorHandling(async () => {
  return NextResponse.json({ cuisines: await discoveryService.cuisines() });
});
