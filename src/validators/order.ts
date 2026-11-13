import { z } from "zod";
import { MAX_LINE_QTY } from "@/config/pricing";

export const cartLineSchema = z.object({
  itemId: z.uuid(),
  qty: z.number().int().min(1).max(MAX_LINE_QTY),
});

export const cartSchema = z.object({
  restaurantId: z.uuid(),
  lines: z
    .array(cartLineSchema)
    .min(1, "Your cart is empty")
    .max(50)
    .refine((l) => new Set(l.map((x) => x.itemId)).size === l.length, "Duplicate items in cart"),
});
export type CartInput = z.output<typeof cartSchema>;

export const listOrdersSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
  cursor: z.string().max(200).optional(),
});

export const placeOrderSchema = cartSchema.extend({
  addressId: z.uuid("Choose a delivery address"),
  /** Cash on delivery is the only payment method in the MVP. */
  paymentMethod: z.literal("cod"),
  notes: z
    .string()
    .trim()
    .max(200, "At most 200 characters")
    .optional()
    .transform((v) => v || null),
});
export type PlaceOrderInput = z.output<typeof placeOrderSchema>;

const statusEnum = z.enum([
  "placed",
  "accepted",
  "preparing",
  "out_for_delivery",
  "delivered",
  "rejected",
  "cancelled",
]);

/** Comma separated statuses, e.g. "delivered,rejected,cancelled". Default: orders still in progress. */
export const ownerListOrdersSchema = z.object({
  status: z
    .string()
    .max(100)
    .optional()
    .transform((v, ctx) => {
      if (!v)
        return ["placed", "accepted", "preparing", "out_for_delivery"] as z.infer<
          typeof statusEnum
        >[];
      const parts = v.split(",").map((s) => s.trim());
      const parsed = z.array(statusEnum).min(1).safeParse(parts);
      if (!parsed.success) {
        ctx.addIssue({ code: "custom", message: "Unknown order status" });
        return z.NEVER;
      }
      return parsed.data;
    }),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().max(200).optional(),
});

export const updateStatusSchema = z
  .object({
    status: statusEnum,
    reason: z.string().trim().max(200).optional(),
  })
  .refine((v) => v.status !== "rejected" || (v.reason && v.reason.length > 0), {
    path: ["reason"],
    message: "Give a short reason for rejecting the order",
  });

export const reviewSchema = z.object({
  rating: z.number().int().min(1, "Choose 1 to 5 stars").max(5, "Choose 1 to 5 stars"),
  comment: z
    .string()
    .trim()
    .max(500, "At most 500 characters")
    .optional()
    .transform((v) => v || null),
});
