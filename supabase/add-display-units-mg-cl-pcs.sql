-- Extra size/amount units: milligrams, centiliters, pieces.
-- Safe to re-run.
alter table public.menu_items drop constraint if exists menu_items_display_unit_check;
alter table public.menu_items
  add constraint menu_items_display_unit_check
  check (display_unit in ('mg', 'g', 'kg', 'ml', 'cl', 'l', 'pcs'));
