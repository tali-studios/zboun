-- Run once in Supabase SQL editor.

-- Default monthly plan (matches ZBOUN_PRICING.monthly in app)
insert into public.subscription_plans (name, interval, price, is_active)
values ('Monthly', 'monthly', 20.00, true)
on conflict (name) do nothing;

-- Avoid duplicate reminder emails for the same billing period
create table if not exists public.subscription_reminder_log (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.restaurant_subscriptions(id) on delete cascade,
  reminder_kind text not null default 'ten_day_expiry' check (
    reminder_kind in ('ten_day_expiry', 'three_day_expiry', 'expired_deactivated')
  ),
  due_at date not null,
  sent_at timestamptz not null default now(),
  unique (subscription_id, reminder_kind, due_at)
);

create index if not exists idx_subscription_reminder_log_subscription_id
  on public.subscription_reminder_log(subscription_id);

alter table public.subscription_reminder_log enable row level security;
