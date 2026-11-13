"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api-client";
import { validateForm, type FieldErrors } from "@/lib/form-errors";
import { HOME_BY_ROLE } from "@/lib/roles";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { Role } from "@/models/user";
import { signInSchema, type SignInInput } from "@/validators/auth";

function messageFor(error: { message: string; code?: string }) {
  if (error.code === "email_not_confirmed" || /not confirmed/i.test(error.message)) {
    return "Please confirm your email first. Check your inbox for the confirmation link.";
  }
  return "Invalid email or password";
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<FieldErrors<SignInInput> & { form?: string }>({});
  const [loading, setLoading] = useState(false);

  const next = params.get("next");
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : null;
  const linkError = params.get("error") === "link_invalid";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = validateForm(signInSchema, values);
    if (parsed.errors) {
      setErrors(parsed.errors);
      return;
    }
    setErrors({});
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    if (error) {
      setErrors({ form: messageFor(error) });
      setLoading(false);
      return;
    }
    try {
      const { user } = await apiFetch<{ user: { role: Role } }>("/api/me");
      router.push(safeNext ?? HOME_BY_ROLE[user.role]);
      router.refresh();
    } catch {
      setErrors({ form: "Signed in, but we could not load your profile. Please try again." });
      setLoading(false);
    }
  }

  async function google() {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${safeNext ?? "/"}` },
    });
    if (error) setErrors({ form: "Google sign-in is not available right now." });
  }

  return (
    <AuthCard title="Welcome back">
      <Button type="button" variant="outline" className="w-full" onClick={google}>
        Continue with Google
      </Button>
      <p className="text-center text-sm text-muted-foreground">or</p>
      {linkError && (
        <FieldError>
          That link is invalid or has expired. Please log in or request a new one.
        </FieldError>
      )}
      <form onSubmit={onSubmit} noValidate>
        <FieldGroup>
          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={values.email}
              onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
              aria-invalid={!!errors.email}
            />
            {errors.email && <FieldError>{errors.email}</FieldError>}
          </Field>
          <Field data-invalid={!!errors.password}>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={values.password}
              onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
              aria-invalid={!!errors.password}
            />
            {errors.password && <FieldError>{errors.password}</FieldError>}
          </Field>
          <div className="text-right text-sm">
            <Link href="/forgot-password" className="text-primary">
              Forgot password?
            </Link>
          </div>
          {errors.form && <FieldError>{errors.form}</FieldError>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Logging in…" : "Log in"}
          </Button>
        </FieldGroup>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link href="/signup" className="font-medium text-primary">
          Create account
        </Link>
      </p>
    </AuthCard>
  );
}
