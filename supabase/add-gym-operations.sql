-- Gym Operations module (trainers, PT sessions, payouts)

create table if not exists public.gym_trainers (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  full_name text not null,
  phone text,
  email text,
  specialty text,
  employment_type text not null default 'full_time' check (employment_type in ('full_time','part_time','contract')),
  salary_type text not null default 'base' check (salary_type in ('base','per_session','hybrid')),
  base_salary numeric(10,2) not null default 0,
  session_rate numeric(10,2) not null default 0,
  is_active boolean not null default true,
  hire_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gym_pt_packages (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  session_count int not null check (session_count > 0),
  price numeric(10,2) not null check (price >= 0),
  valid_days int check (valid_days is null or valid_days > 0),
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gym_pt_sessions (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  trainer_id uuid not null references public.gym_trainers(id) on delete restrict,
  club_member_id uuid references public.club_members(id) on delete set null,
  member_name text not null,
  member_phone text,
  package_id uuid references public.gym_pt_packages(id) on delete set null,
  session_type text not null default 'pt' check (session_type in ('pt','assessment','group')),
  status text not null default 'scheduled' check (status in ('scheduled','completed','cancelled','no_show')),
  scheduled_at timestamptz not null,
  duration_mins int not null default 60 check (duration_mins > 0),
  price numeric(10,2) not null default 0 check (price >= 0),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid','paid')),
  notes text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gym_member_packages (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  club_member_id uuid references public.club_members(id) on delete set null,
  member_name text not null,
  member_phone text,
  package_id uuid not null references public.gym_pt_packages(id) on delete restrict,
  purchased_sessions int not null check (purchased_sessions > 0),
  used_sessions int not null default 0 check (used_sessions >= 0),
  remaining_sessions int not null check (remaining_sessions >= 0),
  purchase_date date not null default current_date,
  expiry_date date,
  status text not null default 'active' check (status in ('active','expired','cancelled','completed')),
  notes text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gym_trainer_payouts (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  trainer_id uuid not null references public.gym_trainers(id) on delete restrict,
  period_start date not null,
  period_end date not null,
  base_amount numeric(10,2) not null default 0,
  session_amount numeric(10,2) not null default 0,
  bonus_amount numeric(10,2) not null default 0,
  total_amount numeric(10,2) not null default 0,
  status text not null default 'draft' check (status in ('draft','approved','paid')),
  paid_at timestamptz,
  notes text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_gym_trainers_restaurant on public.gym_trainers (restaurant_id);
create index if not exists idx_gym_sessions_restaurant on public.gym_pt_sessions (restaurant_id, scheduled_at desc);
create index if not exists idx_gym_sessions_trainer on public.gym_pt_sessions (trainer_id, scheduled_at desc);
create index if not exists idx_gym_payouts_restaurant on public.gym_trainer_payouts (restaurant_id, period_start desc);
create index if not exists idx_gym_member_packages_restaurant on public.gym_member_packages (restaurant_id, purchase_date desc);
create index if not exists idx_gym_member_packages_member on public.gym_member_packages (club_member_id);

alter table public.gym_trainers enable row level security;
alter table public.gym_pt_packages enable row level security;
alter table public.gym_pt_sessions enable row level security;
alter table public.gym_trainer_payouts enable row level security;
alter table public.gym_member_packages enable row level security;

create policy "super admin full gym_trainers"
on public.gym_trainers for all to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'));

create policy "restaurant admin own gym_trainers"
on public.gym_trainers for all to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = gym_trainers.restaurant_id))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = gym_trainers.restaurant_id));

create policy "super admin full gym_pt_packages"
on public.gym_pt_packages for all to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'));

create policy "restaurant admin own gym_pt_packages"
on public.gym_pt_packages for all to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = gym_pt_packages.restaurant_id))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = gym_pt_packages.restaurant_id));

create policy "super admin full gym_pt_sessions"
on public.gym_pt_sessions for all to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'));

create policy "restaurant admin own gym_pt_sessions"
on public.gym_pt_sessions for all to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = gym_pt_sessions.restaurant_id))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = gym_pt_sessions.restaurant_id));

create policy "super admin full gym_trainer_payouts"
on public.gym_trainer_payouts for all to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'));

create policy "restaurant admin own gym_trainer_payouts"
on public.gym_trainer_payouts for all to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = gym_trainer_payouts.restaurant_id))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = gym_trainer_payouts.restaurant_id));

create policy "super admin full gym_member_packages"
on public.gym_member_packages for all to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'));

create policy "restaurant admin own gym_member_packages"
on public.gym_member_packages for all to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = gym_member_packages.restaurant_id))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = gym_member_packages.restaurant_id));
