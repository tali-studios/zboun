-- Run this once in Supabase SQL editor for existing projects.

alter table public.menu_items add column if not exists contents text;
alter table public.menu_items add column if not exists grams int;
alter table public.menu_items add column if not exists image_url text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'menu_items_grams_check'
  ) then
    alter table public.menu_items
      add constraint menu_items_grams_check check (grams is null or grams >= 0);
  end if;
end $$;

create table if not exists public.password_change_otps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  otp_hash text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.password_change_otps enable row level security;

drop policy if exists "users can manage own password otps" on public.password_change_otps;
create policy "users can manage own password otps"
on public.password_change_otps for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('menu-items', 'menu-items', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('restaurant-logos', 'restaurant-logos', true)
on conflict (id) do nothing;
