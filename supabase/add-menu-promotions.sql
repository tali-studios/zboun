-- Percentage sales scoped to store, section (category), brand, or individual item.
create table if not exists public.menu_promotions (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  scope_type text not null check (scope_type in ('store', 'category', 'brand', 'item')),
  scope_id uuid,
  percent_off numeric(5, 2) not null check (percent_off > 0 and percent_off <= 100),
  label text,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  priority int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint menu_promotions_scope_check check (
    (scope_type = 'store' and scope_id is null)
    or (scope_type <> 'store' and scope_id is not null)
  )
);

create index if not exists idx_menu_promotions_restaurant_id
  on public.menu_promotions (restaurant_id);

create index if not exists idx_menu_promotions_scope
  on public.menu_promotions (restaurant_id, scope_type, scope_id);

alter table public.menu_promotions enable row level security;

create policy "public can read promotions for active restaurants"
on public.menu_promotions for select
using (
  exists (
    select 1 from public.restaurants r
    where r.id = menu_promotions.restaurant_id and r.is_active = true
  )
);

create policy "restaurant admin manage own menu promotions"
on public.menu_promotions for all
to authenticated
using (
  exists (
    select 1 from public.users u
    where u.id = auth.uid()
      and u.role = 'restaurant_admin'
      and u.restaurant_id = menu_promotions.restaurant_id
  )
)
with check (
  exists (
    select 1 from public.users u
    where u.id = auth.uid()
      and u.role = 'restaurant_admin'
      and u.restaurant_id = menu_promotions.restaurant_id
  )
);
