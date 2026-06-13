-- Optional product brand (useful for grocery / retail menu items).
alter table public.menu_items add column if not exists brand_name text;
