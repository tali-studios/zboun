-- OPTIONAL — run once in Supabase SQL editor to clean up existing businesses.
-- Not required for the app to work (legacy tags like "Lunch" are handled in code).
-- Safe to re-run: only updates rows that still need normalization.

-- 1) Old food sub-tags only (e.g. array['Lunch']) → add parent "Food & Restaurants"
update public.restaurants
set browse_sections = (
  select coalesce(array_agg(distinct entry order by entry), array['Food & Restaurants', 'Lunch']::text[])
  from (
    select unnest(browse_sections) as entry
    union
    select 'Food & Restaurants'
    where browse_sections && array[
      'Breakfast', 'Lunch', 'Dinner', 'Quick Bites', 'Desserts'
    ]::text[]
  ) merged
)
where browse_sections && array[
  'Breakfast', 'Lunch', 'Dinner', 'Quick Bites', 'Desserts'
]::text[]
  and not (browse_sections @> array['Food & Restaurants']::text[]);

-- 2) Legacy "Drinks" → "Drinks & Beverages"
update public.restaurants
set browse_sections = (
  select array_agg(distinct entry order by entry)
  from (
    select case when entry = 'Drinks' then 'Drinks & Beverages' else entry end as entry
    from unnest(browse_sections) as entry
  ) mapped
)
where browse_sections @> array['Drinks']::text[]
  and not (browse_sections @> array['Drinks & Beverages']::text[]);

-- 3) Food businesses with empty/unknown categories → Food & Restaurants + Lunch
update public.restaurants
set browse_sections = array['Food & Restaurants', 'Lunch']::text[]
where business_type in ('restaurant', 'cloud_kitchen')
  and (
    browse_sections is null
    or cardinality(browse_sections) = 0
  );

-- 4) Align business_type with categories (skip hotel/gym)
update public.restaurants
set business_type = case
  when business_type in ('hotel_resort', 'fitness_club') then business_type
  when browse_sections @> array['Food & Restaurants']::text[]
    or browse_sections && array[
      'Breakfast', 'Lunch', 'Dinner', 'Quick Bites', 'Desserts'
    ]::text[]
    then 'restaurant'
  else 'retail_store'
end
where business_type not in ('hotel_resort', 'fitness_club');

-- 5) Catalog businesses should appear on home
update public.restaurants
set show_on_home = true
where business_type not in ('hotel_resort', 'fitness_club')
  and show_on_home is distinct from true;

-- Review results:
-- select name, slug, business_type, show_on_home, browse_sections from public.restaurants order by name;
