import "server-only";
import { createResendSender } from "@/lib/email/resend-sender";
import { restaurantRepository } from "@/repositories/restaurant-repository";
import { userRepository } from "@/repositories/user-repository";
import { createEmailService } from "@/services/email-service";
import { createNotificationService } from "@/services/notification-service";

/** The app's real notification service: Resend if RESEND_API_KEY is set, otherwise a logged no-op. */
export const notificationService = createNotificationService({
  users: userRepository,
  restaurants: restaurantRepository,
  email: createEmailService(
    createResendSender(
      process.env.RESEND_API_KEY,
      process.env.EMAIL_FROM ?? "onboarding@resend.dev",
    ),
  ),
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
});
