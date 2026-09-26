-- Let each store allow WhatsApp checkout without a Zboun customer account.
-- Default ON for new stores (stores can turn it off in settings).

alter table public.restaurants
  add column if not exists allow_guest_checkout boolean not null default true;

alter table public.restaurants
  alter column allow_guest_checkout set default true;
