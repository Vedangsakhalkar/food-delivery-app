import { describe, expect, it } from "vitest";
import { isAllowed, ruleForPath } from "@/lib/access-rules";

describe("ruleForPath", () => {
  it.each(["/", "/search", "/restaurants/12", "/login", "/signup", "/forgot-password", "/privacy"])(
    "%s is public",
    (p) => expect(ruleForPath(p)).toBeUndefined(),
  );
  it.each(["/owner", "/owner/menu", "/admin/users", "/cart", "/checkout", "/orders/5", "/profile"])(
    "%s is protected",
    (p) => expect(ruleForPath(p)).toBeDefined(),
  );
  it("does not match look-alike prefixes", () => {
    expect(ruleForPath("/ownership")).toBeUndefined();
  });
});

describe("isAllowed", () => {
  it("enforces roles and allows any signed-in user on role-less rules", () => {
    expect(isAllowed(ruleForPath("/owner")!, "owner")).toBe(true);
    expect(isAllowed(ruleForPath("/owner")!, "customer")).toBe(false);
    expect(isAllowed(ruleForPath("/admin")!, "owner")).toBe(false);
    expect(isAllowed(ruleForPath("/profile")!, "admin")).toBe(true);
  });
});
