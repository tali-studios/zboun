-- ─────────────────────────────────────────────────────────────────────────────
-- Club Management Module
-- ─────────────────────────────────────────────────────────────────────────────

-- Membership plans / tiers
create table if not exists public.club_plans (
  id              uuid           primary key default gen_random_uuid(),
  restaurant_id   uuid           not null references public.restaurants(id) on delete cascade,
  name            text           not null,            -- e.g. "Silver", "Gold", "Platinum"
  description     text,
  price           numeric(10,2)  not null default 0,
  billing_cycle   text           not null default 'monthly'
                  check (billing_cycle in ('monthly','quarterly','annual','one_time')),
  duration_days   int,                               -- null = unlimited
  max_guests      int            not null default 1,
  benefits        text[],                            -- e.g. {"Priority seating","10% F&B discount"}
  color           text           not null default '#6366f1',
  is_active       boolean        not null default true,
  created_at      timestamptz    not null default now(),
  updated_at      timestamptz    not null default now()
);

-- Club members (enrolled persons)
create table if not exists public.club_members (
  id                  uuid        primary key default gen_random_uuid(),
  restaurant_id       uuid        not null references public.restaurants(id) on delete cascade,
  plan_id             uuid        references public.club_plans(id) on delete set null,
  -- Personal info
  full_name           text        not null,
  phone               text,
  email               text,
  photo_url           text,
  member_number       text,        -- displayed on card e.g. "CLB-000042"
  -- Dates
  joined_at           date        not null default current_date,
  expiry_date         date,
  -- Status: active | suspended | expired | cancelled
  status              text        not null default 'active'
                      check (status in ('active','suspended','expired','cancelled')),
  -- Accumulated
  total_visits        int         not null default 0,
  total_spent         numeric(12,2) not null default 0,
  -- CRM / loyalty links
  crm_customer_id     uuid        references public.crm_customers(id) on delete set null,
  loyalty_member_id   uuid        references public.loyalty_members(id) on delete set null,
  -- Notes
  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Check-in log
create table if not exists public.club_check_ins (
  id              uuid        primary key default gen_random_uuid(),
  restaurant_id   uuid        not null references public.restaurants(id) on delete cascade,
  member_id       uuid        not null references public.club_members(id) on delete cascade,
  guests_count    int         not null default 1 check (guests_count > 0),
  notes           text,
  checked_in_by   uuid        references public.users(id) on delete set null,
  checked_in_at   timestamptz not null default now()
);

-- Subscription invoices / payments
create table if not exists public.club_invoices (
  id              uuid           primary key default gen_random_uuid(),
  restaurant_id   uuid           not null references public.restaurants(id) on delete cascade,
  member_id       uuid           not null references public.club_members(id) on delete cascade,
  invoice_number  text,
  period_start    date,
  period_end      date,
  amount          numeric(10,2)  not null,
  status          text           not null default 'unpaid'
                  check (status in ('unpaid','paid','waived','refunded')),
  paid_at         timestamptz,
  notes           text,
  created_by      uuid           references public.users(id) on delete set null,
  created_at      timestamptz    not null default now(),
  updated_at      timestamptz    not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Indexes
-- ─────────────────────────────────────────────────────────────────────────────
create index if not exists idx_club_plans_restaurant    on public.club_plans    (restaurant_id);
create index if not exists idx_club_members_restaurant  on public.club_members  (restaurant_id);
create index if not exists idx_club_members_plan        on public.club_members  (plan_id);
create index if not exists idx_club_members_status      on public.club_members  (restaurant_id, status);
create index if not exists idx_club_check_ins_member    on public.club_check_ins (member_id, checked_in_at desc);
create index if not exists idx_club_check_ins_restaurant on public.club_check_ins (restaurant_id, checked_in_at desc);
create index if not exists idx_club_invoices_member     on public.club_invoices  (member_id);
create index if not exists idx_club_invoices_status     on public.club_invoices  (restaurant_id, status);

-- ─────────────────────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.club_plans      enable row level security;
alter table public.club_members    enable row level security;
alter table public.club_check_ins  enable row level security;
alter table public.club_invoices   enable row level security;

create policy "superadmin full club_plans" on public.club_plans for all to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'));
create policy "restaurant admin own club_plans" on public.club_plans for all to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = club_plans.restaurant_id))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = club_plans.restaurant_id));

create policy "superadmin full club_members" on public.club_members for all to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'));
create policy "restaurant admin own club_members" on public.club_members for all to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = club_members.restaurant_id))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = club_members.restaurant_id));

create policy "superadmin full club_check_ins" on public.club_check_ins for all to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'));
create policy "restaurant admin own club_check_ins" on public.club_check_ins for all to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = club_check_ins.restaurant_id))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = club_check_ins.restaurant_id));

create policy "superadmin full club_invoices" on public.club_invoices for all to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'));
create policy "restaurant admin own club_invoices" on public.club_invoices for all to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = club_invoices.restaurant_id))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = club_invoices.restaurant_id));
