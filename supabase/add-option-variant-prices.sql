-- Absolute selling price per option combination (e.g. Storage×Color).
-- Keys match option_variant_stock: values joined with "||" in group order ("128GB||Black").
-- When a key is present, storefront uses that price instead of base + additive extras.

alter table public.menu_items
  add column if not exists option_variant_prices jsonb not null default '{}'::jsonb;

comment on column public.menu_items.option_variant_prices is
  'Map of variant key → absolute USD price. Empty {} means use item.price + option value extras.';
