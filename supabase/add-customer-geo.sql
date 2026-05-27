-- ───────────────────────────────────────────────────────────────────────
-- 1. Restaurant geo-coordinates + delivery radius
-- ───────────────────────────────────────────────────────────────────────
alter table public.restaurants
  add column if not exists latitude double precision,
  add column if not exists longitude double precision,
  add column if not exists delivery_radius_km numeric(6,2) default 15;

create index if not exists idx_restaurants_geo
  on public.restaurants (latitude, longitude)
  where latitude is not null and longitude is not null;

-- ───────────────────────────────────────────────────────────────────────
-- 2. Customer profiles (end-users / guests who sign up)
--    Separate from public.users (which holds restaurant_admin / superadmin)
-- ───────────────────────────────────────────────────────────────────────
create table if not exists public.customer_profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  email       text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.customer_profiles enable row level security;

create policy "customers: read own profile"
  on public.customer_profiles for select
  using (auth.uid() = id);

create policy "customers: insert own profile"
  on public.customer_profiles for insert
  with check (auth.uid() = id);

create policy "customers: update own profile"
  on public.customer_profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);

create policy "customers: delete own profile"
  on public.customer_profiles for delete
  using (auth.uid() = id);

-- ───────────────────────────────────────────────────────────────────────
-- 3. Customer saved addresses
-- ───────────────────────────────────────────────────────────────────────
create table if not exists public.customer_addresses (
  id                uuid primary key default gen_random_uuid(),
  customer_id       uuid not null references public.customer_profiles(id) on delete cascade,
  label             text not null default 'other'
                    check (label in ('home','work','moms','other','custom')),
  nickname          text,          -- e.g. "Home", "Work", "Mom's", user-typed
  latitude          double precision not null,
  longitude         double precision not null,
  formatted_address text,
  street            text,
  building          text,
  apartment         text,
  phone             text,
  driver_notes      text,
  is_default        boolean not null default false,
  created_at        timestamptz not null default now()
);

create index if not exists idx_customer_addresses_customer_id
  on public.customer_addresses (customer_id);

alter table public.customer_addresses enable row level security;

create policy "customers: manage own addresses"
  on public.customer_addresses for all
  using (auth.uid() = customer_id)
  with check (auth.uid() = customer_id);
