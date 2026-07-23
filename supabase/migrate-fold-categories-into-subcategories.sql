-- Run once in the Supabase SQL editor.
-- Safe to re-run: only updates rows that still need normalization.
--
-- Matches current browse categories in src/lib/browse-sections.ts.
-- Does NOT remove live top-level categories (Automotive, Fashion & Apparel, etc.).
--
-- What this does:
--   1) Rename / merge retired top-level category values
--   2) Rename outdated Sports & Outdoors / Smoke sub-tags
--   3) Ensure Pharmacy / smoke sub-tags have the correct parent category

-- =============================================================================
-- 1) Retired top-level categories → current parents
-- =============================================================================

-- Flowers & Occasions → Gifts & Lifestyle
update public.restaurants
set browse_sections = browse_sections || array['Gifts & Lifestyle']::text[]
where browse_sections @> array['Flowers & Occasions']::text[]
  and not (browse_sections @> array['Gifts & Lifestyle']::text[]);

update public.restaurants
set browse_sections = (
  select array_agg(distinct entry order by entry)
  from unnest(browse_sections) as entry
  where entry <> 'Flowers & Occasions'
)
where browse_sections @> array['Flowers & Occasions']::text[];

-- Optics & Eyewear → Beauty & Pharmacy
update public.restaurants
set browse_sections = browse_sections || array['Beauty & Pharmacy']::text[]
where browse_sections @> array['Optics & Eyewear']::text[]
  and not (browse_sections @> array['Beauty & Pharmacy']::text[]);

update public.restaurants
set browse_sections = (
  select array_agg(distinct entry order by entry)
  from unnest(browse_sections) as entry
  where entry <> 'Optics & Eyewear'
)
where browse_sections @> array['Optics & Eyewear']::text[];

-- Sports & Fitness → Sports & Outdoors
update public.restaurants
set browse_sections = browse_sections || array['Sports & Outdoors']::text[]
where browse_sections @> array['Sports & Fitness']::text[]
  and not (browse_sections @> array['Sports & Outdoors']::text[]);

update public.restaurants
set browse_sections = (
  select array_agg(distinct entry order by entry)
  from unnest(browse_sections) as entry
  where entry <> 'Sports & Fitness'
)
where browse_sections @> array['Sports & Fitness']::text[];

-- Baby & Kids → Beauty & Pharmacy
update public.restaurants
set browse_sections = browse_sections || array['Beauty & Pharmacy']::text[]
where browse_sections @> array['Baby & Kids']::text[]
  and not (browse_sections @> array['Beauty & Pharmacy']::text[]);

update public.restaurants
set browse_sections = (
  select array_agg(distinct entry order by entry)
  from unnest(browse_sections) as entry
  where entry <> 'Baby & Kids'
)
where browse_sections @> array['Baby & Kids']::text[];

-- Bakeries & Sweets → Groceries
update public.restaurants
set browse_sections = browse_sections || array['Groceries']::text[]
where browse_sections @> array['Bakeries & Sweets']::text[]
  and not (browse_sections @> array['Groceries']::text[]);

update public.restaurants
set browse_sections = (
  select array_agg(distinct entry order by entry)
  from unnest(browse_sections) as entry
  where entry <> 'Bakeries & Sweets'
)
where browse_sections @> array['Bakeries & Sweets']::text[];

-- Health & Beauty / Pharmacy & Care → Beauty & Pharmacy
update public.restaurants
set browse_sections = browse_sections || array['Beauty & Pharmacy']::text[]
where browse_sections && array['Health & Beauty', 'Pharmacy & Care']::text[]
  and not (browse_sections @> array['Beauty & Pharmacy']::text[]);

update public.restaurants
set browse_sections = (
  select array_agg(distinct entry order by entry)
  from unnest(browse_sections) as entry
  where entry not in ('Health & Beauty', 'Pharmacy & Care')
)
where browse_sections && array['Health & Beauty', 'Pharmacy & Care']::text[];

-- Legacy Pharmacy sub-tag → ensure Beauty & Pharmacy parent
update public.restaurants
set browse_sections = browse_sections || array['Beauty & Pharmacy']::text[]
where browse_sections @> array['Pharmacy']::text[]
  and not (browse_sections @> array['Beauty & Pharmacy']::text[]);

-- Vape & Tobacco → Smoke & Tobacco
update public.restaurants
set browse_sections = browse_sections || array['Smoke & Tobacco']::text[]
where browse_sections @> array['Vape & Tobacco']::text[]
  and not (browse_sections @> array['Smoke & Tobacco']::text[]);

update public.restaurants
set browse_sections = (
  select array_agg(distinct entry order by entry)
  from unnest(browse_sections) as entry
  where entry <> 'Vape & Tobacco'
)
where browse_sections @> array['Vape & Tobacco']::text[];

-- General Shops → Sports & Outdoors
update public.restaurants
set browse_sections = browse_sections || array['Sports & Outdoors']::text[]
where browse_sections @> array['General Shops']::text[]
  and not (browse_sections @> array['Sports & Outdoors']::text[]);

update public.restaurants
set browse_sections = (
  select array_agg(distinct entry order by entry)
  from unnest(browse_sections) as entry
  where entry <> 'General Shops'
)
where browse_sections @> array['General Shops']::text[];

