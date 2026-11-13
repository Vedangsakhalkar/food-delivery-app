create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references orders (id) on delete cascade,
  restaurant_id uuid not null references restaurants (id) on delete cascade,
  customer_id uuid not null references users (id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text check (char_length(comment) <= 500),
  created_at timestamptz not null default now()
);

create index if not exists reviews_restaurant_idx on reviews (restaurant_id, created_at desc);

alter table reviews enable row level security;
