create table if not exists addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  label text not null,
  line1 text not null,
  city text not null,
  pincode text not null check (pincode ~ '^[0-9]{6}$'),
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists addresses_user_idx on addresses (user_id);
-- at most one default address per user
create unique index if not exists addresses_one_default_uq on addresses (user_id) where is_default;

alter table addresses enable row level security;
