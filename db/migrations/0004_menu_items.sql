create table if not exists menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references menu_categories (id) on delete cascade,
  restaurant_id uuid not null references restaurants (id) on delete cascade,
  name text not null,
  description text not null default '',
  price_paise integer not null check (price_paise > 0),
  is_veg boolean not null default false,
  is_available boolean not null default true,
  image_path text,
  image_url text,
  created_at timestamptz not null default now()
);

create index if not exists menu_items_restaurant_idx on menu_items (restaurant_id);
create index if not exists menu_items_category_idx on menu_items (category_id);

alter table menu_items enable row level security;
