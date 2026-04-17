create extension if not exists "pgcrypto";

create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  phone text not null,
  logo_url text,
  is_active boolean not null default true,
  show_on_home boolean not null default true,
  created_at timestamptz not null default now()
);

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
  image_url text,
  is_available boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.menu_items add column if not exists image_url text;
alter table public.menu_items add column if not exists contents text;
alter table public.menu_items add column if not exists grams int check (grams >= 0);

create table if not exists public.password_change_otps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  otp_hash text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.restaurants enable row level security;
alter table public.users enable row level security;
alter table public.categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.password_change_otps enable row level security;

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

insert into storage.buckets (id, name, public)
values ('menu-items', 'menu-items', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('restaurant-logos', 'restaurant-logos', true)
on conflict (id) do nothing;
