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

## Super admin account (automated)

Do **not** commit real passwords. In `.env.local` (gitignored), set:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (app)
- `SUPABASE_SERVICE_ROLE_KEY` (Dashboard → Settings → API → **service_role** — server-only)
- `SUPERADMIN_EMAIL` — e.g. `tali-studios@outlook.com`
- `SUPERADMIN_PASSWORD` — **must be quoted** if it contains `#` or `$`, e.g. `SUPERADMIN_PASSWORD="your-password-here"`
- Optional: `SUPERADMIN_NAME`

Then run:

```bash
npm run seed:superadmin
```

This creates or updates the Auth user, sets the password, and upserts `public.users` with `role = superadmin`. Sign in at `/dashboard/login`; you are redirected to `/dashboard/super-admin`.

## Supabase Notes

- The app expects `public.users.id` to match `auth.users.id`.
- Restaurant admins: create in Auth + insert `public.users` with `restaurant_admin` and `restaurant_id`, or extend the seed pattern.
- Roles supported:
  - `superadmin`
  - `restaurant_admin`
