create sequence if not exists order_code_seq start 10001;

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default ('DAB-' || nextval('order_code_seq')),
  customer_id uuid not null references users (id),
  restaurant_id uuid not null references restaurants (id),
  address_snapshot jsonb not null,
  status text not null default 'placed'
    check (status in ('placed', 'accepted', 'preparing', 'out_for_delivery', 'delivered', 'rejected', 'cancelled')),
  rejection_reason text,
  subtotal_paise integer not null check (subtotal_paise >= 0),
  tax_paise integer not null check (tax_paise >= 0),
  delivery_fee_paise integer not null check (delivery_fee_paise >= 0),
  total_paise integer not null check (total_paise >= 0),
  payment_method text not null default 'cod' check (payment_method = 'cod'),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  menu_item_id uuid,
  name_snapshot text not null,
  price_paise integer not null check (price_paise >= 0),
  quantity integer not null check (quantity between 1 and 20)
);

create index if not exists orders_customer_idx on orders (customer_id, created_at desc);
create index if not exists orders_restaurant_status_idx on orders (restaurant_id, status);
create index if not exists order_items_order_idx on order_items (order_id);

alter table orders enable row level security;
alter table order_items enable row level security;
