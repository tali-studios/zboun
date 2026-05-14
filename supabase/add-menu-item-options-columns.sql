-- Run once in Supabase → SQL Editor if inserts fail with:
--   PGRST204 / "Could not find the 'option_label' column of 'menu_items' in the schema cache"
-- Older databases may have been created before these columns existed.
-- After running: wait ~1 min or Supabase Dashboard → Settings → API → reload PostgREST schema if needed.

alter table public.menu_items add column if not exists removable_ingredients jsonb not null default '[]'::jsonb;
alter table public.menu_items add column if not exists add_ingredients jsonb not null default '[]'::jsonb;
alter table public.menu_items add column if not exists option_label text;
alter table public.menu_items add column if not exists option_values jsonb not null default '[]'::jsonb;
