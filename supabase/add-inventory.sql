-- ─────────────────────────────────────────────────────────────────────────────
-- Inventory Management Add-on
-- Run this migration in your Supabase SQL editor or via the CLI.
-- ─────────────────────────────────────────────────────────────────────────────

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. restaurant_addons: paid ERP feature flags per restaurant
--    Every future module (CRM, POS, Loyalty, PMS, etc.) is an addon_key row.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.restaurant_addons (
  id            uuid        primary key default gen_random_uuid(),
  restaurant_id uuid        not null references public.restaurants(id) on delete cascade,
  addon_key     text        not null,
  is_enabled    boolean     not null default true,
  enabled_at    timestamptz not null default now(),
  enabled_by    uuid        references public.users(id) on delete set null,
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (restaurant_id, addon_key)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. suppliers: vendor management per restaurant
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.suppliers (
  id            uuid        primary key default gen_random_uuid(),
  restaurant_id uuid        not null references public.restaurants(id) on delete cascade,
  name          text        not null,
  contact_name  text,
  phone         text,
  email         text,
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. inventory_items: stock items with running quantity
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.inventory_items (
  id            uuid           primary key default gen_random_uuid(),
  restaurant_id uuid           not null references public.restaurants(id) on delete cascade,
  supplier_id   uuid           references public.suppliers(id) on delete set null,
  name          text           not null,
  sku           text,
  unit          text           not null default 'pieces',
  current_qty   numeric(12, 3) not null default 0,
  min_qty       numeric(12, 3) not null default 0 check (min_qty >= 0),
  cost_per_unit numeric(10, 2) not null default 0 check (cost_per_unit >= 0),
  notes         text,
  created_at    timestamptz    not null default now(),
  updated_at    timestamptz    not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. inventory_movements: immutable stock movement log
--    positive qty = stock in  (purchase, positive adjustment)
--    negative qty = stock out (consume, waste, negative adjustment)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.inventory_movements (
  id            uuid           primary key default gen_random_uuid(),
  restaurant_id uuid           not null references public.restaurants(id) on delete cascade,
  item_id       uuid           not null references public.inventory_items(id) on delete cascade,
  movement_type text           not null check (movement_type in ('purchase', 'consume', 'waste', 'adjustment')),
  qty           numeric(12, 3) not null,
  unit_cost     numeric(10, 2),
  reference     text,
  notes         text,
  created_by    uuid           references public.users(id) on delete set null,
  created_at    timestamptz    not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Trigger: auto-update inventory_items.current_qty after each movement
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.update_inventory_qty()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.inventory_items
  set current_qty = current_qty + NEW.qty,
      updated_at  = now()
  where id = NEW.item_id;
  return NEW;
end;
$$;

drop trigger if exists trg_inventory_movement_update_qty on public.inventory_movements;
create trigger trg_inventory_movement_update_qty
  after insert on public.inventory_movements
  for each row execute function public.update_inventory_qty();

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. Indexes
-- ─────────────────────────────────────────────────────────────────────────────
create index if not exists idx_restaurant_addons_restaurant_id
  on public.restaurant_addons(restaurant_id);
create index if not exists idx_suppliers_restaurant_id
  on public.suppliers(restaurant_id);
create index if not exists idx_inventory_items_restaurant_id
  on public.inventory_items(restaurant_id);
create index if not exists idx_inventory_movements_restaurant_id
  on public.inventory_movements(restaurant_id);
create index if not exists idx_inventory_movements_item_id
  on public.inventory_movements(item_id);
create index if not exists idx_inventory_movements_created_at
  on public.inventory_movements(created_at desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. Row Level Security
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.restaurant_addons  enable row level security;
alter table public.suppliers          enable row level security;
alter table public.inventory_items    enable row level security;
alter table public.inventory_movements enable row level security;

-- restaurant_addons -----------------------------------------------------------
create policy "super admin full restaurant_addons access"
on public.restaurant_addons for all
to authenticated
using (
  exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin')
)
with check (
  exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin')
);

create policy "restaurant admin read own addons"
on public.restaurant_addons for select
to authenticated
using (
  exists (
    select 1 from public.users u
    where u.id = auth.uid()
      and u.role = 'restaurant_admin'
      and u.restaurant_id = restaurant_addons.restaurant_id
  )
);

-- suppliers -------------------------------------------------------------------
create policy "super admin full suppliers access"
on public.suppliers for all
to authenticated
using (
  exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin')
)
with check (
  exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin')
);

create policy "restaurant admin manage own suppliers"
on public.suppliers for all
to authenticated
using (
  exists (
    select 1 from public.users u
    where u.id = auth.uid()
      and u.role = 'restaurant_admin'
      and u.restaurant_id = suppliers.restaurant_id
  )
)
with check (
  exists (
    select 1 from public.users u
    where u.id = auth.uid()
      and u.role = 'restaurant_admin'
      and u.restaurant_id = suppliers.restaurant_id
  )
);

-- inventory_items -------------------------------------------------------------
create policy "super admin full inventory_items access"
on public.inventory_items for all
to authenticated
using (
  exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin')
)
with check (
  exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin')
);

create policy "restaurant admin manage own inventory_items"
on public.inventory_items for all
to authenticated
using (
  exists (
    select 1 from public.users u
    where u.id = auth.uid()
      and u.role = 'restaurant_admin'
      and u.restaurant_id = inventory_items.restaurant_id
  )
)
with check (
  exists (
    select 1 from public.users u
    where u.id = auth.uid()
      and u.role = 'restaurant_admin'
      and u.restaurant_id = inventory_items.restaurant_id
  )
);

-- inventory_movements ---------------------------------------------------------
create policy "super admin full inventory_movements access"
on public.inventory_movements for all
to authenticated
using (
  exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin')
)
with check (
  exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin')
);

create policy "restaurant admin insert own inventory_movements"
on public.inventory_movements for insert
to authenticated
with check (
  exists (
    select 1 from public.users u
    where u.id = auth.uid()
      and u.role = 'restaurant_admin'
      and u.restaurant_id = inventory_movements.restaurant_id
  )
);

create policy "restaurant admin select own inventory_movements"
on public.inventory_movements for select
to authenticated
using (
  exists (
    select 1 from public.users u
    where u.id = auth.uid()
      and u.role = 'restaurant_admin'
      and u.restaurant_id = inventory_movements.restaurant_id
  )
);
