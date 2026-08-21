-- Add optional store logo flag for home hero slides.
-- Run in Supabase if home_hero_slides already exists without this column.

alter table public.home_hero_slides
  add column if not exists use_store_logo boolean not null default false;
