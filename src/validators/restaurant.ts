import { z } from "zod";

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use 24-hour time like 11:00");

export const restaurantSchema = z
  .object({
    name: z.string().trim().min(1, "Enter a name").max(100),
    cuisine: z.string().trim().min(1, "Enter a cuisine").max(100),
    address: z.string().trim().min(1, "Enter an address").max(300),
    opensAt: time,
    closesAt: time,
    deliveryTimeMin: z.coerce
      .number({ message: "Enter delivery time in minutes" })
      .int("Use a whole number")
      .min(5, "At least 5 minutes")
      .max(180, "At most 180 minutes"),
  })
  .refine((v) => v.opensAt !== v.closesAt, {
    path: ["closesAt"],
    message: "Closing time must differ from opening time",
  });
export type RestaurantInput = z.infer<typeof restaurantSchema>;
