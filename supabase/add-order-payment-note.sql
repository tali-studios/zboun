-- Cash payment / change instructions on orders

alter table public.orders
  add column if not exists payment_note text;
