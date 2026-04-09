# Zboun

Multi-tenant restaurant ordering platform that converts menu browsing into structured WhatsApp orders.

## Stack

- Next.js App Router + TypeScript
- Supabase (Postgres + Auth + RLS)
- Tailwind CSS
- Vercel deployment target

## MVP Included

- Marketing pages: `/` and `/contact`
- Tenant menu pages: `/{restaurant-slug}`
- Cart + WhatsApp order message generation
- Dashboard login with role routing
- Restaurant admin dashboard:
  - store settings
  - categories
  - menu items
- Super admin dashboard:
  - create restaurant
  - auto-unique slug generation
  - activate/deactivate restaurants

## Setup

1. Copy `.env.example` to `.env.local`.
2. Fill Supabase project values.
3. Run database schema in Supabase SQL editor:

```sql
-- execute file:
-- supabase/schema.sql
```

4. Install dependencies and run:

```bash
npm install
npm run dev
```

## Supabase Notes

- The app expects `public.users.id` to match `auth.users.id`.
- Create auth users in Supabase Auth, then insert corresponding rows in `public.users`.
- Roles supported:
  - `superadmin`
  - `restaurant_admin`
