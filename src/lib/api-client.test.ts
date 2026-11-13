import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, apiFetch } from "@/lib/api-client";

const mockFetch = (status: number, body: unknown) =>
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(body === null ? null : JSON.stringify(body), { status })),
  );

afterEach(() => vi.unstubAllGlobals());

describe("apiFetch", () => {
  it("returns parsed JSON on success", async () => {
    mockFetch(200, { ok: true });
    expect(await apiFetch<{ ok: boolean }>("/api/x")).toEqual({ ok: true });
  });

  it("throws a typed ApiError from the standard error body", async () => {
    mockFetch(409, { error: { code: "conflict", message: "Already exists", details: { a: 1 } } });
    await expect(apiFetch("/api/x", { method: "POST", body: {} })).rejects.toMatchObject({
      status: 409,
      code: "conflict",
      message: "Already exists",
      details: { a: 1 },
    });
  });

  it("falls back to a generic ApiError for non-standard failures", async () => {
    mockFetch(502, null);
    const err: unknown = await apiFetch("/api/x").catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).code).toBe("unknown_error");
  });
});
