create extension if not exists "pgcrypto";

create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  phone text not null,
  logo_url text,
  lbp_rate numeric(12, 2) not null default 89500 check (lbp_rate >= 0),
  is_active boolean not null default true,
  show_on_home boolean not null default true,
  browse_sections text[] not null default array['Lunch']::text[],
  created_at timestamptz not null default now()
);

alter table public.restaurants
  add column if not exists lbp_rate numeric(12, 2) not null default 89500 check (lbp_rate >= 0);
alter table public.restaurants
  add column if not exists browse_sections text[] not null default array['Lunch']::text[];

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  role text not null check (role in ('superadmin', 'restaurant_admin')),
  restaurant_id uuid references public.restaurants(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  name text not null,
  description text,
  contents text,
  grams int check (grams >= 0),
  price numeric(10, 2) not null check (price >= 0),
  removable_ingredients jsonb not null default '[]'::jsonb,
  add_ingredients jsonb not null default '[]'::jsonb,
  image_url text,
  is_available boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.menu_items add column if not exists image_url text;
alter table public.menu_items add column if not exists contents text;
alter table public.menu_items add column if not exists grams int check (grams >= 0);
alter table public.menu_items add column if not exists removable_ingredients jsonb not null default '[]'::jsonb;
alter table public.menu_items add column if not exists add_ingredients jsonb not null default '[]'::jsonb;

create table if not exists public.password_change_otps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  otp_hash text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  interval text not null check (interval in ('monthly', 'yearly', 'custom')),
  price numeric(10, 2) not null check (price >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.restaurant_subscriptions (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  plan_id uuid references public.subscription_plans(id) on delete set null,
  status text not null check (status in ('trial', 'active', 'overdue', 'paused', 'cancelled')),
  start_at timestamptz not null default now(),
  next_due_at timestamptz,
  ended_at timestamptz,
  billing_cycle_price numeric(10, 2) not null check (billing_cycle_price >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  subscription_id uuid references public.restaurant_subscriptions(id) on delete set null,
  period_start date,
  period_end date,
  amount_due numeric(10, 2) not null check (amount_due >= 0),
  amount_paid numeric(10, 2) not null default 0 check (amount_paid >= 0),
  status text not null default 'unpaid' check (status in ('unpaid', 'partial', 'paid', 'void')),
  due_at timestamptz not null,
  paid_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  amount_paid numeric(10, 2) not null check (amount_paid > 0),
  paid_at timestamptz not null default now(),
  method text not null default 'cash' check (method in ('cash')),
  reference_note text,
  recorded_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_restaurant_subscriptions_restaurant_id
  on public.restaurant_subscriptions(restaurant_id);
create index if not exists idx_restaurant_subscriptions_status
  on public.restaurant_subscriptions(status);
create index if not exists idx_restaurant_subscriptions_next_due_at
  on public.restaurant_subscriptions(next_due_at);
create index if not exists idx_invoices_restaurant_id
  on public.invoices(restaurant_id);
create index if not exists idx_invoices_status
  on public.invoices(status);
create index if not exists idx_invoices_due_at
  on public.invoices(due_at);
create index if not exists idx_payments_restaurant_id
  on public.payments(restaurant_id);
create index if not exists idx_payments_paid_at
  on public.payments(paid_at);

alter table public.restaurants enable row level security;
alter table public.users enable row level security;
alter table public.categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.password_change_otps enable row level security;
alter table public.subscription_plans enable row level security;
alter table public.restaurant_subscriptions enable row level security;
alter table public.invoices enable row level security;
alter table public.payments enable row level security;

create policy "public can read active restaurants"
on public.restaurants for select
using (is_active = true);

create policy "public can read categories for active restaurants"
on public.categories for select
using (
  exists (
    select 1 from public.restaurants r
    where r.id = categories.restaurant_id and r.is_active = true
  )
);

create policy "public can read available menu items"
on public.menu_items for select
using (
  is_available = true
  and exists (
    select 1 from public.restaurants r
    where r.id = menu_items.restaurant_id and r.is_active = true
  )
);

create policy "user can read own profile"
on public.users for select
to authenticated
using (auth.uid() = id);

create policy "restaurant admin manage own categories"
on public.categories for all
to authenticated
using (
  exists (
    select 1 from public.users u
    where u.id = auth.uid()
      and u.role = 'restaurant_admin'
      and u.restaurant_id = categories.restaurant_id
  )
)
with check (
  exists (
    select 1 from public.users u
    where u.id = auth.uid()
      and u.role = 'restaurant_admin'
      and u.restaurant_id = categories.restaurant_id
  )
);

create policy "restaurant admin manage own menu items"
on public.menu_items for all
to authenticated
using (
  exists (
    select 1 from public.users u
    where u.id = auth.uid()
      and u.role = 'restaurant_admin'
      and u.restaurant_id = menu_items.restaurant_id
  )
)
with check (
  exists (
    select 1 from public.users u
    where u.id = auth.uid()
      and u.role = 'restaurant_admin'
      and u.restaurant_id = menu_items.restaurant_id
  )
);

create policy "restaurant admin update own restaurant"
on public.restaurants for update
to authenticated
using (
  exists (
    select 1 from public.users u
    where u.id = auth.uid()
      and u.role = 'restaurant_admin'
      and u.restaurant_id = restaurants.id
  )
)
with check (
  exists (
    select 1 from public.users u
    where u.id = auth.uid()
      and u.role = 'restaurant_admin'
      and u.restaurant_id = restaurants.id
  )
);

create policy "super admin full restaurants access"
on public.restaurants for all
to authenticated
using (
  exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.role = 'superadmin'
  )
)
with check (
  exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.role = 'superadmin'
  )
);

create policy "users can manage own password otps"
on public.password_change_otps for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "super admin full plans access"
on public.subscription_plans for all
to authenticated
using (
  exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.role = 'superadmin'
  )
)
with check (
  exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.role = 'superadmin'
  )
);

create policy "super admin full subscriptions access"
on public.restaurant_subscriptions for all
to authenticated
using (
  exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.role = 'superadmin'
  )
)
with check (
  exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.role = 'superadmin'
  )
);

create policy "super admin full invoices access"
on public.invoices for all
to authenticated
using (
  exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.role = 'superadmin'
  )
)
with check (
  exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.role = 'superadmin'
  )
);

create policy "super admin full payments access"
on public.payments for all
to authenticated
using (
  exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.role = 'superadmin'
  )
)
with check (
  exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.role = 'superadmin'
  )
);

create policy "restaurant admin read own subscriptions"
on public.restaurant_subscriptions for select
to authenticated
using (
  exists (
    select 1 from public.users u
    where u.id = auth.uid()
      and u.role = 'restaurant_admin'
      and u.restaurant_id = restaurant_subscriptions.restaurant_id
  )
);

create policy "restaurant admin read own invoices"
on public.invoices for select
to authenticated
using (
  exists (
    select 1 from public.users u
    where u.id = auth.uid()
      and u.role = 'restaurant_admin'
      and u.restaurant_id = invoices.restaurant_id
  )
);

create policy "restaurant admin read own payments"
on public.payments for select
to authenticated
using (
  exists (
    select 1 from public.users u
    where u.id = auth.uid()
      and u.role = 'restaurant_admin'
      and u.restaurant_id = payments.restaurant_id
  )
);

insert into storage.buckets (id, name, public)
values ('menu-items', 'menu-items', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('restaurant-logos', 'restaurant-logos', true)
on conflict (id) do nothing;
