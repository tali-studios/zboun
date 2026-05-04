-- Accounting & Payroll module (paid add-on)

create table if not exists public.restaurant_employees (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  full_name text not null,
  role_title text not null,
  base_salary numeric(10, 2) not null default 0 check (base_salary >= 0),
  salary_type text not null default 'monthly' check (salary_type in ('monthly', 'hourly')),
  hire_date date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payroll_runs (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  status text not null default 'draft' check (status in ('draft', 'approved', 'paid')),
  notes text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payroll_entries (
  id uuid primary key default gen_random_uuid(),
  payroll_run_id uuid not null references public.payroll_runs(id) on delete cascade,
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  employee_id uuid not null references public.restaurant_employees(id) on delete cascade,
  base_amount numeric(10, 2) not null default 0 check (base_amount >= 0),
  overtime_amount numeric(10, 2) not null default 0 check (overtime_amount >= 0),
  bonus_amount numeric(10, 2) not null default 0 check (bonus_amount >= 0),
  deduction_amount numeric(10, 2) not null default 0 check (deduction_amount >= 0),
  net_amount numeric(10, 2) not null default 0 check (net_amount >= 0),
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.accounting_expenses (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  category text not null,
  amount numeric(10, 2) not null check (amount > 0),
  occurred_at timestamptz not null default now(),
  vendor text,
  reference text,
  notes text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_restaurant_employees_restaurant_id on public.restaurant_employees(restaurant_id);
create index if not exists idx_payroll_runs_restaurant_id on public.payroll_runs(restaurant_id);
create index if not exists idx_payroll_entries_restaurant_id on public.payroll_entries(restaurant_id);
create index if not exists idx_accounting_expenses_restaurant_id on public.accounting_expenses(restaurant_id);
create index if not exists idx_accounting_expenses_occurred_at on public.accounting_expenses(occurred_at desc);

alter table public.restaurant_employees enable row level security;
alter table public.payroll_runs enable row level security;
alter table public.payroll_entries enable row level security;
alter table public.accounting_expenses enable row level security;

create policy "super admin full restaurant_employees access"
on public.restaurant_employees for all
to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'));

create policy "restaurant admin manage own restaurant_employees"
on public.restaurant_employees for all
to authenticated
using (
  exists (
    select 1 from public.users u
    where u.id = auth.uid()
      and u.role = 'restaurant_admin'
      and u.restaurant_id = restaurant_employees.restaurant_id
  )
)
with check (
  exists (
    select 1 from public.users u
    where u.id = auth.uid()
      and u.role = 'restaurant_admin'
      and u.restaurant_id = restaurant_employees.restaurant_id
  )
);

create policy "super admin full payroll_runs access"
on public.payroll_runs for all
to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'));

create policy "restaurant admin manage own payroll_runs"
on public.payroll_runs for all
to authenticated
using (
  exists (
    select 1 from public.users u
    where u.id = auth.uid()
      and u.role = 'restaurant_admin'
      and u.restaurant_id = payroll_runs.restaurant_id
  )
)
with check (
  exists (
    select 1 from public.users u
    where u.id = auth.uid()
      and u.role = 'restaurant_admin'
      and u.restaurant_id = payroll_runs.restaurant_id
  )
);

create policy "super admin full payroll_entries access"
on public.payroll_entries for all
to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'));

create policy "restaurant admin manage own payroll_entries"
on public.payroll_entries for all
to authenticated
using (
  exists (
    select 1 from public.users u
    where u.id = auth.uid()
      and u.role = 'restaurant_admin'
      and u.restaurant_id = payroll_entries.restaurant_id
  )
)
with check (
  exists (
    select 1 from public.users u
    where u.id = auth.uid()
      and u.role = 'restaurant_admin'
      and u.restaurant_id = payroll_entries.restaurant_id
  )
);

create policy "super admin full accounting_expenses access"
on public.accounting_expenses for all
to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'));

create policy "restaurant admin manage own accounting_expenses"
on public.accounting_expenses for all
to authenticated
using (
  exists (
    select 1 from public.users u
    where u.id = auth.uid()
      and u.role = 'restaurant_admin'
      and u.restaurant_id = accounting_expenses.restaurant_id
  )
)
with check (
  exists (
    select 1 from public.users u
    where u.id = auth.uid()
      and u.role = 'restaurant_admin'
      and u.restaurant_id = accounting_expenses.restaurant_id
  )
);
