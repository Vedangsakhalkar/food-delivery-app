import { describe, expect, it } from "vitest";
import { STATUS_FLOW, isFinalStatus } from "@/lib/order-status";

describe("order status helpers", () => {
  it("knows the happy path order", () => {
    expect(STATUS_FLOW).toEqual([
      "placed",
      "accepted",
      "preparing",
      "out_for_delivery",
      "delivered",
    ]);
  });
  it("treats delivered, rejected and cancelled as final", () => {
    expect(["delivered", "rejected", "cancelled"].every((s) => isFinalStatus(s as never))).toBe(
      true,
    );
    expect(
      ["placed", "accepted", "preparing", "out_for_delivery"].some((s) =>
        isFinalStatus(s as never),
      ),
    ).toBe(false);
  });
});
