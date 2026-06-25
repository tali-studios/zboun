-- One-time: subscription rows for businesses created before billing was enabled.
-- Safe to re-run (skips restaurants that already have a subscription).

insert into public.restaurant_subscriptions (
  restaurant_id,
  plan_id,
  status,
  start_at,
  next_due_at,
  ended_at,
  billing_cycle_price,
  notes
)
select
  r.id,
  (
    select id
    from public.subscription_plans
    where interval = 'monthly' and is_active = true
    order by created_at asc
    limit 1
  ),
  case
    when r.created_at + interval '1 month' < now() then 'overdue'
    when r.is_active then 'active'
    else 'overdue'
  end,
  r.created_at,
  r.created_at + interval '1 month',
  case
    when r.created_at + interval '1 month' < now() then r.created_at + interval '1 month'
    else null
  end,
  coalesce(
    (select price from public.subscription_plans where interval = 'monthly' and is_active = true limit 1),
    10.00
  ),
  'Backfilled subscription for existing business.'
from public.restaurants r
where not exists (
  select 1
  from public.restaurant_subscriptions rs
  where rs.restaurant_id = r.id
);
