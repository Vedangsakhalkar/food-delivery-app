/**
 * Demo data: `npm run db:seed` (loads .env.local). Idempotent: running it twice creates nothing new.
 * Creates demo owners (one per restaurant, because an owner has one restaurant), one demo customer,
 * restaurants with categories, items and a generated cover image in Storage bucket `images`.
 * Refuses to run when NODE_ENV=production unless --force is passed.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { deflateSync } from "node:zlib";
import pg from "pg";
import { DEMO_PASSWORD, RESTAURANTS, type SeedRestaurant } from "./seed-data";

if (process.env.NODE_ENV === "production" && !process.argv.includes("--force")) {
  console.error("Refusing to seed with NODE_ENV=production (pass --force if you really mean it).");
  process.exit(1);
}

const need = (name: string) => {
  const v = process.env[name];
  if (!v) {
    console.error(`${name} is not set (see .env.example).`);
    process.exit(1);
  }
  return v;
};

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf: Buffer) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type: string, data: Buffer) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
};

/** A 600x400 vertical-gradient PNG in the restaurant's colour. */
function coverPng([r, g, b]: [number, number, number]): Buffer {
  const w = 600;
  const h = 400;
  const raw = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) {
    const t = y / (h - 1);
    const mix = (c: number) => Math.round(c + (255 - c) * t * 0.55);
    const row = y * (w * 3 + 1);
    raw[row] = 0;
    for (let x = 0; x < w; x++) {
      raw[row + 1 + x * 3] = mix(r);
      raw[row + 2 + x * 3] = mix(g);
      raw[row + 3 + x * 3] = mix(b);
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

async function ensureAuthUser(
  admin: SupabaseClient,
  email: string,
  name: string,
  role: "owner" | "customer",
): Promise<string> {
  const created = await admin.auth.admin.createUser({
    email,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { name, phone: "9876543210", role },
  });
  if (created.data.user) return created.data.user.id;
  // Already exists: find it (the demo project is small, so scanning pages is fine).
  for (let page = 1; page < 50; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const found = data.users.find((u) => u.email === email);
    if (found) return found.id;
    if (data.users.length < 200) break;
  }
  throw new Error(`Could not create or find ${email}: ${created.error?.message}`);
}

async function main() {
  const url = need("NEXT_PUBLIC_SUPABASE_URL");
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "images";
  const admin = createClient(url, need("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false },
  });
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL_MIGRATIONS || need("DATABASE_URL"),
    ssl: { rejectUnauthorized: false },
    max: 2,
  });

  const upsertUser = (id: string, email: string, name: string, role: string) =>
    pool.query(
      `insert into users (id, email, name, phone, role) values ($1, $2, $3, '9876543210', $4)
       on conflict (id) do nothing`,
      [id, email, name, role],
    );

  async function seedRestaurant(r: SeedRestaurant) {
    const email = `seed-owner-${r.slug}@dabba.test`;
    const ownerId = await ensureAuthUser(admin, email, `${r.name} Owner`, "owner");
    await upsertUser(ownerId, email, `${r.name} Owner`, "owner");

    const existing = await pool.query("select id from restaurants where owner_id = $1", [ownerId]);
    if (existing.rows[0]) return { name: r.name, created: false };

    const path = `restaurants/${ownerId}/seed.png`;
    const up = await admin.storage
      .from(bucket)
      .upload(path, coverPng(r.colour), { contentType: "image/png", upsert: true });
    if (up.error) throw new Error(`Image upload failed for ${r.name}: ${up.error.message}`);
    const imageUrl = admin.storage.from(bucket).getPublicUrl(path).data.publicUrl;

    const client = await pool.connect();
    try {
      await client.query("begin");
      const ins = await client.query<{ id: string }>(
        `insert into restaurants (owner_id, name, cuisine, address, opens_at, closes_at,
           delivery_time_min, image_path, image_url)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9) returning id`,
        [
          ownerId,
          r.name,
          r.cuisine,
          r.address,
          r.opensAt,
          r.closesAt,
          r.deliveryTimeMin,
          path,
          imageUrl,
        ],
      );
      const restaurantId = ins.rows[0].id;
      let order = 0;
      for (const cat of r.categories) {
        const c = await client.query<{ id: string }>(
          `insert into menu_categories (restaurant_id, name, sort_order) values ($1, $2, $3) returning id`,
          [restaurantId, cat.name, order++],
        );
        for (const item of cat.items) {
          await client.query(
            `insert into menu_items (category_id, restaurant_id, name, description, price_paise, is_veg, is_available)
             values ($1, $2, $3, $4, $5, $6, $7)`,
            [
              c.rows[0].id,
              restaurantId,
              item.name,
              item.description,
              Math.round(item.price * 100),
              item.veg,
              item.available ?? true,
            ],
          );
        }
      }
      await client.query("commit");
    } catch (err) {
      await client.query("rollback");
      throw err;
    } finally {
      client.release();
    }
    return { name: r.name, created: true };
  }

  try {
    const customerEmail = "demo-customer@dabba.test";
    const customerId = await ensureAuthUser(admin, customerEmail, "Demo Customer", "customer");
    await upsertUser(customerId, customerEmail, "Demo Customer", "customer");

    for (const r of RESTAURANTS) {
      const result = await seedRestaurant(r);
      console.log(result.created ? "created" : "exists ", result.name);
    }
    console.log("\nDemo logins (password for all: " + DEMO_PASSWORD + ")");
    console.log("  customer:", customerEmail);
    console.log("  owner:   seed-owner-spice-route@dabba.test (one owner per restaurant)");
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
