-- Run once if subscription_reminder_log already exists (extends reminder kinds).

alter table public.subscription_reminder_log
  drop constraint if exists subscription_reminder_log_reminder_kind_check;

alter table public.subscription_reminder_log
  add constraint subscription_reminder_log_reminder_kind_check
  check (reminder_kind in ('ten_day_expiry', 'three_day_expiry', 'expired_deactivated'));
