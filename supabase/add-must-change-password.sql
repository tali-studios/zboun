-- Add column to track if user must change password on first login
alter table public.users
  add column if not exists must_change_password boolean not null default false;

comment on column public.users.must_change_password is
  'True when user must change password on first login (e.g., super admin created account)';
