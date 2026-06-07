-- Fast delivery option: restaurant toggle + fee, order speed choice

alter table public.restaurants
  add column if not exists fast_delivery_enabled boolean not null default false,
  add column if not exists fast_delivery_fee_usd numeric(10,2) not null default 0;

alter table public.orders
  add column if not exists delivery_speed text not null default 'standard'
    check (delivery_speed in ('standard', 'fast'));
