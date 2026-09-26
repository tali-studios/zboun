-- New stores: allow WhatsApp / guest checkout by default.
-- Existing stores keep their current setting.

alter table public.restaurants
  alter column allow_guest_checkout set default true;
