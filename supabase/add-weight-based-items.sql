-- Weight-based grocery items
-- Allows prices like $/kg with user-chosen weight (e.g. 0.75kg, 1.2kg).

alter table public.menu_items
  add column if not exists sold_by_weight boolean not null default false,
  add column if not exists price_per_kg numeric(10,2),
  add column if not exists weight_step_kg numeric(6,3) not null default 0.1;

-- Optional: ensure step is sensible (>= 0.01kg)
alter table public.menu_items
  drop constraint if exists menu_items_weight_step_min;
alter table public.menu_items
  add constraint menu_items_weight_step_min check (weight_step_kg >= 0.01);

-- Optional: if sold_by_weight is true then price_per_kg must be set
alter table public.menu_items
  drop constraint if exists menu_items_weight_price_required;
alter table public.menu_items
  add constraint menu_items_weight_price_required check (
    (sold_by_weight = false) or (price_per_kg is not null and price_per_kg >= 0)
  );

