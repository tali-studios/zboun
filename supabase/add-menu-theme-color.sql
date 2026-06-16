-- Custom accent color for each restaurant's public menu page.
alter table public.restaurants
  add column if not exists menu_theme_color text;
