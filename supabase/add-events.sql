-- ─────────────────────────────────────────────────────────────────────────────
-- Event & Reservation Management Module
-- Covers two distinct workflows:
--   1. Table Reservations  — standard dining reservations (walk-in date/time slot)
--   2. Private Event Bookings — venue hire, private parties, corporate events
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Table Reservations ────────────────────────────────────────────────────────
create table if not exists public.table_reservations (
  id              uuid        primary key default gen_random_uuid(),
  restaurant_id   uuid        not null references public.restaurants(id) on delete cascade,
  -- Guest info
  guest_name      text        not null,
  guest_phone     text        not null,
  guest_email     text,
  -- Booking details
  reservation_date date       not null,
  reservation_time time       not null,
  party_size      int         not null check (party_size > 0),
  table_label     text,       -- e.g. "Table 7", "Terrace A"
  -- Status flow: pending → confirmed → seated → completed | cancelled | no_show
  status          text        not null default 'pending'
                  check (status in ('pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show')),
  special_requests text,
  internal_notes  text,
  -- Optional CRM link
  crm_customer_id uuid        references public.crm_customers(id) on delete set null,
  created_by      uuid        references public.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ── Event Spaces (configurable rooms / venue areas) ───────────────────────────
create table if not exists public.event_spaces (
  id              uuid           primary key default gen_random_uuid(),
  restaurant_id   uuid           not null references public.restaurants(id) on delete cascade,
  name            text           not null,
  description     text,
  capacity_min    int            check (capacity_min > 0),
  capacity_max    int            not null check (capacity_max > 0),
  -- Pricing model: flat fee for the event OR hourly rate
  pricing_type    text           not null default 'flat' check (pricing_type in ('flat', 'hourly')),
  base_price      numeric(10, 2) not null default 0 check (base_price >= 0),
  currency        text           not null default 'USD',
  amenities       text[],        -- e.g. {"AV equipment","Projector","Private bar"}
  is_active       boolean        not null default true,
  created_at      timestamptz    not null default now(),
  updated_at      timestamptz    not null default now()
);

-- ── Event Packages (optional extras that can be added to a booking) ────────────
create table if not exists public.event_packages (
  id              uuid           primary key default gen_random_uuid(),
  restaurant_id   uuid           not null references public.restaurants(id) on delete cascade,
  name            text           not null,
  description     text,
  price           numeric(10, 2) not null default 0 check (price >= 0),
  is_active       boolean        not null default true,
  created_at      timestamptz    not null default now()
);

-- ── Event Bookings ────────────────────────────────────────────────────────────
create table if not exists public.event_bookings (
  id              uuid           primary key default gen_random_uuid(),
  restaurant_id   uuid           not null references public.restaurants(id) on delete cascade,
  space_id        uuid           references public.event_spaces(id) on delete set null,
  -- Reference number displayed to the guest
  reference_number text,
  -- Guest / organiser info
  organiser_name  text           not null,
  organiser_phone text           not null,
  organiser_email text,
  organisation    text,          -- company / group name
  -- Event details
  event_name      text           not null,
  event_type      text           not null default 'private_party'
                  check (event_type in (
                    'private_party', 'corporate', 'wedding', 'birthday',
                    'graduation', 'meeting', 'other'
                  )),
  event_date      date           not null,
  start_time      time           not null,
  end_time        time,
  guest_count     int            not null check (guest_count > 0),
  -- Status flow: inquiry → confirmed → deposit_paid → completed | cancelled
  status          text           not null default 'inquiry'
                  check (status in ('inquiry', 'confirmed', 'deposit_paid', 'completed', 'cancelled')),
  -- Financials
  space_fee       numeric(10, 2) not null default 0,
  packages_total  numeric(10, 2) not null default 0,
  extras_total    numeric(10, 2) not null default 0,
  total_amount    numeric(10, 2) not null default 0,
  deposit_amount  numeric(10, 2) not null default 0,
  deposit_paid_at timestamptz,
  balance_due     numeric(10, 2) generated always as (total_amount - deposit_amount) stored,
  -- Notes
  special_requests text,
  internal_notes  text,
  -- CRM link
  crm_customer_id uuid           references public.crm_customers(id) on delete set null,
  created_by      uuid           references public.users(id) on delete set null,
  created_at      timestamptz    not null default now(),
  updated_at      timestamptz    not null default now()
);

-- ── Booking Package Assignments ───────────────────────────────────────────────
create table if not exists public.event_booking_packages (
  id          uuid           primary key default gen_random_uuid(),
  booking_id  uuid           not null references public.event_bookings(id) on delete cascade,
  package_id  uuid           references public.event_packages(id) on delete set null,
  package_name text          not null,  -- snapshot at time of booking
  quantity    int            not null default 1 check (quantity > 0),
  unit_price  numeric(10, 2) not null default 0,
  line_total  numeric(10, 2) not null default 0,
  created_at  timestamptz    not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Reference number sequence (reuses restaurant_receipt_sequences)
-- prefix: 'RES' for reservations, 'EVT' for event bookings
-- ─────────────────────────────────────────────────────────────────────────────

-- ─────────────────────────────────────────────────────────────────────────────
-- Indexes
-- ─────────────────────────────────────────────────────────────────────────────
create index if not exists idx_table_reservations_restaurant_date
  on public.table_reservations (restaurant_id, reservation_date);
create index if not exists idx_table_reservations_status
  on public.table_reservations (restaurant_id, status);
create index if not exists idx_table_reservations_crm
  on public.table_reservations (crm_customer_id)
  where crm_customer_id is not null;

create index if not exists idx_event_spaces_restaurant_id
  on public.event_spaces (restaurant_id);
create index if not exists idx_event_packages_restaurant_id
  on public.event_packages (restaurant_id);

create index if not exists idx_event_bookings_restaurant_date
  on public.event_bookings (restaurant_id, event_date);
create index if not exists idx_event_bookings_status
  on public.event_bookings (restaurant_id, status);
create index if not exists idx_event_bookings_space_id
  on public.event_bookings (space_id)
  where space_id is not null;
create index if not exists idx_event_booking_packages_booking_id
  on public.event_booking_packages (booking_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.table_reservations     enable row level security;
alter table public.event_spaces           enable row level security;
alter table public.event_packages         enable row level security;
alter table public.event_bookings         enable row level security;
alter table public.event_booking_packages enable row level security;

-- Helper macro: superadmin OR restaurant_admin owns the restaurant_id column
-- table_reservations ──────────────────────────────────────────────────────────
create policy "superadmin full table_reservations"
on public.table_reservations for all to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'));

create policy "restaurant admin manage own table_reservations"
on public.table_reservations for all to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = table_reservations.restaurant_id))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = table_reservations.restaurant_id));

