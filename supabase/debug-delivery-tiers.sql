-- Debug script to check delivery tiers and RLS permissions
-- Replace 'YOUR_RESTAURANT_ID_HERE' with your actual restaurant ID

-- 1. Check existing regular delivery tiers
select 'Regular tiers' as tier_type, *
from public.restaurant_delivery_tiers
where restaurant_id = 'YOUR_RESTAURANT_ID_HERE'
order by min_distance_km;

-- 2. Check existing fast delivery tiers
select 'Fast tiers' as tier_type, *
from public.restaurant_fast_delivery_tiers
where restaurant_id = 'YOUR_RESTAURANT_ID_HERE'
order by min_distance_km;

-- 3. Check for overlapping regular tiers (these will cause constraint violations)
select 
  t1.id as tier1_id,
  t1.min_distance_km || '-' || t1.max_distance_km as tier1_range,
  t2.id as tier2_id,
  t2.min_distance_km || '-' || t2.max_distance_km as tier2_range,
  'OVERLAP DETECTED!' as issue
from public.restaurant_delivery_tiers t1
join public.restaurant_delivery_tiers t2 
  on t1.restaurant_id = t2.restaurant_id 
  and t1.id < t2.id
  and numrange(t1.min_distance_km::numeric, t1.max_distance_km::numeric, '[]') && 
      numrange(t2.min_distance_km::numeric, t2.max_distance_km::numeric, '[]')
where t1.restaurant_id = 'YOUR_RESTAURANT_ID_HERE';

-- 4. Check your user permissions
select 
  u.id,
  u.role,
  u.restaurant_id,
  u.email,
  case 
    when u.role = 'restaurant_admin' and u.restaurant_id = 'YOUR_RESTAURANT_ID_HERE' 
    then 'HAS PERMISSION' 
    else 'NO PERMISSION' 
  end as permission_status
from public.users u
where u.id = auth.uid();

-- 5. Check RLS policies
select 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where tablename in ('restaurant_delivery_tiers', 'restaurant_fast_delivery_tiers')
order by tablename, policyname;
