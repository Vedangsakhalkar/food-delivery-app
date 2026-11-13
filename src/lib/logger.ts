type Level = "debug" | "info" | "warn" | "error";

function write(level: Level, message: string, fields: Record<string, unknown> = {}) {
  const line = JSON.stringify({ level, time: new Date().toISOString(), message, ...fields });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

/** Minimal structured (JSON) logger. Never log secrets or full request bodies. */
export const logger = {
  debug: (m: string, f?: Record<string, unknown>) => write("debug", m, f),
  info: (m: string, f?: Record<string, unknown>) => write("info", m, f),
  warn: (m: string, f?: Record<string, unknown>) => write("warn", m, f),
  error: (m: string, f?: Record<string, unknown>) => write("error", m, f),
};

export function serializeError(err: unknown): Record<string, unknown> {
  if (err instanceof Error) return { name: err.name, message: err.message, stack: err.stack };
  return { value: String(err) };
}
