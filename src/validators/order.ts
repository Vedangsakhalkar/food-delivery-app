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
