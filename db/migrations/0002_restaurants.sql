create table if not exists restaurants (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references users (id) on delete cascade,
  name text not null,
  cuisine text not null,
  address text not null,
  opens_at time not null,
  closes_at time not null,
  image_path text,
  image_url text,
  delivery_time_min integer not null default 30 check (delivery_time_min > 0),
  is_disabled boolean not null default false,
  disabled_reason text,
  avg_rating numeric(2, 1) not null default 0,
  rating_count integer not null default 0,
  created_at timestamptz not null default now(),
  check (opens_at <> closes_at)
);

create index if not exists restaurants_cuisine_idx on restaurants (cuisine);
create index if not exists restaurants_name_idx on restaurants (lower(name));

alter table restaurants enable row level security;
