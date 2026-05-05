-- ─────────────────────────────────────────────────────────────────────────────
-- Property Management System (PMS)
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Room Types ────────────────────────────────────────────────────────────────
create table if not exists public.pms_room_types (
  id              uuid           primary key default gen_random_uuid(),
  restaurant_id   uuid           not null references public.restaurants(id) on delete cascade,
  name            text           not null,           -- e.g. "Deluxe Double", "Suite"
  description     text,
  capacity        int            not null default 2 check (capacity > 0),
  base_rate       numeric(10,2)  not null default 0 check (base_rate >= 0),
  currency        text           not null default 'USD',
  amenities       text[],        -- e.g. {"Sea view","Jacuzzi","King bed"}
  is_active       boolean        not null default true,
  created_at      timestamptz    not null default now(),
  updated_at      timestamptz    not null default now()
);

-- ── Rooms ─────────────────────────────────────────────────────────────────────
create table if not exists public.pms_rooms (
  id              uuid        primary key default gen_random_uuid(),
  restaurant_id   uuid        not null references public.restaurants(id) on delete cascade,
  room_type_id    uuid        references public.pms_room_types(id) on delete set null,
  room_number     text        not null,   -- e.g. "101", "Penthouse"
  floor           int,
  -- Status: available | occupied | reserved | maintenance | housekeeping
  status          text        not null default 'available'
                  check (status in ('available','occupied','reserved','maintenance','housekeeping')),
  notes           text,
  is_active       boolean     not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (restaurant_id, room_number)
);

-- ── PMS Reservations ──────────────────────────────────────────────────────────
create table if not exists public.pms_reservations (
  id               uuid           primary key default gen_random_uuid(),
  restaurant_id    uuid           not null references public.restaurants(id) on delete cascade,
  room_id          uuid           references public.pms_rooms(id) on delete set null,
  room_type_id     uuid           references public.pms_room_types(id) on delete set null,
  reference_number text,
  -- Guest info
  guest_name       text           not null,
  guest_phone      text,
  guest_email      text,
  guest_id_number  text,          -- passport / national ID
  nationality      text,
  adults           int            not null default 1 check (adults > 0),
  children         int            not null default 0 check (children >= 0),
  -- Dates
  check_in_date    date           not null,
  check_out_date   date           not null,
  actual_check_in  timestamptz,
  actual_check_out timestamptz,
  nights           int            generated always as (check_out_date - check_in_date) stored,
  -- Status: inquiry | confirmed | checked_in | checked_out | cancelled | no_show
  status           text           not null default 'confirmed'
                   check (status in ('inquiry','confirmed','checked_in','checked_out','cancelled','no_show')),
  -- Financials
  rate_per_night   numeric(10,2)  not null default 0,
  room_total       numeric(10,2)  not null default 0,  -- nights * rate
  charges_total    numeric(10,2)  not null default 0,  -- extras
  grand_total      numeric(10,2)  not null default 0,  -- room_total + charges_total
  amount_paid      numeric(10,2)  not null default 0,
  balance_due      numeric(10,2)  generated always as (grand_total - amount_paid) stored,
  -- Source / channel
  booking_source   text           default 'direct'
                   check (booking_source in ('direct','phone','walk_in','online','ota','corporate')),
  -- Notes
  special_requests text,
  internal_notes   text,
  -- CRM link
  crm_customer_id  uuid           references public.crm_customers(id) on delete set null,
  created_by       uuid           references public.users(id) on delete set null,
  created_at       timestamptz    not null default now(),
  updated_at       timestamptz    not null default now(),
  constraint check_out_after_check_in check (check_out_date > check_in_date)
);

-- ── Room Charges (minibar, room service, restaurant bill, etc.) ────────────────
create table if not exists public.pms_charges (
  id              uuid           primary key default gen_random_uuid(),
  restaurant_id   uuid           not null references public.restaurants(id) on delete cascade,
  reservation_id  uuid           not null references public.pms_reservations(id) on delete cascade,
  category        text           not null default 'other'
                  check (category in ('restaurant','minibar','room_service','laundry','spa','phone','other')),
  description     text           not null,
  amount          numeric(10,2)  not null check (amount > 0),
  charged_at      timestamptz    not null default now(),
  created_by      uuid           references public.users(id) on delete set null,
  created_at      timestamptz    not null default now()
);

