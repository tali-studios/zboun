-- Find Morning Bite restaurant ID
select 
  id,
  name,
  slug,
  created_at
from public.restaurants
where name ilike '%morning%bite%'
   or slug ilike '%morning%bite%';

-- Alternative: search by partial name
select 
  id,
  name,
  slug,
  created_at
from public.restaurants
where name ilike '%morning%'
order by created_at desc;
