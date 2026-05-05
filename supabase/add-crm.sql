-- ─────────────────────────────────────────────────────────────────────────────
-- CRM Module
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.crm_customers (
  id             uuid           primary key default gen_random_uuid(),
  restaurant_id  uuid           not null references public.restaurants(id) on delete cascade,
  full_name      text           not null,
  phone          text,
  email          text,
  birthday       date,
  is_vip         boolean        not null default false,
  total_spend    numeric(12, 2) not null default 0 check (total_spend >= 0),
  visit_count    int            not null default 0 check (visit_count >= 0),
  first_visit_at timestamptz,
  last_visit_at  timestamptz,
  notes          text,
  created_at     timestamptz    not null default now(),
  updated_at     timestamptz    not null default now()
);

create table if not exists public.crm_customer_notes (
  id            uuid        primary key default gen_random_uuid(),
  restaurant_id uuid        not null references public.restaurants(id) on delete cascade,
  customer_id   uuid        not null references public.crm_customers(id) on delete cascade,
  content       text        not null,
  created_by    uuid        references public.users(id) on delete set null,
  created_at    timestamptz not null default now()
);

create table if not exists public.crm_tags (
  id            uuid        primary key default gen_random_uuid(),
  restaurant_id uuid        not null references public.restaurants(id) on delete cascade,
  name          text        not null,
  color         text        not null default '#6366f1',
  created_at    timestamptz not null default now(),
  unique (restaurant_id, name)
);

create table if not exists public.crm_customer_tag_assignments (
  id          uuid        primary key default gen_random_uuid(),
  customer_id uuid        not null references public.crm_customers(id) on delete cascade,
  tag_id      uuid        not null references public.crm_tags(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  unique (customer_id, tag_id)
);

-- Link POS orders to CRM customers (nullable — orders can exist without a customer profile)
alter table public.pos_orders
  add column if not exists customer_id uuid references public.crm_customers(id) on delete set null;

-- ─────────────────────────────────────────────────────────────────────────────
-- Indexes
-- ─────────────────────────────────────────────────────────────────────────────
create index if not exists idx_crm_customers_restaurant_id
  on public.crm_customers (restaurant_id);
create index if not exists idx_crm_customers_phone
  on public.crm_customers (restaurant_id, phone)
  where phone is not null;
create index if not exists idx_crm_customers_email
  on public.crm_customers (restaurant_id, email)
  where email is not null;
create index if not exists idx_crm_customers_is_vip
  on public.crm_customers (restaurant_id, is_vip);
create index if not exists idx_crm_customer_notes_customer_id
  on public.crm_customer_notes (customer_id);
create index if not exists idx_crm_tags_restaurant_id
  on public.crm_tags (restaurant_id);
create index if not exists idx_crm_customer_tag_assignments_customer_id
  on public.crm_customer_tag_assignments (customer_id);
create index if not exists idx_pos_orders_customer_id
  on public.pos_orders (customer_id)
  where customer_id is not null;

-- ─────────────────────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.crm_customers              enable row level security;
alter table public.crm_customer_notes         enable row level security;
alter table public.crm_tags                   enable row level security;
alter table public.crm_customer_tag_assignments enable row level security;

-- crm_customers ---------------------------------------------------------------
create policy "super admin full crm_customers access"
on public.crm_customers for all
to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'));

create policy "restaurant admin manage own crm_customers"
on public.crm_customers for all
to authenticated
using (
  exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = crm_customers.restaurant_id
  )
)
with check (
  exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = crm_customers.restaurant_id
  )
);

-- crm_customer_notes ----------------------------------------------------------
create policy "super admin full crm_customer_notes access"
on public.crm_customer_notes for all
to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'));

create policy "restaurant admin manage own crm_customer_notes"
on public.crm_customer_notes for all
to authenticated
using (
  exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = crm_customer_notes.restaurant_id
  )
)
with check (
  exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = crm_customer_notes.restaurant_id
  )
);

-- crm_tags --------------------------------------------------------------------
create policy "super admin full crm_tags access"
on public.crm_tags for all
to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'));

create policy "restaurant admin manage own crm_tags"
on public.crm_tags for all
to authenticated
using (
  exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = crm_tags.restaurant_id
  )
)
with check (
  exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = crm_tags.restaurant_id
  )
);

-- crm_customer_tag_assignments ------------------------------------------------
create policy "super admin full crm_customer_tag_assignments access"
on public.crm_customer_tag_assignments for all
to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'));

create policy "restaurant admin manage own crm_customer_tag_assignments"
on public.crm_customer_tag_assignments for all
to authenticated
using (
  exists (
    select 1 from public.crm_customers c
    join public.users u on u.id = auth.uid()
    where c.id = crm_customer_tag_assignments.customer_id
      and u.role = 'restaurant_admin'
      and u.restaurant_id = c.restaurant_id
  )
)
with check (
  exists (
    select 1 from public.crm_customers c
    join public.users u on u.id = auth.uid()
    where c.id = crm_customer_tag_assignments.customer_id
      and u.role = 'restaurant_admin'
      and u.restaurant_id = c.restaurant_id
  )
);
