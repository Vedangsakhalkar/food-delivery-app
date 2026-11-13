import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError, RateLimitError } from "@/lib/errors";
import { logger, serializeError } from "@/lib/logger";

export type ErrorBody = { error: { code: string; message: string; details?: unknown } };

/** Maps any thrown value to the standard error response. Unexpected errors never leak details. */
export function toErrorResponse(err: unknown, requestId: string = crypto.randomUUID()) {
  const headers: Record<string, string> = { "x-request-id": requestId };

  if (err instanceof ZodError) {
    const body: ErrorBody = {
      error: {
        code: "validation_error",
        message: "Validation failed",
        details: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      },
    };
    return NextResponse.json(body, { status: 422, headers });
  }

  if (err instanceof AppError) {
    if (err instanceof RateLimitError) headers["retry-after"] = String(err.retryAfterSeconds);
    const body: ErrorBody = {
      error: {
        code: err.code,
        message: err.message,
        ...(err.details !== undefined ? { details: err.details } : {}),
      },
    };
    return NextResponse.json(body, { status: err.status, headers });
  }

  logger.error("unhandled error", { requestId, ...serializeError(err) });
  const body: ErrorBody = {
    error: { code: "internal_error", message: "Something went wrong. Please try again." },
  };
  return NextResponse.json(body, { status: 500, headers });
}

type Handler<C> = (req: Request, ctx: C) => Promise<Response> | Response;

/** Wraps a route handler so every thrown error becomes the standard error body. */
export function withErrorHandling<C = unknown>(handler: Handler<C>): Handler<C> {
  return async (req, ctx) => {
    const requestId = req.headers.get("x-request-id") ?? crypto.randomUUID();
    try {
      return await handler(req, ctx);
    } catch (err) {
      return toErrorResponse(err, requestId);
    }
  };
}
