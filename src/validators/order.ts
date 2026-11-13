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
