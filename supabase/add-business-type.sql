-- Business type support for tenant-specific dashboard behavior

alter table public.restaurants
  add column if not exists business_type text not null default 'restaurant';

update public.restaurants
set business_type = 'restaurant'
where business_type is null or trim(business_type) = '';
