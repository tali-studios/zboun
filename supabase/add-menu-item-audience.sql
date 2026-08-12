-- Optional shopper audience on catalog items.
-- Run in the Supabase SQL editor (safe to re-run).

alter table public.menu_items
  add column if not exists audience text;

-- Clear old kids/baby tags if you already ran an earlier version of this script.
update public.menu_items
set audience = null
where audience in ('kids', 'baby');

alter table public.menu_items
  drop constraint if exists menu_items_audience_check;

alter table public.menu_items
  add constraint menu_items_audience_check
  check (
    audience is null
    or audience in ('men', 'women', 'unisex', 'boys', 'girls')
  );
