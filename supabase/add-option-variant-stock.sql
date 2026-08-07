-- Per-variant stock map for menu item options (Size×Color, grind, etc.)
-- Keys are value names joined with "||" in group order, e.g. "M||Red" or single "M".

alter table public.menu_items
  add column if not exists option_variant_stock jsonb not null default '{}'::jsonb;

comment on column public.menu_items.option_variant_stock is
  'Map of variant key → quantity. Empty {} means use item-level stock_quantity only.';
