-- Users table. id equals the Supabase auth user id.
create table if not exists users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  name text not null default '',
  phone text,
  role text not null default 'customer' check (role in ('customer', 'owner', 'admin')),
  created_at timestamptz not null default now()
);

-- RLS on with no policies: blocks Supabase's public Data API. The server uses a
-- privileged pg role which is not affected by RLS.
alter table users enable row level security;
