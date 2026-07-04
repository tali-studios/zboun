-- Lightweight store drivers for menu orders

create table if not exists public.restaurant_drivers (
  id            uuid        primary key default gen_random_uuid(),
  restaurant_id uuid        not null references public.restaurants(id) on delete cascade,
  full_name     text        not null,
  phone         text,
  notes         text,
  is_active     boolean     not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.restaurants
  add column if not exists driver_management_enabled boolean not null default false;

alter table public.orders
  add column if not exists driver_id uuid,
  add column if not exists driver_assigned_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'orders_driver_id_fkey'
      and conrelid = 'public.orders'::regclass
  ) then
    alter table public.orders
      add constraint orders_driver_id_fkey
      foreign key (driver_id) references public.restaurant_drivers(id) on delete set null;
  end if;
end;
$$;

create index if not exists idx_restaurant_drivers_restaurant_id
  on public.restaurant_drivers (restaurant_id);

create index if not exists idx_restaurant_drivers_active
  on public.restaurant_drivers (restaurant_id, is_active);

create unique index if not exists idx_restaurant_drivers_unique_phone
  on public.restaurant_drivers (restaurant_id, phone)
  where phone is not null;

create index if not exists idx_orders_driver_id
  on public.orders (restaurant_id, driver_id);

alter table public.restaurant_drivers enable row level security;

drop policy if exists "restaurant: manage own drivers" on public.restaurant_drivers;
create policy "restaurant: manage own drivers"
  on public.restaurant_drivers
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

drop policy if exists "superadmin: all drivers" on public.restaurant_drivers;
create policy "superadmin: all drivers"
  on public.restaurant_drivers
  for all
  using (
    exists (select 1 from public.users where id = auth.uid() and role = 'superadmin')
  )
  with check (
    exists (select 1 from public.users where id = auth.uid() and role = 'superadmin')
  );

create or replace function public.restaurant_drivers_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists restaurant_drivers_updated_at on public.restaurant_drivers;
create trigger restaurant_drivers_updated_at
  before update on public.restaurant_drivers
  for each row execute function public.restaurant_drivers_set_updated_at();
