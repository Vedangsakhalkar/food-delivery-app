import "server-only";
import { Pool, type QueryResult, type QueryResultRow } from "pg";
import { getDatabaseUrl } from "@/lib/env";

const globalForPg = globalThis as unknown as { pgPool?: Pool };

/** One small shared pool (serverless friendly). Queries are unnamed, so no prepared statements
 * are kept, which is required by Supabase's transaction pooler. */
export function getPool(): Pool {
  globalForPg.pgPool ??= new Pool({
    connectionString: getDatabaseUrl(),
    max: 5,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
    ssl: { rejectUnauthorized: false },
  });
  return globalForPg.pgPool;
}

export function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<QueryResult<T>> {
  return getPool().query<T>(text, params);
}

/** Runs fn inside a transaction; commits on success, rolls back on error. */
export async function withTransaction<T>(
  fn: (client: import("pg").PoolClient) => Promise<T>,
): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
