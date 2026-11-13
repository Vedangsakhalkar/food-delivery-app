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

export const adminListOrdersSchema = z.object({
  status: z
    .enum([
      "placed",
      "accepted",
      "preparing",
      "out_for_delivery",
      "delivered",
      "rejected",
      "cancelled",
    ])
    .optional(),
  /** order code search, e.g. "10234" or "DAB-10234" */
  code: z.string().trim().max(30).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  cursor: z.string().max(200).optional(),
});

export const adminListUsersSchema = z.object({
  role: z.enum(["customer", "owner", "admin"]).optional(),
  /** matches email or name */
  q: z.string().trim().max(60).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  cursor: z.string().max(200).optional(),
});
