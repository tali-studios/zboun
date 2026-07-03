-- Low-stock email alert thresholds per menu item (warning > urgent > critical).

alter table public.menu_items
  add column if not exists stock_alert_warning_qty int
  check (stock_alert_warning_qty is null or stock_alert_warning_qty >= 1);

alter table public.menu_items
  add column if not exists stock_alert_urgent_qty int
  check (stock_alert_urgent_qty is null or stock_alert_urgent_qty >= 1);

alter table public.menu_items
  add column if not exists stock_alert_critical_qty int
  check (stock_alert_critical_qty is null or stock_alert_critical_qty >= 1);

alter table public.menu_items
  add column if not exists stock_alert_warning_sent_at timestamptz;

alter table public.menu_items
  add column if not exists stock_alert_urgent_sent_at timestamptz;

alter table public.menu_items
  add column if not exists stock_alert_critical_sent_at timestamptz;

alter table public.menu_items
  add column if not exists stock_alert_out_sent_at timestamptz;
