/** Standard error body returned by every /api route. */
export interface ApiErrorBody {
  error: { code: string; message: string; details?: unknown };
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function isErrorBody(value: unknown): value is ApiErrorBody {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof (value as ApiErrorBody).error?.message === "string"
  );
}

/**
 * Typed fetch wrapper for our own /api routes (used by UI components).
 * Sends and expects JSON; throws ApiError built from the standard error body.
 */
export async function apiFetch<T>(
  path: string,
  options: Omit<RequestInit, "body"> & { body?: unknown } = {},
): Promise<T> {
  const { body, headers, ...rest } = options;
  const res = await fetch(path, {
    ...rest,
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    if (isErrorBody(data)) {
      throw new ApiError(res.status, data.error.code, data.error.message, data.error.details);
    }
    throw new ApiError(res.status, "unknown_error", res.statusText || "Request failed");
  }
  return data as T;
}
