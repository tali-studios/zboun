-- Restaurant delivery fee settings + persist fee on orders

alter table public.restaurants
  add column if not exists free_delivery boolean not null default false,
  add column if not exists delivery_fee_usd numeric(10,2) not null default 0;

alter table public.orders
  add column if not exists delivery_fee_usd numeric(10,2) not null default 0;
