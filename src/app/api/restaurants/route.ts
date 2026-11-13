import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/handle-error";
import { discoveryService } from "@/services/discovery-service";
import { listRestaurantsSchema } from "@/validators/discovery";

/** Public: no login required. */
export const GET = withErrorHandling(async (req) => {
  const params = Object.fromEntries(new URL(req.url).searchParams);
  const query = listRestaurantsSchema.parse(params);
  return NextResponse.json(await discoveryService.list(query));
});
