# Zboun testing guide

## Automated smoke test (start here)

```bash
# Terminal 1 — local app
npm run dev

# Terminal 2 — run smoke tests against localhost
npm run test:smoke

# Or test production
npm run test:smoke -- --base-url https://zboun.vercel.app
```

Optional in `.env.local`:

```env
TEST_RESTAURANT_SLUG=your-restaurant-slug
TEST_BASE_URL=http://localhost:3000
```

The script checks:

- Public pages (home, contact, for-restaurants, login, menu slug)
- SEO routes (robots, sitemap, manifest)
- Protected dashboard URLs redirect when logged out
- Subscription cron API (401 without secret, 200 with `CRON_SECRET`)
- Supabase tables readable (service role)

---

## Manual checklist — marketing & public

| # | Test | Expected |
|---|------|----------|
| 1 | Open `/` | Home loads, restaurant cards (if any active + show on home) |
| 2 | Search/filter on home | Filters work |
| 3 | Open `/for-restaurants` | Pricing ($20/mo) visible |
| 4 | Open `/contact` | Email tab → mailto zbounlb@outlook.com; WhatsApp tab → opens chat |
| 4b | `/dashboard/billing` | Email + WhatsApp contact buttons visible |
| 5 | Open `/{slug}` active restaurant | Menu, categories, add to cart |
| 6 | Open `/{slug}` inactive restaurant | 404 |
| 7 | WhatsApp order button | Pre-filled message with items |
| 8 | Rate restaurant (if shown) | Rating saves |

---

## Manual checklist — auth & roles

| # | Test | Expected |
|---|------|----------|
| 9 | `/dashboard/login` wrong password | Invalid credentials |
| 10 | Super admin login | Redirect to `/dashboard/super-admin` |
| 11 | Restaurant admin login | Redirect to `/dashboard/business` |
| 12 | Deactivated restaurant admin login | Can sign in but dashboard → `account_deactivated` |
| 13 | Change password (`/dashboard/change-password`) | OTP email + update works |

---

## Manual checklist — restaurant admin

| # | Test | Expected |
|---|------|----------|
| 14 | **Billing** (`/dashboard/billing`) | Status, next due, invoices list |
| 15 | Add category | Appears on menu |
| 16 | Add menu item (required fields) | Saves, toast success |
| 17 | Edit / delete item | Updates DB |
| 18 | Toggle item stock | Unavailable on public menu |
| 19 | Restaurant settings (name, phone, logo) | Saves |
| 20 | QR page | QR generates |
| 21 | Flyer page | A4 preview, print |
| 22 | Copy menu link | Correct URL |

### Add-ons (enable each in super admin first)

| Addon | Path | Quick test |
|-------|------|------------|
| Inventory | `/dashboard/business/inventory` | Add item, movement |
| POS | `/dashboard/business/pos` | Create order |
| CRM | `/dashboard/business/crm` | Add customer |
| Loyalty | `/dashboard/business/loyalty` | Add member |
| Events | `/dashboard/business/events` | Create booking |
| PMS | `/dashboard/business/pms` | Room + reservation |
| E-commerce | `/dashboard/business/ecommerce` | Store settings |
| Fleet | `/dashboard/business/fleet` | Vehicle + driver |
| Club | `/dashboard/business/club` | Member + plan |
| Gym | `/dashboard/business/gym` | Trainer / package |
| Cloud kitchen | `/dashboard/business/cloud-kitchen` | Dashboard loads |
| Accounting | `/dashboard/business/accounting` | Expense entry |
| Retail | `/dashboard/business/retail` | Summary loads |

---

## Manual checklist — super admin

| # | Test | Expected |
|---|------|----------|
| 23 | Create restaurant | Auth user + subscription + welcome email |
| 24 | Businesses table | Sub status, next due, colored columns |
| 25 | Renew subscription | Extended due date, renewal email + PDF |
| 26 | Deactivate business | Inactive, email, off home + menu 404 |
| 27 | Toggle home visibility | Show/hide on `/` |
| 28 | Finance — create invoice | Row in invoices |
| 29 | Finance — record cash payment | Invoice paid / partial |
| 30 | Enable/disable addon | Restaurant sees module link |
| 31 | Delete restaurant | Removed (careful in prod) |

---

## Manual checklist — subscriptions & cron

| # | Test | Expected |
|---|------|----------|
| 32 | Cron without secret | `401` |
| 33 | Cron with `CRON_SECRET` | `{ ok: true, tenDay, threeDay, expirations }` |
| 34 | 10 days before due | Email to admin + zbounlb@outlook.com |
| 35 | 3 days before due | Email to admin + ops |
| 36 | After `next_due_at` | Auto deactivate, deactivation email |
| 37 | Renew after expiry | Active again, menu live |

Test cron locally:

```powershell
curl.exe "http://localhost:3000/api/cron/subscription-reminders?secret=YOUR_CRON_SECRET"
```

---

## SQL migrations (run once in Supabase if not done)

- `supabase/schema.sql` (base)
- `supabase/add-subscription-billing.sql`
- `supabase/add-subscription-reminder-kinds.sql` (if log table exists)
- `supabase/backfill-restaurant-subscriptions.sql` (existing businesses)
- Addon files: `add-inventory.sql`, `add-pos.sql`, etc. as needed

---

## Environment checklist (production)

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `NEXT_PUBLIC_APP_URL`
- [ ] `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- [ ] `CRON_SECRET` (same on Vercel)
- [ ] `ZBOUN_OPS_EMAIL=zbounlb@outlook.com`
- [ ] Vercel cron enabled (`vercel.json` — once daily; Hobby cannot use hourly)
