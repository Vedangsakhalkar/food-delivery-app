"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { validateForm } from "@/lib/form-errors";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { forgotPasswordSchema } from "@/validators/auth";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = validateForm(forgotPasswordSchema, { email });
    if (parsed.errors) {
      setError(parsed.errors.email);
      return;
    }
    setError(undefined);
    setLoading(true);
    // The result is ignored on purpose: the message is identical whether or not the account exists.
    await createSupabaseBrowserClient()
      .auth.resetPasswordForEmail(parsed.data.email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      })
      .catch(() => undefined);
    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <AuthCard title="Check your inbox">
        <p className="text-muted-foreground">
          If an account exists for {email}, a reset link is on its way. Check your inbox.
        </p>
        <Link href="/login" className="text-sm font-medium text-primary">
          ← Back to log in
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Reset your password" subtitle="We will email you a link to choose a new one.">
      <p className="text-muted-foreground">Enter your email and we&apos;ll send a reset link.</p>
      <form onSubmit={onSubmit} noValidate>
        <FieldGroup>
          <Field data-invalid={!!error}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!error}
            />
            {error && <FieldError>{error}</FieldError>}
          </Field>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Sending…" : "Send reset link"}
          </Button>
        </FieldGroup>
      </form>
    </AuthCard>
  );
}
