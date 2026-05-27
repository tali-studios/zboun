-- ─────────────────────────────────────────────────────────────────────────────
-- Online orders + order items
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.orders (
  id                uuid        primary key default gen_random_uuid(),
  restaurant_id     uuid        not null references public.restaurants(id) on delete cascade,
  customer_id       uuid        references public.customer_profiles(id) on delete set null,
  customer_name     text        not null,
  customer_phone    text,
  delivery_address  text,
  delivery_lat      double precision,
  delivery_lng      double precision,
  items             jsonb       not null default '[]',
  notes             text,
  total_usd         numeric(10,2) not null default 0,
  status            text        not null default 'pending'
                    check (status in ('pending','confirmed','preparing','ready','out_for_delivery','delivered','cancelled')),
  whatsapp_sent     boolean     not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_orders_restaurant_id   on public.orders (restaurant_id);
create index if not exists idx_orders_customer_id     on public.orders (customer_id);
create index if not exists idx_orders_status          on public.orders (status);
create index if not exists idx_orders_created_at      on public.orders (created_at desc);

alter table public.orders enable row level security;

-- Restaurant admins can read / update their own restaurant's orders
create policy "restaurant: manage own orders"
  on public.orders
  for all
  using (
    restaurant_id in (
      select restaurant_id from public.users where id = auth.uid()
    )
  )
  with check (
    restaurant_id in (
      select restaurant_id from public.users where id = auth.uid()
    )
  );

-- Customers can read their own orders
create policy "customers: read own orders"
  on public.orders
  for select
  using (customer_id = auth.uid());

-- Anyone (incl. guests) can insert orders
create policy "public: insert orders"
  on public.orders
  for insert
  with check (true);

-- Superadmin: full access
create policy "superadmin: all orders"
  on public.orders
  for all
  using (
    exists (select 1 from public.users where id = auth.uid() and role = 'superadmin')
  )
  with check (
    exists (select 1 from public.users where id = auth.uid() and role = 'superadmin')
  );

-- Auto-update updated_at
create or replace function public.orders_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.orders_set_updated_at();
