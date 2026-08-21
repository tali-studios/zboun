-- Home page hero carousel slides (super-admin managed).
-- Run once in Supabase SQL editor.

create table if not exists public.home_hero_slides (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text not null default '',
  link_type text not null default 'none' check (
    link_type in ('none', 'store', 'item')
  ),
  restaurant_id uuid references public.restaurants(id) on delete set null,
  menu_item_id uuid references public.menu_items(id) on delete set null,
  sort_order int not null default 0,
  is_active boolean not null default true,
  use_store_logo boolean not null default false,
  starts_at timestamptz,
  ends_at timestamptz,
  promo_fee_usd numeric(12, 2),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Safe for tables created before use_store_logo existed.
alter table public.home_hero_slides
  add column if not exists use_store_logo boolean not null default false;

create index if not exists idx_home_hero_slides_active_sort
  on public.home_hero_slides (is_active, sort_order);

create index if not exists idx_home_hero_slides_window
  on public.home_hero_slides (starts_at, ends_at);

alter table public.home_hero_slides enable row level security;

-- Seed current hardcoded home slides once (no links).
insert into public.home_hero_slides (title, subtitle, link_type, sort_order, is_active)
select *
from (
  values
    ('Support local.', 'Your favorite stores, now on WhatsApp.', 'none', 0, true),
    ('Order in one tap.', 'Clear WhatsApp orders — no app needed.', 'none', 1, true),
    (
      'FREE & FAST delivery.',
      '🎁 FREE = No delivery fee • ⚡ FAST = Express delivery available.',
      'none',
      2,
      true
    ),
    ('Discover nearby.', 'Browse menus from stores around you.', 'none', 3, true)
) as seed(title, subtitle, link_type, sort_order, is_active)
where not exists (select 1 from public.home_hero_slides limit 1);
