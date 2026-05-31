-- Opening hours, emergency close, and scheduled delivery on orders

alter table public.restaurants
  add column if not exists opening_hours jsonb not null default '[
    {"day":0,"open":"10:00","close":"22:00","closed":false},
    {"day":1,"open":"09:00","close":"22:00","closed":false},
    {"day":2,"open":"09:00","close":"22:00","closed":false},
    {"day":3,"open":"09:00","close":"22:00","closed":false},
    {"day":4,"open":"09:00","close":"22:00","closed":false},
    {"day":5,"open":"09:00","close":"22:00","closed":false},
    {"day":6,"open":"09:00","close":"22:00","closed":false}
  ]'::jsonb,
  add column if not exists is_temporarily_closed boolean not null default false;

alter table public.orders
  add column if not exists scheduled_for timestamptz;
