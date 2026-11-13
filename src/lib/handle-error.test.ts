import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { toErrorResponse, withErrorHandling } from "@/lib/handle-error";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  RateLimitError,
  UnauthorizedError,
  ValidationError,
} from "@/lib/errors";

async function run(err: unknown) {
  const res = toErrorResponse(err, "rid-1");
  return { status: res.status, body: await res.json(), res };
}

describe("toErrorResponse", () => {
  it.each([
    [new UnauthorizedError(), 401, "unauthorized"],
    [new ForbiddenError(), 403, "forbidden"],
    [new NotFoundError(), 404, "not_found"],
    [new ConflictError(), 409, "conflict"],
    [new ValidationError("bad", { a: 1 }), 422, "validation_error"],
  ])("maps %s", async (err, status, code) => {
    const r = await run(err);
    expect(r.status).toBe(status);
    expect(r.body.error.code).toBe(code);
    expect(r.res.headers.get("x-request-id")).toBe("rid-1");
  });

  it("maps ZodError to 422 with details", async () => {
    const parsed = z.object({ name: z.string() }).safeParse({});
    const r = await run(parsed.error);
    expect(r.status).toBe(422);
    expect(r.body.error.details[0].path).toBe("name");
  });

  it("sets Retry-After for rate limit errors", async () => {
    const r = await run(new RateLimitError("slow down", 30));
    expect(r.status).toBe(429);
    expect(r.res.headers.get("retry-after")).toBe("30");
  });

  it("returns a generic 500 and hides internals for unexpected errors", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const r = await run(new Error("secret db password leaked"));
    expect(r.status).toBe(500);
    expect(JSON.stringify(r.body)).not.toContain("secret");
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe("withErrorHandling", () => {
  it("converts thrown errors into responses", async () => {
    const handler = withErrorHandling(async () => {
      throw new NotFoundError("nope");
    });
    const res = await handler(new Request("http://x/api"), undefined);
    expect(res.status).toBe(404);
  });
});
