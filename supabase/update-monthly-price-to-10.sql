-- Run once in Supabase SQL editor after deploying the $10/month pricing change.
-- Updates catalog, active subscriptions, and open invoices still at the old price.

update public.subscription_plans
set price = 10.00
where interval = 'monthly'
  and is_active = true
  and price = 20.00;

update public.restaurant_subscriptions
set billing_cycle_price = 10.00
where billing_cycle_price = 20.00
  and status in ('active', 'paused');

update public.invoices
set amount_due = 10.00
where amount_due = 20.00
  and status = 'unpaid';
