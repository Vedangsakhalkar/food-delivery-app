import { describe, expect, it } from "vitest";
import { ConflictError } from "@/lib/errors";
import { assertTransition, canTransition, nextStatuses } from "@/services/order-state";
import { ORDER_STATUSES } from "@/models/order";

describe("order state machine", () => {
  it("lets the owner walk the happy path one step at a time", () => {
    expect(canTransition("placed", "accepted", "owner")).toBe(true);
    expect(canTransition("accepted", "preparing", "owner")).toBe(true);
    expect(canTransition("preparing", "out_for_delivery", "owner")).toBe(true);
    expect(canTransition("out_for_delivery", "delivered", "owner")).toBe(true);
    expect(canTransition("placed", "rejected", "owner")).toBe(true);
  });

  it("only lets customers cancel, and only while placed", () => {
    expect(canTransition("placed", "cancelled", "customer")).toBe(true);
    for (const from of ORDER_STATUSES.filter((s) => s !== "placed")) {
      expect(canTransition(from, "cancelled", "customer")).toBe(false);
    }
    expect(canTransition("placed", "accepted", "customer")).toBe(false);
    expect(canTransition("placed", "cancelled", "owner")).toBe(false);
  });

  it("blocks skipping steps, going backwards and changing final orders", () => {
    expect(canTransition("placed", "delivered", "owner")).toBe(false);
    expect(canTransition("placed", "preparing", "owner")).toBe(false);
    expect(canTransition("preparing", "accepted", "owner")).toBe(false);
    for (const final of ["delivered", "rejected", "cancelled"] as const) {
      expect(nextStatuses(final, "owner")).toEqual([]);
      expect(nextStatuses(final, "customer")).toEqual([]);
    }
  });

  it("assertTransition throws a 409 for invalid moves", () => {
    expect(() => assertTransition("delivered", "preparing", "owner")).toThrow(ConflictError);
    expect(() => assertTransition("placed", "accepted", "owner")).not.toThrow();
  });

  it("lists what each actor can do next", () => {
    expect(nextStatuses("placed", "owner").sort()).toEqual(["accepted", "rejected"]);
    expect(nextStatuses("placed", "customer")).toEqual(["cancelled"]);
  });
});
