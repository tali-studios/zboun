create table if not exists public.retail_daily_closes (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  closed_by uuid references public.users(id) on delete set null,
  closed_by_name text not null default 'Admin',
  notes text,
  metrics_snapshot jsonb not null default '{}'::jsonb,
  closed_at timestamptz not null default now()
);

create index if not exists idx_retail_daily_closes_restaurant_closed_at
  on public.retail_daily_closes (restaurant_id, closed_at desc);

alter table public.retail_daily_closes enable row level security;

create policy "superadmin full retail_daily_closes access"
on public.retail_daily_closes for all to authenticated
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

create policy "restaurant admin manage own retail_daily_closes"
on public.retail_daily_closes for all to authenticated
using (
  exists (
    select 1 from public.users u
    where u.id = auth.uid()
      and u.role = 'restaurant_admin'
      and u.restaurant_id = retail_daily_closes.restaurant_id
  )
)
with check (
  exists (
    select 1 from public.users u
    where u.id = auth.uid()
      and u.role = 'restaurant_admin'
      and u.restaurant_id = retail_daily_closes.restaurant_id
  )
);
