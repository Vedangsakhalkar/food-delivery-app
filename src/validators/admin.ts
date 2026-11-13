import { z } from "zod";

export const adminListRestaurantsSchema = z.object({
  status: z
    .enum(["active", "disabled"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "disabled")),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  cursor: z.string().max(200).optional(),
});

export const setDisabledSchema = z
  .object({
    disabled: z.boolean(),
    reason: z.string().trim().max(200).optional(),
  })
  .refine((v) => !v.disabled || (v.reason && v.reason.length > 0), {
    path: ["reason"],
    message: "Give a short reason for disabling this restaurant",
  });
