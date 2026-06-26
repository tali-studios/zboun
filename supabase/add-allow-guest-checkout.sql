-- Let each store allow WhatsApp checkout without a Zboun customer account.

alter table public.restaurants
  add column if not exists allow_guest_checkout boolean not null default false;
