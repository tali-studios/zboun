-- ─────────────────────────────────────────────────────────────────────────────
-- Two-way stock sync: keep stock quantities aligned between a store's own
-- website (Shopify / WooCommerce / custom) and Zboun.
--
-- Direction "inbound"  = the store's website pushed a stock change into Zboun.
-- Direction "outbound" = Zboun pushed a stock change out to the store's website
--                        (e.g. after a WhatsApp order reduced the quantity).
--
-- Run this migration in your Supabase SQL editor or via the CLI.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Let a menu item be mapped to the SKU used on the store's own website.
alter table public.menu_items
  add column if not exists external_sku text;

-- One SKU maps to at most one item per restaurant.
create unique index if not exists idx_menu_items_restaurant_external_sku
  on public.menu_items (restaurant_id, external_sku)
  where external_sku is not null;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. restaurant_stock_sync: one row per restaurant — connection settings.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.restaurant_stock_sync (
  id                    uuid        primary key default gen_random_uuid(),
  restaurant_id         uuid        not null unique references public.restaurants(id) on delete cascade,
  platform              text        not null default 'custom' check (platform in ('shopify', 'woocommerce', 'custom')),
  is_enabled            boolean     not null default false,
  -- Inbound: the store's website authenticates with this key when it calls
  -- Zboun's stock sync API (POST /api/integrations/stock).
  inbound_api_key       text        not null unique,
  -- Outbound: Zboun signs its push requests with this secret so the store's
  -- website can verify the request really came from Zboun.
  outbound_webhook_url  text,
  outbound_secret       text        not null,
  last_inbound_at       timestamptz,
  last_outbound_at      timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists idx_restaurant_stock_sync_restaurant_id
  on public.restaurant_stock_sync (restaurant_id);
create index if not exists idx_restaurant_stock_sync_api_key
  on public.restaurant_stock_sync (inbound_api_key);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. stock_sync_events: audit log of every inbound/outbound sync attempt.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.stock_sync_events (
  id            uuid        primary key default gen_random_uuid(),
  restaurant_id uuid        not null references public.restaurants(id) on delete cascade,
  menu_item_id  uuid        references public.menu_items(id) on delete set null,
  direction     text        not null check (direction in ('inbound', 'outbound')),
  sku           text,
  quantity      int,
  status        text        not null check (status in ('success', 'error')),
  error_message text,
  created_at    timestamptz not null default now()
);

create index if not exists idx_stock_sync_events_restaurant_id
  on public.stock_sync_events (restaurant_id, created_at desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. updated_at trigger for restaurant_stock_sync
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.touch_restaurant_stock_sync_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_restaurant_stock_sync_touch on public.restaurant_stock_sync;
create trigger trg_restaurant_stock_sync_touch
  before update on public.restaurant_stock_sync
  for each row execute function public.touch_restaurant_stock_sync_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Row Level Security
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.restaurant_stock_sync enable row level security;
alter table public.stock_sync_events     enable row level security;

-- restaurant_stock_sync ---------------------------------------------------
drop policy if exists "super admin full restaurant_stock_sync access" on public.restaurant_stock_sync;
create policy "super admin full restaurant_stock_sync access"
on public.restaurant_stock_sync for all
to authenticated
using (
  exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin')
)
with check (
  exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin')
);

drop policy if exists "restaurant admin manage own stock_sync" on public.restaurant_stock_sync;
create policy "restaurant admin manage own stock_sync"
on public.restaurant_stock_sync for all
to authenticated
using (
  exists (
    select 1 from public.users u
    where u.id = auth.uid()
      and u.role = 'restaurant_admin'
      and u.restaurant_id = restaurant_stock_sync.restaurant_id
  )
)
with check (
  exists (
    select 1 from public.users u
    where u.id = auth.uid()
      and u.role = 'restaurant_admin'
      and u.restaurant_id = restaurant_stock_sync.restaurant_id
  )
);

-- stock_sync_events ---------------------------------------------------------
-- Rows are written by the server using the service-role key (bypasses RLS),
-- so we only need read policies here.
drop policy if exists "super admin full stock_sync_events access" on public.stock_sync_events;
create policy "super admin full stock_sync_events access"
on public.stock_sync_events for select
to authenticated
using (
  exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin')
);

drop policy if exists "restaurant admin read own stock_sync_events" on public.stock_sync_events;
create policy "restaurant admin read own stock_sync_events"
on public.stock_sync_events for select
to authenticated
using (
  exists (
    select 1 from public.users u
    where u.id = auth.uid()
      and u.role = 'restaurant_admin'
      and u.restaurant_id = stock_sync_events.restaurant_id
  )
);
