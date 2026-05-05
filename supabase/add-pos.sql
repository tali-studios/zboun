-- Cloud POS MVP

create table if not exists public.pos_sessions (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  opened_by uuid references public.users(id) on delete set null,
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  status text not null default 'open' check (status in ('open', 'closed')),
  opening_float numeric(10, 2) not null default 0 check (opening_float >= 0),
  closing_note text,
  created_at timestamptz not null default now()
);

create table if not exists public.pos_orders (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  session_id uuid references public.pos_sessions(id) on delete set null,
  receipt_number text,
  order_type text not null default 'dine_in' check (order_type in ('dine_in', 'takeaway', 'delivery')),
  status text not null default 'open' check (status in ('open', 'paid', 'void')),
  subtotal numeric(10, 2) not null default 0 check (subtotal >= 0),
  tax_amount numeric(10, 2) not null default 0 check (tax_amount >= 0),
  total_amount numeric(10, 2) not null default 0 check (total_amount >= 0),
  paid_amount numeric(10, 2) not null default 0 check (paid_amount >= 0),
  note text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pos_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.pos_orders(id) on delete cascade,
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  menu_item_id uuid references public.menu_items(id) on delete set null,
  item_name text not null,
  qty numeric(10, 3) not null check (qty > 0),
  unit_price numeric(10, 2) not null check (unit_price >= 0),
  line_total numeric(10, 2) not null check (line_total >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.pos_payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.pos_orders(id) on delete cascade,
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  method text not null default 'cash' check (method in ('cash', 'card', 'transfer')),
  amount numeric(10, 2) not null check (amount > 0),
  paid_at timestamptz not null default now(),
  reference text,
  recorded_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create unique index if not exists idx_pos_orders_receipt_unique
  on public.pos_orders (restaurant_id, receipt_number)
  where receipt_number is not null;
create index if not exists idx_pos_orders_restaurant_created
  on public.pos_orders (restaurant_id, created_at desc);
create index if not exists idx_pos_order_items_order_id
  on public.pos_order_items (order_id);
create index if not exists idx_pos_payments_order_id
  on public.pos_payments (order_id);

alter table public.pos_sessions enable row level security;
alter table public.pos_orders enable row level security;
alter table public.pos_order_items enable row level security;
alter table public.pos_payments enable row level security;

create policy "super admin full pos_sessions access"
on public.pos_sessions for all
to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'));

create policy "restaurant admin manage own pos_sessions"
on public.pos_sessions for all
to authenticated
using (
  exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = pos_sessions.restaurant_id
  )
)
with check (
  exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = pos_sessions.restaurant_id
  )
);

create policy "super admin full pos_orders access"
on public.pos_orders for all
to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'));

create policy "restaurant admin manage own pos_orders"
on public.pos_orders for all
to authenticated
using (
  exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = pos_orders.restaurant_id
  )
)
with check (
  exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = pos_orders.restaurant_id
  )
);

create policy "super admin full pos_order_items access"
on public.pos_order_items for all
to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'));

create policy "restaurant admin manage own pos_order_items"
on public.pos_order_items for all
to authenticated
using (
  exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = pos_order_items.restaurant_id
  )
)
with check (
  exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = pos_order_items.restaurant_id
  )
);

create policy "super admin full pos_payments access"
on public.pos_payments for all
to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'superadmin'));

create policy "restaurant admin manage own pos_payments"
on public.pos_payments for all
to authenticated
using (
  exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = pos_payments.restaurant_id
  )
)
with check (
  exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.role = 'restaurant_admin' and u.restaurant_id = pos_payments.restaurant_id
  )
);
