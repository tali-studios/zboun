-- Emergency cleanup script for delivery tiers
-- Run this if you're getting "conflicting key value violates exclusion constraint" errors
-- This will delete ALL delivery tiers for a specific restaurant

-- Replace 'YOUR_RESTAURANT_ID_HERE' with the actual restaurant ID
-- You can find your restaurant ID in the app_users or restaurants table

-- Delete all regular delivery tiers for this restaurant
delete from public.restaurant_delivery_tiers
where restaurant_id = 'YOUR_RESTAURANT_ID_HERE';

-- Delete all fast delivery tiers for this restaurant  
delete from public.restaurant_fast_delivery_tiers
where restaurant_id = 'YOUR_RESTAURANT_ID_HERE';

-- Verify cleanup
select 'Regular tiers remaining:' as status, count(*) as count
from public.restaurant_delivery_tiers
where restaurant_id = 'YOUR_RESTAURANT_ID_HERE'
union all
select 'Fast tiers remaining:' as status, count(*) as count
from public.restaurant_fast_delivery_tiers
where restaurant_id = 'YOUR_RESTAURANT_ID_HERE';
