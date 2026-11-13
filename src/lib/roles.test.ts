import { describe, expect, it } from "vitest";
import { HOME_BY_ROLE } from "@/lib/roles";

describe("HOME_BY_ROLE", () => {
  it("redirects each role to its home", () => {
    expect(HOME_BY_ROLE).toEqual({ customer: "/", owner: "/owner", admin: "/admin" });
  });
});
