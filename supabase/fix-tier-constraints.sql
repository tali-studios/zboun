-- Fix the exclusion constraints to use '[)' instead of '[]'
-- This allows adjacent ranges like 0-5, 5-10, 10-15 without overlap
-- '[)' means: inclusive start, exclusive end

-- Drop old constraints
alter table public.restaurant_delivery_tiers 
  drop constraint if exists delivery_tiers_no_overlap;

alter table public.restaurant_fast_delivery_tiers 
  drop constraint if exists fast_delivery_tiers_no_overlap;

-- Add new constraints with '[)' (half-open intervals)
alter table public.restaurant_delivery_tiers
  add constraint delivery_tiers_no_overlap
    exclude using gist (
      restaurant_id with =,
      numrange(min_distance_km::numeric, max_distance_km::numeric, '[)') with &&
    );

alter table public.restaurant_fast_delivery_tiers
  add constraint fast_delivery_tiers_no_overlap
    exclude using gist (
      restaurant_id with =,
      numrange(min_distance_km::numeric, max_distance_km::numeric, '[)') with &&
    );

-- Verify the fix
select 
  'Constraints updated successfully' as status,
  'Adjacent ranges like 0-5, 5-10 are now allowed' as note;
