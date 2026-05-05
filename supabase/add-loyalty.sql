-- ─────────────────────────────────────────────────────────────────────────────
-- Loyalty Management Module
-- Supports two parallel program types per restaurant:
--   1. Points-based  — earn N points per dollar, redeem at configured threshold
--   2. Stamp card    — collect N stamps, earn a free reward
-- ─────────────────────────────────────────────────────────────────────────────

-- Program configuration (one row per restaurant, updatable)
create table if not exists public.loyalty_programs (
  id                    uuid           primary key default gen_random_uuid(),
  restaurant_id         uuid           not null unique references public.restaurants(id) on delete cascade,

  -- Points program
  points_enabled        boolean        not null default true,
  points_per_dollar     numeric(8, 2)  not null default 1   check (points_per_dollar > 0),
  points_redeem_per_dollar numeric(8, 2) not null default 100 check (points_redeem_per_dollar > 0),
  -- e.g. 100 points = $1 discount

  -- Stamp card
  stamps_enabled        boolean        not null default false,
  stamps_required       int            not null default 10   check (stamps_required > 0),
  stamp_reward_desc     text,
  -- e.g. "Free coffee on your 10th visit"

  -- Referral
  referral_enabled      boolean        not null default false,
  referral_bonus_points int            not null default 50,

  -- Tiers
  tiers_enabled         boolean        not null default false,
  tier_silver_threshold int            not null default 500,
  tier_gold_threshold   int            not null default 1500,
  tier_platinum_threshold int          not null default 5000,

  is_active             boolean        not null default true,
  created_at            timestamptz    not null default now(),
  updated_at            timestamptz    not null default now()
);

-- One member record per customer per restaurant
create table if not exists public.loyalty_members (
  id              uuid        primary key default gen_random_uuid(),
  restaurant_id   uuid        not null references public.restaurants(id) on delete cascade,
  -- Optional link to CRM customer profile
  crm_customer_id uuid        references public.crm_customers(id) on delete set null,
  -- Identifier used when no CRM profile exists
  phone           text,
  email           text,
  full_name       text        not null,
  points_balance  int         not null default 0 check (points_balance >= 0),
  stamps_balance  int         not null default 0 check (stamps_balance >= 0),
  total_stamps_ever int       not null default 0,
  lifetime_points int         not null default 0,
  tier            text        not null default 'standard' check (tier in ('standard', 'silver', 'gold', 'platinum')),
  is_active       boolean     not null default true,
  enrolled_at     timestamptz not null default now(),
  last_activity_at timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (restaurant_id, phone),
  constraint phone_or_email_required check (phone is not null or email is not null)
);

-- Immutable transaction log for all loyalty events
create table if not exists public.loyalty_transactions (
  id              uuid        primary key default gen_random_uuid(),
  restaurant_id   uuid        not null references public.restaurants(id) on delete cascade,
  member_id       uuid        not null references public.loyalty_members(id) on delete cascade,
  -- pos_order_id is nullable — manual adjustments won't have an order
  pos_order_id    uuid        references public.pos_orders(id) on delete set null,
  type            text        not null check (type in (
                    'earn_points', 'redeem_points', 'earn_stamp',
                    'stamp_reward', 'referral_bonus', 'adjustment',
                    'tier_upgrade', 'expiry'
                  )),
  points_delta    int         not null default 0,
  stamps_delta    int         not null default 0,
  description     text,
  created_by      uuid        references public.users(id) on delete set null,
  created_at      timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Tier recalculation trigger
-- Automatically upgrades/downgrades tier when lifetime_points changes
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.recalculate_loyalty_tier()
returns trigger language plpgsql as $$
declare
  prog public.loyalty_programs%rowtype;
begin
  if not new.tiers_enabled then
    return new;
  end if;

  select * into prog
  from public.loyalty_programs
  where restaurant_id = new.restaurant_id;

  if not found or not prog.tiers_enabled then
    return new;
  end if;

  new.tier :=
    case
      when new.lifetime_points >= prog.tier_platinum_threshold then 'platinum'
      when new.lifetime_points >= prog.tier_gold_threshold     then 'gold'
      when new.lifetime_points >= prog.tier_silver_threshold   then 'silver'
      else 'standard'
    end;

  return new;
end;
$$;

-- Wrap the tier function so it only depends on loyalty_members columns
create or replace function public.recalculate_member_tier()
returns trigger language plpgsql as $$
declare
  prog public.loyalty_programs%rowtype;
begin
  select * into prog
  from public.loyalty_programs
  where restaurant_id = new.restaurant_id;

  if not found or not prog.tiers_enabled then
    return new;
  end if;

  new.tier :=
    case
      when new.lifetime_points >= prog.tier_platinum_threshold then 'platinum'
      when new.lifetime_points >= prog.tier_gold_threshold     then 'gold'
      when new.lifetime_points >= prog.tier_silver_threshold   then 'silver'
      else 'standard'
    end;

  return new;
end;
$$;

create or replace trigger trg_member_tier_update
before update of lifetime_points on public.loyalty_members
for each row execute function public.recalculate_member_tier();

-- ─────────────────────────────────────────────────────────────────────────────
-- Indexes
-- ─────────────────────────────────────────────────────────────────────────────
create index if not exists idx_loyalty_members_restaurant_id
  on public.loyalty_members (restaurant_id);
create index if not exists idx_loyalty_members_phone
  on public.loyalty_members (restaurant_id, phone)
  where phone is not null;
create index if not exists idx_loyalty_members_crm_customer
  on public.loyalty_members (crm_customer_id)
  where crm_customer_id is not null;
create index if not exists idx_loyalty_transactions_member_id
  on public.loyalty_transactions (member_id);
create index if not exists idx_loyalty_transactions_restaurant_id
  on public.loyalty_transactions (restaurant_id, created_at desc);
create index if not exists idx_loyalty_transactions_pos_order_id
  on public.loyalty_transactions (pos_order_id)
  where pos_order_id is not null;

-- ─────────────────────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.loyalty_programs     enable row level security;
alter table public.loyalty_members      enable row level security;
alter table public.loyalty_transactions enable row level security;

-- loyalty_programs ------------------------------------------------------------
create policy "superadmin full loyalty_programs access"
on public.loyalty_programs for all to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'));

create policy "restaurant admin manage own loyalty_programs"
on public.loyalty_programs for all to authenticated
using (
  exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = loyalty_programs.restaurant_id)
)
with check (
  exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = loyalty_programs.restaurant_id)
);

-- loyalty_members -------------------------------------------------------------
create policy "superadmin full loyalty_members access"
on public.loyalty_members for all to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'));

create policy "restaurant admin manage own loyalty_members"
on public.loyalty_members for all to authenticated
using (
  exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = loyalty_members.restaurant_id)
)
with check (
  exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = loyalty_members.restaurant_id)
);

-- loyalty_transactions --------------------------------------------------------
create policy "superadmin full loyalty_transactions access"
on public.loyalty_transactions for all to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'));

create policy "restaurant admin manage own loyalty_transactions"
on public.loyalty_transactions for all to authenticated
using (
  exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = loyalty_transactions.restaurant_id)
)
with check (
  exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = loyalty_transactions.restaurant_id)
);
