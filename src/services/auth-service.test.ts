import { describe, expect, it, vi } from "vitest";
import { createAuthService } from "@/services/auth-service";
import { ConflictError } from "@/lib/errors";
import { signUpSchema } from "@/validators/auth";

const input = signUpSchema.parse({
  name: "Asha",
  phone: "+91 98765 43210",
  email: "Asha@Example.com",
  password: "password1",
  role: "owner",
});

describe("signUpSchema", () => {
  it("normalises phone and email", () => {
    expect(input.phone).toBe("+919876543210");
    expect(input.email).toBe("asha@example.com");
  });
  it.each(["admin", "superuser", ""])("rejects role %s", (role) => {
    expect(signUpSchema.safeParse({ ...input, role }).success).toBe(false);
  });
  it("rejects short passwords and bad phones", () => {
    expect(signUpSchema.safeParse({ ...input, password: "short" }).success).toBe(false);
    expect(signUpSchema.safeParse({ ...input, phone: "12345" }).success).toBe(false);
  });
});

describe("authService.signUp", () => {
  it("passes role, name and phone as user metadata", async () => {
    const signUp = vi.fn(async () => ({ alreadyRegistered: false }));
    await createAuthService({ signUp }).signUp(input, "http://x/auth/callback");
    expect(signUp).toHaveBeenCalledWith(
      expect.objectContaining({ data: { name: "Asha", phone: "+919876543210", role: "owner" } }),
    );
  });
  it("throws ConflictError when the email is already registered", async () => {
    const svc = createAuthService({ signUp: async () => ({ alreadyRegistered: true }) });
    await expect(svc.signUp(input, "x")).rejects.toBeInstanceOf(ConflictError);
  });
});
