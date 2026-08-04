-- ─────────────────────────────────────────────────────────────────────────────
-- Nationwide delivery & distance-based delivery fees
--
-- 1. Allow restaurants to mark themselves as "delivers nationwide"
--    (skip location-based filtering, appear to all customers)
--
-- 2. Support tiered delivery pricing based on distance ranges
--
-- Run this migration in your Supabase SQL editor or via the CLI.
-- ─────────────────────────────────────────────────────────────────────────────

-- ─────────────────────────────────────────────────────────────────────────────
-- 0. Enable required extensions
-- ─────────────────────────────────────────────────────────────────────────────
create extension if not exists btree_gist;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Nationwide delivery flag
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.restaurants
  add column if not exists delivers_nationwide boolean not null default false;

create index if not exists idx_restaurants_delivers_nationwide
  on public.restaurants (delivers_nationwide)
  where delivers_nationwide = true;

comment on column public.restaurants.delivers_nationwide is
  'When true, this restaurant delivers everywhere in Lebanon and will appear in all location-based searches regardless of customer location.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Distance-based delivery fee tiers
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.restaurant_delivery_tiers (
  id                uuid        primary key default gen_random_uuid(),
  restaurant_id     uuid        not null references public.restaurants(id) on delete cascade,
  min_distance_km   numeric(6,2) not null check (min_distance_km >= 0),
  max_distance_km   numeric(6,2) not null check (max_distance_km > min_distance_km),
  fee_usd           numeric(10,2) not null check (fee_usd >= 0),
  position          int         not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  
  -- Ensure no overlapping ranges for the same restaurant
  constraint delivery_tiers_no_overlap
    exclude using gist (
      restaurant_id with =,
      numrange(min_distance_km::numeric, max_distance_km::numeric, '[)') with &&
    )
);

create index if not exists idx_delivery_tiers_restaurant_id
  on public.restaurant_delivery_tiers (restaurant_id);

create index if not exists idx_delivery_tiers_position
  on public.restaurant_delivery_tiers (restaurant_id, position);

comment on table public.restaurant_delivery_tiers is
  'Distance-based delivery fee tiers for restaurants. Example: 0-5km = $2, 5-10km = $3, 10-15km = $5. If no tiers exist, fall back to flat delivery_fee_usd.';

comment on column public.restaurant_delivery_tiers.position is
  'Display order for admin UI (smaller = shown first).';

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Updated_at trigger for delivery tiers
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.touch_delivery_tiers_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_delivery_tiers_touch on public.restaurant_delivery_tiers;
create trigger trg_delivery_tiers_touch
  before update on public.restaurant_delivery_tiers
  for each row execute function public.touch_delivery_tiers_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Row Level Security for delivery tiers
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.restaurant_delivery_tiers enable row level security;

-- Public read access (customers need to see delivery fees)
drop policy if exists "public read delivery_tiers" on public.restaurant_delivery_tiers;
create policy "public read delivery_tiers"
  on public.restaurant_delivery_tiers for select
  to anon, authenticated
  using (true);

-- Super admin full access
drop policy if exists "super admin full delivery_tiers access" on public.restaurant_delivery_tiers;
create policy "super admin full delivery_tiers access"
  on public.restaurant_delivery_tiers for all
  to authenticated
  using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin')
  )
  with check (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin')
  );

