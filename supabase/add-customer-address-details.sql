-- Extra address detail fields (voice directions, photos, country code)

alter table public.customer_addresses
  add column if not exists country_code text not null default '+961',
  add column if not exists voice_directions_url text,
  add column if not exists address_photo_urls text[] not null default '{}';

insert into storage.buckets (id, name, public)
values ('customer-address-media', 'customer-address-media', true)
on conflict (id) do nothing;
