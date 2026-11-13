import { z } from "zod";

export const addressSchema = z.object({
  label: z.string().trim().min(1, "Enter a label like Home or Work").max(30),
  line1: z.string().trim().min(1, "Enter the street address").max(200),
  city: z.string().trim().min(1, "Enter the city").max(60),
  pincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter a 6-digit pincode"),
  isDefault: z.boolean().default(false),
});
export type AddressInput = z.output<typeof addressSchema>;
