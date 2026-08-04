-- Cleanup script for Morning Bite delivery tiers
-- Restaurant ID: d01685dd-bb48-4728-b14b-cd379b3939a5

-- Delete all regular delivery tiers
delete from public.restaurant_delivery_tiers
where restaurant_id = 'd01685dd-bb48-4728-b14b-cd379b3939a5';

-- Delete all fast delivery tiers
delete from public.restaurant_fast_delivery_tiers
where restaurant_id = 'd01685dd-bb48-4728-b14b-cd379b3939a5';

-- Verify cleanup (should return 0 for both)
select 'Regular tiers remaining' as status, count(*) as count
from public.restaurant_delivery_tiers
where restaurant_id = 'd01685dd-bb48-4728-b14b-cd379b3939a5'
union all
select 'Fast tiers remaining' as status, count(*) as count
from public.restaurant_fast_delivery_tiers
where restaurant_id = 'd01685dd-bb48-4728-b14b-cd379b3939a5';
