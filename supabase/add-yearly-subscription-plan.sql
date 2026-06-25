-- Run once in Supabase SQL editor.
-- Adds the yearly plan (matches ZBOUN_PRICING.yearly in app).

insert into public.subscription_plans (name, interval, price, is_active)
values ('Yearly', 'yearly', 100.00, true)
on conflict (name) do update
set interval = excluded.interval,
    price = excluded.price,
    is_active = excluded.is_active;
