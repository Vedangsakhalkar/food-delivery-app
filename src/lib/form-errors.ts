import type { ZodType } from "zod";

export type FieldErrors<T> = Partial<Record<keyof T & string, string>>;

/** Validates form values with a Zod schema and returns the first message per field. */
export function validateForm<T>(
  schema: ZodType<T>,
  values: unknown,
): { data: T; errors?: undefined } | { data?: undefined; errors: FieldErrors<T> } {
  const result = schema.safeParse(values);
  if (result.success) return { data: result.data };
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!errors[key]) errors[key] = issue.message;
  }
  return { errors: errors as FieldErrors<T> };
}
