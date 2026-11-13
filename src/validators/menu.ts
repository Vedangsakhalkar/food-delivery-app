import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Enter a category name").max(60),
});

export const categoryUpdateSchema = z
  .object({
    name: z.string().trim().min(1, "Enter a category name").max(60).optional(),
    move: z.enum(["up", "down"]).optional(),
  })
  .refine((v) => v.name !== undefined || v.move !== undefined, "Nothing to update");

export const itemSchema = z.object({
  name: z.string().trim().min(1, "Enter an item name").max(100),
  description: z.string().trim().max(500, "At most 500 characters").default(""),
  categoryId: z.uuid("Choose a category"),
  price: z.coerce
    .number({ message: "Enter a price in rupees" })
    .positive("Price must be greater than 0")
    .max(100000, "Price is too high")
    .transform((rupees) => Math.round(rupees * 100)),
  isVeg: z.boolean().default(false),
  isAvailable: z.boolean().default(true),
  /** undefined = keep, null = remove, string = storage path from /api/owner/uploads */
  imagePath: z.string().max(300).nullable().optional(),
});
export type ItemInput = z.output<typeof itemSchema>;
