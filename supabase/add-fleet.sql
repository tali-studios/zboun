-- ─────────────────────────────────────────────────────────────────────────────
-- Fleet Management Module
-- ─────────────────────────────────────────────────────────────────────────────

-- Vehicles
create table if not exists public.fleet_vehicles (
  id              uuid        primary key default gen_random_uuid(),
  restaurant_id   uuid        not null references public.restaurants(id) on delete cascade,
  plate_number    text        not null,
  make            text,                   -- e.g. Toyota
  model           text,                   -- e.g. Hilux
  vehicle_type    text        not null default 'motorcycle'
                  check (vehicle_type in ('motorcycle','car','van','truck','bicycle','other')),
  year            int,
  color           text,
  -- Status: available | on_delivery | maintenance | inactive
  status          text        not null default 'available'
                  check (status in ('available','on_delivery','maintenance','inactive')),
  insurance_expiry date,
  notes           text,
  is_active       boolean     not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (restaurant_id, plate_number)
);

-- Drivers
create table if not exists public.fleet_drivers (
  id              uuid        primary key default gen_random_uuid(),
  restaurant_id   uuid        not null references public.restaurants(id) on delete cascade,
  full_name       text        not null,
  phone           text        not null,
  license_number  text,
  license_expiry  date,
  -- Preferred / currently assigned vehicle
  vehicle_id      uuid        references public.fleet_vehicles(id) on delete set null,
  -- Status: available | on_delivery | off_duty | inactive
  status          text        not null default 'available'
                  check (status in ('available','on_delivery','off_duty','inactive')),
  notes           text,
  is_active       boolean     not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Delivery assignments
create table if not exists public.fleet_deliveries (
  id                  uuid        primary key default gen_random_uuid(),
  restaurant_id       uuid        not null references public.restaurants(id) on delete cascade,
  driver_id           uuid        references public.fleet_drivers(id) on delete set null,
  vehicle_id          uuid        references public.fleet_vehicles(id) on delete set null,
  -- Source order links (nullable — one will typically be set)
  pos_order_id        uuid        references public.pos_orders(id) on delete set null,
  ecommerce_order_id  uuid        references public.ecommerce_orders(id) on delete set null,
  -- Customer / destination
  customer_name       text        not null,
  customer_phone      text,
  delivery_address    text        not null,
  -- Status: assigned | picked_up | in_transit | delivered | failed | cancelled
  status              text        not null default 'assigned'
                      check (status in ('assigned','picked_up','in_transit','delivered','failed','cancelled')),
  -- Timing
  assigned_at         timestamptz not null default now(),
  picked_up_at        timestamptz,
  delivered_at        timestamptz,
  -- Distance / notes
  distance_km         numeric(8,2),
  delivery_fee        numeric(10,2) not null default 0,
  notes               text,
  created_by          uuid        references public.users(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Vehicle logs (fuel, mileage, maintenance)
create table if not exists public.fleet_vehicle_logs (
  id              uuid           primary key default gen_random_uuid(),
  restaurant_id   uuid           not null references public.restaurants(id) on delete cascade,
  vehicle_id      uuid           not null references public.fleet_vehicles(id) on delete cascade,
  log_type        text           not null default 'fuel'
                  check (log_type in ('fuel','mileage','maintenance','inspection','incident','other')),
  description     text           not null,
  amount          numeric(10,2),   -- cost if applicable
  odometer_km     numeric(10,2),
  log_date        date           not null default current_date,
  created_by      uuid           references public.users(id) on delete set null,
  created_at      timestamptz    not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Indexes
-- ─────────────────────────────────────────────────────────────────────────────
create index if not exists idx_fleet_vehicles_restaurant on public.fleet_vehicles (restaurant_id);
create index if not exists idx_fleet_drivers_restaurant  on public.fleet_drivers  (restaurant_id);
create index if not exists idx_fleet_deliveries_restaurant on public.fleet_deliveries (restaurant_id, assigned_at desc);
create index if not exists idx_fleet_deliveries_driver   on public.fleet_deliveries (driver_id);
create index if not exists idx_fleet_deliveries_status   on public.fleet_deliveries (restaurant_id, status);
create index if not exists idx_fleet_vehicle_logs_vehicle on public.fleet_vehicle_logs (vehicle_id, log_date desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.fleet_vehicles      enable row level security;
alter table public.fleet_drivers       enable row level security;
alter table public.fleet_deliveries    enable row level security;
alter table public.fleet_vehicle_logs  enable row level security;

create policy "superadmin full fleet_vehicles" on public.fleet_vehicles for all to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'));
create policy "restaurant admin own fleet_vehicles" on public.fleet_vehicles for all to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = fleet_vehicles.restaurant_id))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = fleet_vehicles.restaurant_id));

create policy "superadmin full fleet_drivers" on public.fleet_drivers for all to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'));
create policy "restaurant admin own fleet_drivers" on public.fleet_drivers for all to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = fleet_drivers.restaurant_id))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = fleet_drivers.restaurant_id));

create policy "superadmin full fleet_deliveries" on public.fleet_deliveries for all to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'));
create policy "restaurant admin own fleet_deliveries" on public.fleet_deliveries for all to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = fleet_deliveries.restaurant_id))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = fleet_deliveries.restaurant_id));

create policy "superadmin full fleet_vehicle_logs" on public.fleet_vehicle_logs for all to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'));
create policy "restaurant admin own fleet_vehicle_logs" on public.fleet_vehicle_logs for all to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = fleet_vehicle_logs.restaurant_id))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = fleet_vehicle_logs.restaurant_id));
