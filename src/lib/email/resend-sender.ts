import "server-only";
import { Resend } from "resend";
import type { EmailSender } from "@/services/email-service";

/** Builds the Resend-backed sender, or null when no API key is configured (dev/test). */
export function createResendSender(apiKey: string | undefined, from: string): EmailSender | null {
  if (!apiKey) return null;
  const resend = new Resend(apiKey);
  return {
    async send({ to, subject, html }) {
      const { error } = await resend.emails.send({ from, to, subject, html });
      if (error) throw new Error(error.message);
    },
  };
}
