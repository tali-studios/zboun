-- ─────────────────────────────────────────────────────────────────────────────
-- E-commerce Integration Module
-- ─────────────────────────────────────────────────────────────────────────────

-- Store configuration (one per restaurant)
create table if not exists public.ecommerce_stores (
  id                  uuid           primary key default gen_random_uuid(),
  restaurant_id       uuid           not null unique references public.restaurants(id) on delete cascade,
  store_name          text           not null,
  tagline             text,
  is_open             boolean        not null default true,
  -- Fulfilment options
  delivery_enabled    boolean        not null default true,
  pickup_enabled      boolean        not null default true,
  -- Delivery settings
  min_order_amount    numeric(10,2)  not null default 0,
  base_delivery_fee   numeric(10,2)  not null default 0,
  estimated_delivery_mins int        not null default 45,
  estimated_pickup_mins   int        not null default 20,
  -- Payment methods accepted
  accepts_cash        boolean        not null default true,
  accepts_card        boolean        not null default false,
  accepts_online      boolean        not null default false,
  -- VAT / Tax
  tax_rate            numeric(5,4)   not null default 0,
  -- Operating hours (simple free text for MVP)
  operating_hours     text,
  -- Closed message shown on the storefront
  closed_message      text,
  created_at          timestamptz    not null default now(),
  updated_at          timestamptz    not null default now()
);

-- Delivery zones
create table if not exists public.ecommerce_delivery_zones (
  id              uuid           primary key default gen_random_uuid(),
  restaurant_id   uuid           not null references public.restaurants(id) on delete cascade,
  zone_name       text           not null,
  delivery_fee    numeric(10,2)  not null default 0,
  min_order       numeric(10,2)  not null default 0,
  est_mins        int            not null default 45,
  is_active       boolean        not null default true,
  created_at      timestamptz    not null default now()
);

-- Online orders
create table if not exists public.ecommerce_orders (
  id                uuid           primary key default gen_random_uuid(),
  restaurant_id     uuid           not null references public.restaurants(id) on delete cascade,
  order_number      text,
  -- Customer info (anonymous for now — no auth required for customers)
  customer_name     text           not null,
  customer_phone    text           not null,
  customer_email    text,
  delivery_address  text,
  delivery_zone_id  uuid           references public.ecommerce_delivery_zones(id) on delete set null,
  -- Fulfilment
  fulfilment_type   text           not null default 'delivery'
                    check (fulfilment_type in ('delivery','pickup')),
  -- Status flow: pending → confirmed → preparing → ready → out_for_delivery → delivered | cancelled
  status            text           not null default 'pending'
                    check (status in ('pending','confirmed','preparing','ready','out_for_delivery','delivered','cancelled')),
  payment_method    text           not null default 'cash'
                    check (payment_method in ('cash','card','online')),
  payment_status    text           not null default 'unpaid'
                    check (payment_status in ('unpaid','paid','refunded')),
  -- Financials
  subtotal          numeric(10,2)  not null default 0,
  delivery_fee      numeric(10,2)  not null default 0,
  tax_amount        numeric(10,2)  not null default 0,
  total_amount      numeric(10,2)  not null default 0,
  -- Special instructions
  notes             text,
  -- CRM / fleet links
  crm_customer_id   uuid           references public.crm_customers(id) on delete set null,
  -- Timestamps
  confirmed_at      timestamptz,
  delivered_at      timestamptz,
  created_at        timestamptz    not null default now(),
  updated_at        timestamptz    not null default now()
);

-- Order line items
create table if not exists public.ecommerce_order_items (
  id              uuid           primary key default gen_random_uuid(),
  order_id        uuid           not null references public.ecommerce_orders(id) on delete cascade,
  restaurant_id   uuid           not null references public.restaurants(id) on delete cascade,
  menu_item_id    uuid           references public.menu_items(id) on delete set null,
  item_name       text           not null,
  quantity        int            not null check (quantity > 0),
  unit_price      numeric(10,2)  not null,
  line_total      numeric(10,2)  not null,
  special_request text,
  created_at      timestamptz    not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Indexes
-- ─────────────────────────────────────────────────────────────────────────────
create index if not exists idx_ecommerce_orders_restaurant
  on public.ecommerce_orders (restaurant_id, created_at desc);
create index if not exists idx_ecommerce_orders_status
  on public.ecommerce_orders (restaurant_id, status);
create index if not exists idx_ecommerce_order_items_order
  on public.ecommerce_order_items (order_id);
create index if not exists idx_ecommerce_zones_restaurant
  on public.ecommerce_delivery_zones (restaurant_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.ecommerce_stores         enable row level security;
alter table public.ecommerce_delivery_zones enable row level security;
alter table public.ecommerce_orders         enable row level security;
alter table public.ecommerce_order_items    enable row level security;

create policy "superadmin full ecommerce_stores"
on public.ecommerce_stores for all to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'));
create policy "restaurant admin own ecommerce_stores"
on public.ecommerce_stores for all to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = ecommerce_stores.restaurant_id))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = ecommerce_stores.restaurant_id));

create policy "superadmin full ecommerce_delivery_zones"
on public.ecommerce_delivery_zones for all to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'));
create policy "restaurant admin own ecommerce_delivery_zones"
on public.ecommerce_delivery_zones for all to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = ecommerce_delivery_zones.restaurant_id))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = ecommerce_delivery_zones.restaurant_id));

create policy "superadmin full ecommerce_orders"
on public.ecommerce_orders for all to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'));
create policy "restaurant admin own ecommerce_orders"
on public.ecommerce_orders for all to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = ecommerce_orders.restaurant_id))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = ecommerce_orders.restaurant_id));

create policy "superadmin full ecommerce_order_items"
on public.ecommerce_order_items for all to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'));
create policy "restaurant admin own ecommerce_order_items"
on public.ecommerce_order_items for all to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = ecommerce_order_items.restaurant_id))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = ecommerce_order_items.restaurant_id));
