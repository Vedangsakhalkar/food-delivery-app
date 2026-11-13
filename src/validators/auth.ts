import { z } from "zod";

/** Indian mobile number, optional +91, spaces and dashes allowed. Returns digits only. */
export const phoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, ""))
  .refine((v) => /^(\+91)?[6-9]\d{9}$/.test(v), "Enter a valid 10-digit mobile number");

export const emailSchema = z.string().trim().toLowerCase().pipe(z.email("Enter a valid email"));

export const passwordSchema = z.string().min(8, "Password must be at least 8 characters").max(72);

export const signUpSchema = z.object({
  name: z.string().trim().min(1, "Enter your name").max(100),
  phone: phoneSchema,
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(["customer", "owner"], { message: "Choose Customer or Owner" }),
});
export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password"),
});
export type SignInInput = z.infer<typeof signInSchema>;

export const forgotPasswordSchema = z.object({ email: emailSchema });
export const resetPasswordSchema = z.object({ password: passwordSchema });

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1, "Enter your name").max(100),
  phone: phoneSchema,
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
