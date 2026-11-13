import { describe, expect, it } from "vitest";
import { forgotPasswordSchema, resetPasswordSchema, signInSchema } from "@/validators/auth";

describe("auth validators", () => {
  it("normalises and validates email", () => {
    expect(forgotPasswordSchema.parse({ email: " A@B.co " }).email).toBe("a@b.co");
    expect(forgotPasswordSchema.safeParse({ email: "nope" }).success).toBe(false);
  });
  it("requires 8+ char new passwords", () => {
    expect(resetPasswordSchema.safeParse({ password: "1234567" }).success).toBe(false);
    expect(resetPasswordSchema.safeParse({ password: "12345678" }).success).toBe(true);
  });
  it("requires a sign-in password", () => {
    expect(signInSchema.safeParse({ email: "a@b.co", password: "" }).success).toBe(false);
  });
});
