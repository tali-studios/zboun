-- Track per-item stock counts (optional — restaurants can ignore and use is_available only).

alter table public.menu_items
  add column if not exists track_stock boolean not null default false;

alter table public.menu_items
  add column if not exists stock_quantity int
  check (stock_quantity is null or stock_quantity >= 0);
