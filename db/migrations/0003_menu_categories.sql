create table if not exists menu_categories (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants (id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create unique index if not exists menu_categories_name_uq on menu_categories (restaurant_id, lower(name));
create index if not exists menu_categories_restaurant_idx on menu_categories (restaurant_id, sort_order);

alter table menu_categories enable row level security;
