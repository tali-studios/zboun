-- Optional size label on menu items (weight or volume).
alter table public.menu_items add column if not exists display_quantity numeric(10, 3);
alter table public.menu_items add column if not exists display_unit text not null default 'g';

alter table public.menu_items drop constraint if exists menu_items_display_unit_check;
alter table public.menu_items
  add constraint menu_items_display_unit_check
  check (display_unit in ('g', 'kg', 'ml', 'l'));

update public.menu_items
set
  display_quantity = grams,
  display_unit = 'g'
where grams is not null
  and display_quantity is null;
