-- Lifetime complimentary accounts: no expiry deactivation, no payment reminders.
alter table public.restaurants
  add column if not exists billing_exempt boolean not null default false;
