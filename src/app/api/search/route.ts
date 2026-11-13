import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/handle-error";
import { searchService } from "@/services/search-service";
import { searchSchema } from "@/validators/discovery";

/** Public: no login required. */
export const GET = withErrorHandling(async (req) => {
  const { q } = searchSchema.parse(Object.fromEntries(new URL(req.url).searchParams));
  return NextResponse.json(await searchService.search(q));
});
