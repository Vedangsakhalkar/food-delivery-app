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
