-- Promo / coupon codes: percentage off the full invoice (items + delivery).
create table if not exists public.menu_coupon_codes (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  code text not null,
  percent_off numeric(5, 2) not null check (percent_off > 0 and percent_off <= 100),
  max_uses int check (max_uses is null or max_uses > 0),
  times_used int not null default 0 check (times_used >= 0),
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (restaurant_id, code)
);

create index if not exists idx_menu_coupon_codes_restaurant_id
  on public.menu_coupon_codes (restaurant_id);

create index if not exists idx_menu_coupon_codes_lookup
  on public.menu_coupon_codes (restaurant_id, code);

alter table public.menu_coupon_codes enable row level security;

-- No public read: validation happens only via server actions (service role).
create policy "restaurant admin manage own coupon codes"
on public.menu_coupon_codes for all
to authenticated
using (
  exists (
    select 1 from public.users u
    where u.id = auth.uid()
      and u.role = 'restaurant_admin'
      and u.restaurant_id = menu_coupon_codes.restaurant_id
  )
)
with check (
  exists (
    select 1 from public.users u
    where u.id = auth.uid()
      and u.role = 'restaurant_admin'
      and u.restaurant_id = menu_coupon_codes.restaurant_id
  )
);

alter table public.orders add column if not exists coupon_code text;
alter table public.orders add column if not exists coupon_discount_usd numeric(10, 2) not null default 0;
alter table public.orders add column if not exists coupon_code_id uuid references public.menu_coupon_codes(id) on delete set null;

create or replace function public.increment_menu_coupon_usage(p_coupon_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  updated int;
begin
  update public.menu_coupon_codes
  set times_used = times_used + 1, updated_at = now()
  where id = p_coupon_id
    and is_active = true
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at >= now())
    and (max_uses is null or times_used < max_uses);
  get diagnostics updated = row_count;
  return updated > 0;
end;
$$;
