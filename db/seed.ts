/**
 * Demo data: `npm run db:seed` (loads .env.local).
 * Idempotent: running it again updates the demo restaurants, categories and items in place (matched by
 * name) and adds anything missing, so it never creates duplicates. Every restaurant gets a cover
 * image and every dish an image (illustrated emoji art rendered locally with Chromium and uploaded to
 * Storage bucket `images`). Owners can replace any image with a real photo from the owner dashboard.
 * Creates one demo owner per restaurant (an owner has one restaurant) and one demo customer.
 * Refuses to run when NODE_ENV=production unless --force is passed.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import pg from "pg";
import { openRenderer } from "./seed-images";
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

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const itemColours = (hue: number, i: number): [string, string] => [
  `hsl(${(hue + i * 9) % 360},92%,80%)`,
  `hsl(${(hue + i * 9 + 14) % 360},88%,58%)`,
];
const coverColours = (hue: number): [string, string] => [
  `hsl(${hue},72%,52%)`,
  `hsl(${(hue + 18) % 360},78%,30%)`,
];

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
  const renderer = await openRenderer();

  const upload = async (path: string, png: Buffer) => {
    const up = await admin.storage
      .from(bucket)
      .upload(path, png, { contentType: "image/png", upsert: true });
    if (up.error) throw new Error(`Image upload failed (${path}): ${up.error.message}`);
    return admin.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  };

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

    // 1. images first (outside the DB transaction)
    const coverPath = `restaurants/${ownerId}/cover.png`;
    const coverUrl = await upload(
      coverPath,
      await renderer.cover(r.name, r.coverEmojis, coverColours(r.hue)),
    );
    const dishImages = new Map<string, { path: string; url: string }>();
    let catIndex = 0;
    for (const cat of r.categories) {
      for (const it of cat.items) {
        const path = `items/${ownerId}/${slugify(it.name)}.png`;
        const png = await renderer.item(it.emoji, itemColours(r.hue, catIndex));
        dishImages.set(it.name, { path, url: await upload(path, png) });
      }
      catIndex++;
    }

    // 2. database rows
    const client = await pool.connect();
    let created = false;
    let items = 0;
    try {
      await client.query("begin");
      const found = await client.query<{ id: string }>(
        "select id from restaurants where owner_id = $1",
        [ownerId],
      );
      let restaurantId: string;
      if (found.rows[0]) {
        restaurantId = found.rows[0].id;
        await client.query(
          `update restaurants set name = $2, cuisine = $3, address = $4, opens_at = $5, closes_at = $6,
             delivery_time_min = $7, image_path = $8, image_url = $9, is_disabled = false, disabled_reason = null
           where id = $1`,
          [
            restaurantId,
            r.name,
            r.cuisine,
            r.address,
            r.opensAt,
            r.closesAt,
            r.deliveryTimeMin,
            coverPath,
            coverUrl,
          ],
        );
      } else {
        const ins = await client.query<{ id: string }>(
          `insert into restaurants (owner_id, name, cuisine, address, opens_at, closes_at, delivery_time_min, image_path, image_url)
           values ($1, $2, $3, $4, $5, $6, $7, $8, $9) returning id`,
          [
            ownerId,
            r.name,
            r.cuisine,
            r.address,
            r.opensAt,
            r.closesAt,
            r.deliveryTimeMin,
            coverPath,
            coverUrl,
          ],
        );
        restaurantId = ins.rows[0].id;
        created = true;
      }

      let order = 0;
      for (const cat of r.categories) {
        const existingCat = await client.query<{ id: string }>(
          "select id from menu_categories where restaurant_id = $1 and lower(name) = lower($2)",
          [restaurantId, cat.name],
        );
        let categoryId: string;
        if (existingCat.rows[0]) {
          categoryId = existingCat.rows[0].id;
          await client.query("update menu_categories set sort_order = $2 where id = $1", [
            categoryId,
            order,
          ]);
        } else {
          const c = await client.query<{ id: string }>(
            "insert into menu_categories (restaurant_id, name, sort_order) values ($1, $2, $3) returning id",
            [restaurantId, cat.name, order],
          );
          categoryId = c.rows[0].id;
        }
        order++;

        for (const it of cat.items) {
          const img = dishImages.get(it.name)!;
          const paise = Math.round(it.price * 100);
          const existing = await client.query<{ id: string }>(
            "select id from menu_items where restaurant_id = $1 and lower(name) = lower($2)",
            [restaurantId, it.name],
          );
          if (existing.rows[0]) {
            await client.query(
              `update menu_items set category_id = $2, description = $3, price_paise = $4, is_veg = $5,
                 is_available = $6, image_path = $7, image_url = $8 where id = $1`,
              [
                existing.rows[0].id,
                categoryId,
                it.description,
                paise,
                it.veg,
                it.available,
                img.path,
                img.url,
              ],
            );
          } else {
            await client.query(
              `insert into menu_items (category_id, restaurant_id, name, description, price_paise, is_veg, is_available, image_path, image_url)
               values ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
              [
                categoryId,
                restaurantId,
                it.name,
                it.description,
                paise,
                it.veg,
                it.available,
                img.path,
                img.url,
              ],
            );
          }
          items++;
        }
      }
      await client.query("commit");
    } catch (err) {
      await client.query("rollback");
      throw err;
    } finally {
      client.release();
    }
    // the first version of the seed used a flat-colour cover at this path
    await admin.storage.from(bucket).remove([`restaurants/${ownerId}/seed.png`]);
    return { name: r.name, created, items };
  }

  try {
    const customerEmail = "demo-customer@dabba.test";
    const customerId = await ensureAuthUser(admin, customerEmail, "Demo Customer", "customer");
    await upsertUser(customerId, customerEmail, "Demo Customer", "customer");

    for (const r of RESTAURANTS) {
      const res = await seedRestaurant(r);
      console.log(res.created ? "created" : "updated", res.name, `(${res.items} dishes)`);
    }
    console.log(`\nDemo logins (password for all: ${DEMO_PASSWORD})`);
    console.log("  customer:", customerEmail);
    console.log(
      "  owner:    seed-owner-<restaurant-slug>@dabba.test, e.g. seed-owner-spice-route@dabba.test",
    );
  } finally {
    await renderer.close();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
