-- Case-insensitive unique section names per store (blocks "Dairy" + "dairy").
-- If this fails, remove duplicate category names first, then re-run.
create unique index if not exists idx_categories_restaurant_name_lower
  on public.categories (restaurant_id, lower(name));
