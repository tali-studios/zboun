-- Run this in Supabase SQL editor to support Browse categories.

alter table public.restaurants
  add column if not exists browse_sections text[] not null default array['Lunch']::text[];

update public.restaurants
set browse_sections = array['Lunch']::text[]
where browse_sections is null or cardinality(browse_sections) = 0;