-- event_spaces ────────────────────────────────────────────────────────────────
create policy "superadmin full event_spaces"
on public.event_spaces for all to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'));

create policy "restaurant admin manage own event_spaces"
on public.event_spaces for all to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = event_spaces.restaurant_id))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = event_spaces.restaurant_id));

-- event_packages ──────────────────────────────────────────────────────────────
create policy "superadmin full event_packages"
on public.event_packages for all to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'));

create policy "restaurant admin manage own event_packages"
on public.event_packages for all to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = event_packages.restaurant_id))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = event_packages.restaurant_id));

-- event_bookings ──────────────────────────────────────────────────────────────
create policy "superadmin full event_bookings"
on public.event_bookings for all to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'));

create policy "restaurant admin manage own event_bookings"
on public.event_bookings for all to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = event_bookings.restaurant_id))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = event_bookings.restaurant_id));

-- event_booking_packages ──────────────────────────────────────────────────────
create policy "superadmin full event_booking_packages"
on public.event_booking_packages for all to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'));

create policy "restaurant admin manage own event_booking_packages"
on public.event_booking_packages for all to authenticated
using (
  exists (
    select 1 from public.event_bookings eb
    join public.users u on u.id = auth.uid()
    where eb.id = event_booking_packages.booking_id
      and u.role = 'restaurant_admin'
      and u.restaurant_id = eb.restaurant_id
  )
)
with check (
  exists (
    select 1 from public.event_bookings eb
    join public.users u on u.id = auth.uid()
    where eb.id = event_booking_packages.booking_id
      and u.role = 'restaurant_admin'
      and u.restaurant_id = eb.restaurant_id
  )
);
