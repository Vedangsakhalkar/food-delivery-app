import { z } from "zod";

export const listRestaurantsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(12),
  cursor: z.string().max(200).optional(),
  /** Comma separated cuisines, e.g. "North Indian,Chinese" */
  cuisine: z
    .string()
    .max(200)
    .optional()
    .transform((v) =>
      v
        ? v
            .split(",")
            .map((c) => c.trim().toLowerCase())
            .filter(Boolean)
            .slice(0, 5)
        : [],
    ),
  sort: z.enum(["rating", "delivery"]).optional(),
});
export type ListRestaurantsQuery = z.output<typeof listRestaurantsSchema>;

export const searchSchema = z.object({
  q: z.string().trim().min(2, "Type at least 2 characters").max(60),
});
