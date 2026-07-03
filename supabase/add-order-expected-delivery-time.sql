-- Store-facing delivery ETA for menu/QR orders.
alter table public.orders
  add column if not exists expected_delivery_time text,
  add column if not exists expected_delivery_time_set_at timestamptz;
