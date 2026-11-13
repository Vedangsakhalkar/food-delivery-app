// Usage: npm run db:migrate  (loads .env.local via node --env-file)
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const url = process.env.DATABASE_URL_MIGRATIONS;
if (!url) {
  console.error("DATABASE_URL_MIGRATIONS is not set (see .env.example).");
  process.exit(1);
}

const dir = path.resolve("db/migrations");
const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await client.connect();
try {
  await client.query(
    "create table if not exists schema_migrations (name text primary key, applied_at timestamptz not null default now())",
  );
  const applied = new Set(
    (await client.query("select name from schema_migrations")).rows.map((r) => r.name),
  );
  const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();
  let count = 0;
  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = await readFile(path.join(dir, file), "utf8");
    await client.query("begin");
    try {
      await client.query(sql);
      await client.query("insert into schema_migrations (name) values ($1)", [file]);
      await client.query("commit");
      console.log("applied", file);
      count++;
    } catch (err) {
      await client.query("rollback");
      console.error("failed", file, err.message);
      process.exitCode = 1;
      break;
    }
  }
  if (!count && !process.exitCode) console.log("no pending migrations");
} finally {
  await client.end();
}
