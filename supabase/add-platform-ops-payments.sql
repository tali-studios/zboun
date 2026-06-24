-- Platform expenses / payments tracked by super admin (domain renewals, hosting, etc.)
-- Run once in Supabase SQL editor.

create table if not exists public.platform_ops_payments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'other' check (
    category in ('domain', 'hosting', 'saas', 'marketing', 'other')
  ),
  amount numeric(12, 2),
  currency text not null default 'USD',
  due_at timestamptz not null,
  paid_at timestamptz,
  notes text,
  reminder_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_platform_ops_payments_due_at
  on public.platform_ops_payments (due_at);

create index if not exists idx_platform_ops_payments_unpaid
  on public.platform_ops_payments (due_at)
  where paid_at is null;

-- Idempotent reminder log (one email per payment / kind / due date)
create table if not exists public.platform_ops_payment_reminder_log (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.platform_ops_payments(id) on delete cascade,
  reminder_kind text not null check (
    reminder_kind in ('one_month', 'one_week', 'three_days')
  ),
  due_at date not null,
  sent_at timestamptz not null default now(),
  unique (payment_id, reminder_kind, due_at)
);

create index if not exists idx_platform_ops_payment_reminder_log_payment_id
  on public.platform_ops_payment_reminder_log (payment_id);

alter table public.platform_ops_payments enable row level security;
alter table public.platform_ops_payment_reminder_log enable row level security;
