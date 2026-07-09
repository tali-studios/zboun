-- Customer account phone (for store WhatsApp follow-up on orders)
alter table public.customer_profiles
  add column if not exists phone text,
  add column if not exists country_code text not null default '+961';

-- Backfill country code for any existing rows
update public.customer_profiles
set country_code = '+961'
where country_code is null or trim(country_code) = '';
