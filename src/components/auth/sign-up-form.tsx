"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ApiError, apiFetch } from "@/lib/api-client";
import { validateForm, type FieldErrors } from "@/lib/form-errors";
import { signUpSchema, type SignUpInput } from "@/validators/auth";

type Values = { name: string; phone: string; email: string; password: string; role: string };

const FIELDS = [
  { key: "name", label: "Full name", type: "text", placeholder: "Asha Rao" },
  { key: "phone", label: "Phone", type: "tel", placeholder: "+91 98765 43210" },
  { key: "email", label: "Email", type: "email", placeholder: "you@example.com" },
  { key: "password", label: "Password", type: "password", placeholder: "At least 8 characters" },
] as const;

export function SignUpForm() {
  const [values, setValues] = useState<Values>({
    name: "",
    phone: "",
    email: "",
    password: "",
    role: "customer",
  });
  const [errors, setErrors] = useState<FieldErrors<SignUpInput> & { form?: string }>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = validateForm(signUpSchema, values);
    if (parsed.errors) {
      setErrors(parsed.errors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await apiFetch("/api/auth/signup", { method: "POST", body: parsed.data });
      setDone(true);
    } catch (err) {
      setErrors({
        form: err instanceof ApiError ? err.message : "Something went wrong. Try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <AuthCard title="Check your email">
        <p className="text-muted-foreground">
          We sent a confirmation link to <b>{values.email}</b>. Confirm your email, then log in.
        </p>
        <Link href="/login" className="text-sm font-medium text-primary">
          Go to log in
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Order food in minutes, or start selling as a restaurant."
    >
      <form onSubmit={onSubmit} noValidate>
        <FieldGroup>
          <RadioGroup
            value={values.role}
            onValueChange={(role) => setValues((v) => ({ ...v, role: String(role) }))}
            className="grid gap-2"
          >
            <Label className="flex items-center gap-2 font-normal">
              <RadioGroupItem value="customer" /> I want to order food
            </Label>
            <Label className="flex items-center gap-2 font-normal">
              <RadioGroupItem value="owner" /> I own a restaurant
            </Label>
          </RadioGroup>
          {errors.role && <FieldError>{errors.role}</FieldError>}

          {FIELDS.map((f) => (
            <Field key={f.key} data-invalid={!!errors[f.key]}>
              <FieldLabel htmlFor={f.key}>{f.label}</FieldLabel>
              <Input
                id={f.key}
                type={f.type}
                placeholder={f.placeholder}
                value={values[f.key]}
                onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                aria-invalid={!!errors[f.key]}
              />
              {errors[f.key] && <FieldError>{errors[f.key]}</FieldError>}
            </Field>
          ))}

          {errors.form && <FieldError>{errors.form}</FieldError>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating account…" : "Sign up"}
          </Button>
        </FieldGroup>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        Have an account?{" "}
        <Link href="/login" className="font-medium text-primary">
          Log in
        </Link>
      </p>
    </AuthCard>
  );
}
