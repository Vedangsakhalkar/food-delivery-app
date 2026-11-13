import { logger } from "@/lib/logger";
import type { EmailMessage } from "@/services/email-templates";

/** Adapter over the transactional email provider (Resend). */
export interface EmailSender {
  send(message: EmailMessage): Promise<void>;
}

const TIMEOUT_MS = 4000;

/**
 * Sends an email without ever throwing or hanging the caller: failures and slow sends are
 * logged and swallowed, so an email problem can never fail or noticeably delay an order.
 */
export function createEmailService(sender: EmailSender | null, timeoutMs = TIMEOUT_MS) {
  let warned = false;
  return {
    async send(message: EmailMessage): Promise<boolean> {
      if (!sender) {
        if (!warned) {
          warned = true;
          logger.warn("email not sent: RESEND_API_KEY is not configured");
        }
        return false;
      }
      let timer: ReturnType<typeof setTimeout> | undefined;
      try {
        await Promise.race([
          sender.send(message),
          new Promise((_, reject) => {
            timer = setTimeout(() => reject(new Error("email send timed out")), timeoutMs);
          }),
        ]);
        return true;
      } catch (err) {
        logger.error("email send failed", {
          subject: message.subject,
          message: err instanceof Error ? err.message : String(err),
        });
        return false;
      } finally {
        clearTimeout(timer);
      }
    },
  };
}
