"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { validateForm } from "@/lib/form-errors";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { resetPasswordSchema } from "@/validators/auth";

export function ResetPasswordForm() {
  const router = useRouter();
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    createSupabaseBrowserClient()
      .auth.getUser()
      .then(({ data }) => setHasSession(!!data.user))
      .catch(() => setHasSession(false));
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = validateForm(resetPasswordSchema, { password });
    if (parsed.errors) {
      setError(parsed.errors.password);
      return;
    }
    setError(undefined);
    setLoading(true);
    const { error: updateError } = await createSupabaseBrowserClient().auth.updateUser({
      password: parsed.data.password,
    });
    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    toast.success("Password updated");
    router.push("/");
    router.refresh();
  }

  if (hasSession === false) {
    return (
      <AuthCard title="Link expired">
        <p className="text-muted-foreground">
          This reset link is invalid or has already been used. Request a new one.
        </p>
        <Link href="/forgot-password" className="text-sm font-medium text-primary">
          Request a new link
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Choose a new password">
      <form onSubmit={onSubmit} noValidate>
        <FieldGroup>
          <Field data-invalid={!!error}>
            <FieldLabel htmlFor="password">New password</FieldLabel>
            <Input
              id="password"
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!error}
            />
            {error && <FieldError>{error}</FieldError>}
          </Field>
          <Button type="submit" disabled={loading || hasSession === null} className="w-full">
            {loading ? "Saving…" : "Update password"}
          </Button>
        </FieldGroup>
      </form>
    </AuthCard>
  );
}
