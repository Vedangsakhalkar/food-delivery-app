export type ErrorCode =
  | "bad_request"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "validation_error"
  | "rate_limited"
  | "internal_error";

/** Base class for expected (domain) errors. Services throw these; controllers map them to HTTP. */
export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: ErrorCode,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request", details?: unknown) {
    super(400, "bad_request", message, details);
  }
}
export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super(401, "unauthorized", message);
  }
}
export class ForbiddenError extends AppError {
  constructor(message = "You do not have access to this resource") {
    super(403, "forbidden", message);
  }
}
export class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super(404, "not_found", message);
  }
}
export class ConflictError extends AppError {
  constructor(message = "Conflict", details?: unknown) {
    super(409, "conflict", message, details);
  }
}
export class ValidationError extends AppError {
  constructor(message = "Validation failed", details?: unknown) {
    super(422, "validation_error", message, details);
  }
}
export class RateLimitError extends AppError {
  constructor(
    message = "Too many requests",
    public readonly retryAfterSeconds = 60,
  ) {
    super(429, "rate_limited", message);
  }
}