-- ── Housekeeping Log ──────────────────────────────────────────────────────────
create table if not exists public.pms_housekeeping_logs (
  id              uuid        primary key default gen_random_uuid(),
  restaurant_id   uuid        not null references public.restaurants(id) on delete cascade,
  room_id         uuid        not null references public.pms_rooms(id) on delete cascade,
  task_type       text        not null default 'cleaning'
                  check (task_type in ('cleaning','turndown','inspection','maintenance','deep_clean')),
  status          text        not null default 'pending'
                  check (status in ('pending','in_progress','done')),
  assigned_to     text,       -- staff name (free text for now)
  notes           text,
  scheduled_date  date        not null default current_date,
  completed_at    timestamptz,
  created_by      uuid        references public.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Trigger: sync charges_total and grand_total on pms_reservations
-- when a charge is inserted/deleted
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.sync_pms_reservation_totals()
returns trigger language plpgsql as $$
declare
  rid uuid;
begin
  rid := coalesce(new.reservation_id, old.reservation_id);
  update public.pms_reservations r
  set
    charges_total = (
      select coalesce(sum(c.amount), 0)
      from public.pms_charges c
      where c.reservation_id = rid
    ),
    grand_total = r.room_total + (
      select coalesce(sum(c.amount), 0)
      from public.pms_charges c
      where c.reservation_id = rid
    ),
    updated_at = now()
  where r.id = rid;
  return coalesce(new, old);
end;
$$;

create or replace trigger trg_pms_charges_sync
after insert or delete on public.pms_charges
for each row execute function public.sync_pms_reservation_totals();

-- ─────────────────────────────────────────────────────────────────────────────
-- Indexes
-- ─────────────────────────────────────────────────────────────────────────────
create index if not exists idx_pms_room_types_restaurant
  on public.pms_room_types (restaurant_id);
create index if not exists idx_pms_rooms_restaurant
  on public.pms_rooms (restaurant_id);
create index if not exists idx_pms_rooms_status
  on public.pms_rooms (restaurant_id, status);
create index if not exists idx_pms_reservations_restaurant_dates
  on public.pms_reservations (restaurant_id, check_in_date, check_out_date);
create index if not exists idx_pms_reservations_status
  on public.pms_reservations (restaurant_id, status);
create index if not exists idx_pms_reservations_room_id
  on public.pms_reservations (room_id);
create index if not exists idx_pms_charges_reservation
  on public.pms_charges (reservation_id);
create index if not exists idx_pms_housekeeping_room
  on public.pms_housekeeping_logs (room_id, scheduled_date);
create index if not exists idx_pms_housekeeping_restaurant
  on public.pms_housekeeping_logs (restaurant_id, scheduled_date);

-- ─────────────────────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.pms_room_types        enable row level security;
alter table public.pms_rooms             enable row level security;
alter table public.pms_reservations      enable row level security;
alter table public.pms_charges           enable row level security;
alter table public.pms_housekeeping_logs enable row level security;

-- Macro: superadmin full access + restaurant_admin own-restaurant access
do $$
declare
  tbl text;
  col text;
begin
  foreach tbl in array array[
    'pms_room_types','pms_rooms','pms_reservations','pms_charges','pms_housekeeping_logs'
  ]
  loop
    execute format('
      create policy "superadmin full %1$s access"
      on public.%1$s for all to authenticated
      using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = ''superadmin''))
      with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = ''superadmin''));
    ', tbl);
  end loop;
end;
$$;

-- pms_room_types ──────────────────────────────────────────────────────────────
create policy "restaurant admin manage own pms_room_types"
on public.pms_room_types for all to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = pms_room_types.restaurant_id))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = pms_room_types.restaurant_id));

-- pms_rooms ───────────────────────────────────────────────────────────────────
create policy "restaurant admin manage own pms_rooms"
on public.pms_rooms for all to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = pms_rooms.restaurant_id))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = pms_rooms.restaurant_id));

-- pms_reservations ────────────────────────────────────────────────────────────
create policy "restaurant admin manage own pms_reservations"
on public.pms_reservations for all to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = pms_reservations.restaurant_id))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = pms_reservations.restaurant_id));

-- pms_charges ─────────────────────────────────────────────────────────────────
create policy "restaurant admin manage own pms_charges"
on public.pms_charges for all to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = pms_charges.restaurant_id))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = pms_charges.restaurant_id));

-- pms_housekeeping_logs ───────────────────────────────────────────────────────
create policy "restaurant admin manage own pms_housekeeping_logs"
on public.pms_housekeeping_logs for all to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = pms_housekeeping_logs.restaurant_id))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = pms_housekeeping_logs.restaurant_id));
