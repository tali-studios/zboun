-- ─────────────────────────────────────────────────────────────────────────────
-- Restaurant locations (multi-branch support)
-- Each restaurant can have N physical branches.
-- The home-page distance filter checks against ALL branches.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.restaurant_locations (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name          text not null default 'Main Branch',   -- e.g. "Hamra", "Downtown"
  latitude      double precision not null,
  longitude     double precision not null,
  address       text,                                  -- human-readable address
  phone         text,                                  -- branch-specific phone (optional)
  is_main       boolean not null default false,
  position      smallint not null default 0,           -- display order
  created_at    timestamptz not null default now()
);

create index if not exists idx_restaurant_locations_restaurant_id
  on public.restaurant_locations (restaurant_id);

alter table public.restaurant_locations enable row level security;

-- Anyone can read (needed for home page distance filter)
create policy "public: read restaurant_locations"
  on public.restaurant_locations for select
  using (true);

-- Restaurant admins manage their own locations
create policy "restaurant_admin: manage own restaurant_locations"
  on public.restaurant_locations for all
  using (
    exists (
      select 1 from public.users
      where id = auth.uid()
        and role = 'restaurant_admin'
        and restaurant_id = restaurant_locations.restaurant_id
    )
  )
  with check (
    exists (
      select 1 from public.users
      where id = auth.uid()
        and role = 'restaurant_admin'
        and restaurant_id = restaurant_locations.restaurant_id
    )
  );

-- Super admins manage all
create policy "superadmin: manage all restaurant_locations"
  on public.restaurant_locations for all
  using (
    exists (select 1 from public.users where id = auth.uid() and role = 'superadmin')
  )
  with check (
    exists (select 1 from public.users where id = auth.uid() and role = 'superadmin')
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- Migrate existing single lat/lng from restaurants → restaurant_locations
-- (Only for rows that have coordinates but no locations entry yet)
-- ─────────────────────────────────────────────────────────────────────────────
insert into public.restaurant_locations (restaurant_id, name, latitude, longitude, is_main, position)
select
  id,
  'Main Branch',
  latitude,
  longitude,
  true,
  0
from public.restaurants
where
  latitude is not null
  and longitude is not null
  and id not in (select restaurant_id from public.restaurant_locations)
on conflict do nothing;
