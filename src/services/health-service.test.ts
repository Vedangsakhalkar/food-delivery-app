import { describe, expect, it, vi } from "vitest";
import { createHealthService } from "@/services/health-service";

describe("healthService", () => {
  it("reports up when the database answers", async () => {
    const s = createHealthService({ ping: async () => true });
    expect(await s.check()).toEqual({ status: "ok", db: "up" });
  });
  it("reports down instead of throwing when the database fails", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const s = createHealthService({
      ping: async () => {
        throw new Error("boom");
      },
    });
    expect(await s.check()).toEqual({ status: "degraded", db: "down" });
    spy.mockRestore();
  });
});
