-- Reusable product brands per restaurant (name + logo for grocery / retail menus).
create table if not exists public.menu_brands (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  logo_url text,
  position int not null default 0,
  created_at timestamptz not null default now(),
  unique (restaurant_id, name)
);

create index if not exists idx_menu_brands_restaurant_id
  on public.menu_brands (restaurant_id);

alter table public.menu_items
  add column if not exists brand_id uuid references public.menu_brands(id) on delete set null;

create index if not exists idx_menu_items_brand_id
  on public.menu_items (brand_id);

alter table public.menu_brands enable row level security;

create policy "public can read brands for active restaurants"
on public.menu_brands for select
using (
  exists (
    select 1 from public.restaurants r
    where r.id = menu_brands.restaurant_id and r.is_active = true
  )
);

create policy "restaurant admin manage own menu brands"
on public.menu_brands for all
to authenticated
using (
  exists (
    select 1 from public.users u
    where u.id = auth.uid()
      and u.role = 'restaurant_admin'
      and u.restaurant_id = menu_brands.restaurant_id
  )
)
with check (
  exists (
    select 1 from public.users u
    where u.id = auth.uid()
      and u.role = 'restaurant_admin'
      and u.restaurant_id = menu_brands.restaurant_id
  )
);
