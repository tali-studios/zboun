create table if not exists public.customer_signup_otps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  otp_hash text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_customer_signup_otps_user_created
  on public.customer_signup_otps (user_id, created_at desc);

create index if not exists idx_customer_signup_otps_expires
  on public.customer_signup_otps (expires_at);

alter table public.customer_signup_otps enable row level security;

drop policy if exists customer_signup_otps_no_direct_access on public.customer_signup_otps;
create policy customer_signup_otps_no_direct_access
  on public.customer_signup_otps
  for all
  using (false)
  with check (false);