-- Restaurant admin can manage their own tiers
drop policy if exists "restaurant admin manage own delivery_tiers" on public.restaurant_delivery_tiers;
create policy "restaurant admin manage own delivery_tiers"
  on public.restaurant_delivery_tiers for all
  to authenticated
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid()
        and u.role = 'restaurant_admin'
        and u.restaurant_id = restaurant_delivery_tiers.restaurant_id
    )
  )
  with check (
    exists (
      select 1 from public.users u
      where u.id = auth.uid()
        and u.role = 'restaurant_admin'
        and u.restaurant_id = restaurant_delivery_tiers.restaurant_id
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Fast delivery tiers (separate from regular delivery)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.restaurant_fast_delivery_tiers (
  id                uuid        primary key default gen_random_uuid(),
  restaurant_id     uuid        not null references public.restaurants(id) on delete cascade,
  min_distance_km   numeric(6,2) not null check (min_distance_km >= 0),
  max_distance_km   numeric(6,2) not null check (max_distance_km > min_distance_km),
  fee_usd           numeric(10,2) not null check (fee_usd >= 0),
  position          int         not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  
  -- Ensure no overlapping ranges for the same restaurant
  constraint fast_delivery_tiers_no_overlap
    exclude using gist (
      restaurant_id with =,
      numrange(min_distance_km::numeric, max_distance_km::numeric, '[)') with &&
    )
);

create index if not exists idx_fast_delivery_tiers_restaurant_id
  on public.restaurant_fast_delivery_tiers (restaurant_id);

create index if not exists idx_fast_delivery_tiers_position
  on public.restaurant_fast_delivery_tiers (restaurant_id, position);

comment on table public.restaurant_fast_delivery_tiers is
  'Distance-based fast delivery fee tiers for restaurants. Independent from regular delivery tiers to give full control over fast delivery pricing.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. Updated_at trigger for fast delivery tiers
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.touch_fast_delivery_tiers_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_fast_delivery_tiers_touch on public.restaurant_fast_delivery_tiers;
create trigger trg_fast_delivery_tiers_touch
  before update on public.restaurant_fast_delivery_tiers
  for each row execute function public.touch_fast_delivery_tiers_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. Row Level Security for fast delivery tiers
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.restaurant_fast_delivery_tiers enable row level security;

-- Public read access (customers need to see delivery fees)
drop policy if exists "public read fast_delivery_tiers" on public.restaurant_fast_delivery_tiers;
create policy "public read fast_delivery_tiers"
  on public.restaurant_fast_delivery_tiers for select
  to anon, authenticated
  using (true);

-- Super admin full access
drop policy if exists "super admin full fast_delivery_tiers access" on public.restaurant_fast_delivery_tiers;
create policy "super admin full fast_delivery_tiers access"
  on public.restaurant_fast_delivery_tiers for all
  to authenticated
  using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin')
  )
  with check (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin')
  );

-- Restaurant admin can manage their own tiers
drop policy if exists "restaurant admin manage own fast_delivery_tiers" on public.restaurant_fast_delivery_tiers;
create policy "restaurant admin manage own fast_delivery_tiers"
  on public.restaurant_fast_delivery_tiers for all
  to authenticated
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid()
        and u.role = 'restaurant_admin'
        and u.restaurant_id = restaurant_fast_delivery_tiers.restaurant_id
    )
  )
  with check (
    exists (
      select 1 from public.users u
      where u.id = auth.uid()
        and u.role = 'restaurant_admin'
        and u.restaurant_id = restaurant_fast_delivery_tiers.restaurant_id
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. Helper function: calculate delivery fee based on distance
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.calculate_delivery_fee(
  p_restaurant_id uuid,
  p_distance_km numeric
)
returns numeric
language sql
stable
security definer
set search_path = public
as $$
  -- Find the tier that contains this distance
  select coalesce(
    (
      select t.fee_usd
      from public.restaurant_delivery_tiers t
      where t.restaurant_id = p_restaurant_id
        and p_distance_km >= t.min_distance_km
        and p_distance_km <= t.max_distance_km
      limit 1
    ),
    -- Fall back to flat fee if no tiers defined
    (
      select r.delivery_fee_usd
      from public.restaurants r
      where r.id = p_restaurant_id
    ),
    0
  );
$$;

grant execute on function public.calculate_delivery_fee(uuid, numeric) to anon, authenticated;

comment on function public.calculate_delivery_fee is
  'Returns the delivery fee (USD) for a restaurant based on distance. Uses tiers if configured, otherwise falls back to flat delivery_fee_usd.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. Helper function: calculate fast delivery fee based on distance
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.calculate_fast_delivery_fee(
  p_restaurant_id uuid,
  p_distance_km numeric
)
returns numeric
language sql
stable
security definer
set search_path = public
as $$
  -- Find the tier that contains this distance
  select coalesce(
    (
      select t.fee_usd
      from public.restaurant_fast_delivery_tiers t
      where t.restaurant_id = p_restaurant_id
        and p_distance_km >= t.min_distance_km
        and p_distance_km <= t.max_distance_km
      limit 1
    ),
    -- Fall back to flat fast delivery fee if no tiers defined
    (
      select r.fast_delivery_fee_usd
      from public.restaurants r
      where r.id = p_restaurant_id
    ),
    0
  );
$$;

grant execute on function public.calculate_fast_delivery_fee(uuid, numeric) to anon, authenticated;

comment on function public.calculate_fast_delivery_fee is
  'Returns the fast delivery fee (USD) for a restaurant based on distance. Uses fast delivery tiers if configured, otherwise falls back to flat fast_delivery_fee_usd.';