-- Gas & Fuel (temporarily hidden) → Automotive
update public.restaurants
set browse_sections = browse_sections || array['Automotive']::text[]
where browse_sections @> array['Gas & Fuel']::text[]
  and not (browse_sections @> array['Automotive']::text[]);

update public.restaurants
set browse_sections = (
  select array_agg(distinct entry order by entry)
  from unnest(browse_sections) as entry
  where entry <> 'Gas & Fuel'
)
where browse_sections @> array['Gas & Fuel']::text[];

-- Legacy short names
update public.restaurants
set browse_sections = browse_sections || array['Drinks & Beverages']::text[]
where browse_sections @> array['Drinks']::text[]
  and not (browse_sections @> array['Drinks & Beverages']::text[]);

update public.restaurants
set browse_sections = (
  select array_agg(distinct entry order by entry)
  from unnest(browse_sections) as entry
  where entry <> 'Drinks'
)
where browse_sections @> array['Drinks']::text[];

update public.restaurants
set browse_sections = browse_sections || array['Fashion & Apparel']::text[]
where browse_sections @> array['Fashion']::text[]
  and not (browse_sections @> array['Fashion & Apparel']::text[]);

update public.restaurants
set browse_sections = (
  select array_agg(distinct entry order by entry)
  from unnest(browse_sections) as entry
  where entry <> 'Fashion'
)
where browse_sections @> array['Fashion']::text[];

update public.restaurants
set browse_sections = browse_sections || array['Electronics & Tech']::text[]
where browse_sections @> array['Electronics']::text[]
  and not (browse_sections @> array['Electronics & Tech']::text[]);

update public.restaurants
set browse_sections = (
  select array_agg(distinct entry order by entry)
  from unnest(browse_sections) as entry
  where entry <> 'Electronics'
)
where browse_sections @> array['Electronics']::text[];

-- =============================================================================
-- 2) Renamed Sports & Outdoors sub-tags
-- =============================================================================

-- Bicycles & Cycling → Cycling
update public.restaurants
set browse_sections = (
  select array_agg(distinct entry order by entry)
  from (
    select case when entry = 'Bicycles & Cycling' then 'Cycling' else entry end as entry
    from unnest(browse_sections) as entry
  ) mapped
)
where browse_sections @> array['Bicycles & Cycling']::text[];

-- Gym & Training → Gym Equipment
update public.restaurants
set browse_sections = (
  select array_agg(distinct entry order by entry)
  from (
    select case when entry = 'Gym & Training' then 'Gym Equipment' else entry end as entry
    from unnest(browse_sections) as entry
  ) mapped
)
where browse_sections @> array['Gym & Training']::text[];

-- Outdoor & Camping → Camping
update public.restaurants
set browse_sections = (
  select array_agg(distinct entry order by entry)
  from (
    select case when entry = 'Outdoor & Camping' then 'Camping' else entry end as entry
    from unnest(browse_sections) as entry
  ) mapped
)
where browse_sections @> array['Outdoor & Camping']::text[];

-- Sportswear → Sports Clothing
update public.restaurants
set browse_sections = (
  select array_agg(distinct entry order by entry)
  from (
    select case when entry = 'Sportswear' then 'Sports Clothing' else entry end as entry
    from unnest(browse_sections) as entry
  ) mapped
)
where browse_sections @> array['Sportswear']::text[];

-- Ensure Sports & Outdoors parent when old sports sub-tags are present
update public.restaurants
set browse_sections = browse_sections || array['Sports & Outdoors']::text[]
where browse_sections && array[
  'Cycling', 'Gym Equipment', 'Camping', 'Sports Clothing',
  'Team Sports', 'Water Sports', 'Pool & Beach', 'Sports Footwear',
  'Hiking', 'Accessories', 'Fitness Nutrition'
]::text[]
  and not (browse_sections @> array['Sports & Outdoors']::text[]);

-- Drop retired Fitness Nutrition sub-tag (no longer in the UI)
update public.restaurants
set browse_sections = (
  select array_agg(distinct entry order by entry)
  from unnest(browse_sections) as entry
  where entry <> 'Fitness Nutrition'
)
where browse_sections @> array['Fitness Nutrition']::text[];

-- =============================================================================
-- 3) Smoke Accessories rename
--    (Accessories is now a Sports & Outdoors tag — smoke shops need Smoke Accessories)
-- =============================================================================

-- If store is smoke-related and still has plain Accessories → rename to Smoke Accessories
update public.restaurants
set browse_sections = (
  select array_agg(distinct entry order by entry)
  from (
    select case when entry = 'Accessories' then 'Smoke Accessories' else entry end as entry
    from unnest(browse_sections) as entry
  ) mapped
)
where browse_sections @> array['Accessories']::text[]
  and browse_sections && array['Smoke & Tobacco', 'Vape & Tobacco', 'Devices', 'E-liquid & Pods', 'Tobacco']::text[];

-- Ensure Smoke & Tobacco parent for smoke sub-tags
update public.restaurants
set browse_sections = browse_sections || array['Smoke & Tobacco']::text[]
where browse_sections && array['Devices', 'E-liquid & Pods', 'Smoke Accessories', 'Tobacco']::text[]
  and not (browse_sections @> array['Smoke & Tobacco']::text[]);

-- =============================================================================
-- Review
-- =============================================================================
-- select name, slug, browse_sections from public.restaurants order by name;
