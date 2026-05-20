# Zboun — QA team test guide (step-by-step)

**Product:** Zboun — digital menus, WhatsApp ordering, restaurant dashboard  
**Production URL:** https://zboun.vercel.app  
**Login:** https://zboun.vercel.app/dashboard/login  

Use this document as the **single source of truth** for manual QA. Check every box. If something fails, log a bug (template at the end).

---

## 0. Before testing

### 0.1 What you need

| Item | Who provides |
|------|----------------|
| Super admin email + password | Project owner |
| Test inbox for new restaurant admin | QA (e.g. `qa+test1@outlook.com`) |
| `CRON_SECRET` (for cron tests only) | Project owner — **do not share publicly** |
| Phone with WhatsApp (for order flow) | QA |
| Desktop browser (Chrome or Edge) | QA |
| Optional: mobile phone (iOS/Android) | QA |

### 0.2 Test record (fill in)

| Field | Value |
|-------|--------|
| Tester name | |
| Date | |
| Environment | Production / Staging / Local |
| Build URL | https://zboun.vercel.app |
| Git commit (if known) | |
| Super admin email used | |
| QA restaurant name | `QA Bistro [date]` |
| QA restaurant slug | |
| QA restaurant admin email | |
| Temp password (from welcome email) | |

### 0.3 Automated smoke (run first)

On a machine with the project repo and `.env.local`:

```powershell
cd F:\zboun
npm run test:smoke -- --base-url https://zboun.vercel.app
```

**Pass criteria:** `Passed: 44` (or current count), `Failed: 0`.

If smoke fails, **stop** and report failures before manual QA.

### 0.4 Rules

- Use **QA** prefix in all test data names (e.g. `QA Soup`) so they can be deleted later.
- On **production**, do **not** delete real customer restaurants.
- Test **deactivate/delete** only on your QA restaurant.
- Take **screenshots** for any failed step.

---

## 1. Public website & marketing

### TC-101 — Home page

| Step | Action | Expected result | Pass |
|------|--------|-----------------|------|
| 1 | Open `/` | Page loads; logo and restaurant list (if any active businesses) | ☐ |
| 2 | Use search bar (if visible) | Results filter by name | ☐ |
| 3 | Use category/filter controls (if visible) | List updates | ☐ |
| 4 | Click a restaurant card | Opens `/{slug}` order menu | ☐ |
| 5 | Scroll to “For restaurant owners” CTA | Shows **$20/month** pricing | ☐ |
| 6 | Click **Plans & pricing** | Goes to `/for-restaurants` | ☐ |
| 7 | Click **Contact us** (footer or CTA) | Goes to `/contact` | ☐ |

### TC-102 — For restaurants page

| Step | Action | Expected result | Pass |
|------|--------|-----------------|------|
| 1 | Open `/for-restaurants` | Page loads | ☐ |
| 2 | Check pricing card | **$20/mo** monthly plan; feature list visible | ☐ |
| 3 | Check optional add-on | One-time data entry **$100** mentioned | ☐ |
| 4 | Click **Get started** | Goes to `/contact` | ☐ |
| 5 | Scroll modules section | Some modules may say “Coming soon” — OK | ☐ |

### TC-103 — Contact page

| Step | Action | Expected result | Pass |
|------|--------|-----------------|------|
| 1 | Open `/contact` | Page loads | ☐ |
| 2 | Confirm **Email** tab is available | Selected by default or selectable | ☐ |
| 3 | Fill Name + Message; click **Send email** | Mail app opens; **To:** `zbounlb@outlook.com` | ☐ |
| 4 | Switch to **WhatsApp** tab | Form: Name, Phone, Message | ☐ |
| 5 | Fill all fields; submit | WhatsApp opens with pre-filled message | ☐ |

### TC-104 — SEO & static routes

| Step | Action | Expected result | Pass |
|------|--------|-----------------|------|
| 1 | Open `/robots.txt` | HTTP 200, text content | ☐ |
| 2 | Open `/sitemap.xml` | HTTP 200, contains `/`, `/contact`, menu URLs | ☐ |
| 3 | Open `/manifest.webmanifest` | HTTP 200 JSON | ☐ |

### TC-105 — Footer

| Step | Action | Expected result | Pass |
|------|--------|-----------------|------|
| 1 | On any public page, find footer **WhatsApp us** | Button visible | ☐ |
| 2 | Click it | Opens WhatsApp chat to business number | ☐ |
| 3 | Links: Browse, Join us, Contact, Restaurant login | All work | ☐ |

---

## 2. Authentication

### TC-201 — Login errors

| Step | Action | Expected result | Pass |
|------|--------|-----------------|------|
| 1 | Open `/dashboard/login` | Sign-in form | ☐ |
| 2 | Enter wrong email/password | Submit → “Invalid credentials” | ☐ |
| 3 | Leave fields empty; submit | Browser validation or error | ☐ |

### TC-202 — Super admin login

| Step | Action | Expected result | Pass |
|------|--------|-----------------|------|
| 1 | Log in with super admin credentials | Redirect to `/dashboard/super-admin` | ☐ |
| 2 | Confirm you do **not** see restaurant menu editor as main view | Super admin table visible | ☐ |
| 3 | Log out (if button exists) or use private window for next tests | Session cleared | ☐ |

### TC-203 — Change password (any logged-in user)

| Step | Action | Expected result | Pass |
|------|--------|-----------------|------|
| 1 | From restaurant or super admin dashboard, open **Change password** | `/dashboard/change-password` | ☐ |
| 2 | Request OTP | Message: OTP sent to email | ☐ |
| 3 | Check email; enter OTP + new password | Success message | ☐ |
| 4 | Log out; log in with **new** password | Login works | ☐ |

---

## 3. Super admin — create & manage business

**Login:** super admin → `/dashboard/super-admin`

### TC-301 — Create new restaurant

| Step | Action | Expected result | Pass |
|------|--------|-----------------|------|
| 1 | Find **Create business** form (top of page) | Fields: name, email, phone, business type | ☐ |
| 2 | Enter **Business name:** `QA Bistro [today's date]` | | ☐ |
| 3 | Enter **Admin email:** your test inbox | | ☐ |
| 4 | Enter **WhatsApp:** `96170123456` (or valid test number) | | ☐ |
| 5 | **Business type:** Restaurant | Home browse category radios appear | ☐ |
| 6 | Select **Home browse category:** e.g. Lunch | | ☐ |
| 7 | Click **Create business** | Page reloads; success state (no error banner) | ☐ |
| 8 | Find new row in businesses table | Name matches; **Sub status** not empty; **Next due** has a date | ☐ |
| 9 | Note **slug** from URL column or open public menu link | e.g. `qa-bistro-...` | ☐ |
| 10 | Check admin email inbox (wait 2 min) | Welcome email with dashboard link + **temporary password** | ☐ |

**Record slug and password in section 0.2.**

If email missing: continue QA using password from owner; flag bug **“welcome email not received”**.

### TC-302 — Super admin table UI

| Step | Action | Expected result | Pass |
|------|--------|-----------------|------|
| 1 | Scroll businesses table horizontally (mobile) | Data columns readable; action icons in one row | ☐ |
| 2 | Confirm columns include business name, slug, sub status, next due | Data columns use colored styling | ☐ |
| 3 | Hover action icons | Tooltips/labels: Renew, Deactivate, Home, Finance, etc. | ☐ |

### TC-303 — Enable add-on for QA restaurant

| Step | Action | Expected result | Pass |
|------|--------|-----------------|------|
| 1 | Find QA restaurant row → **Addons** (puzzle icon) | Addon panel/modal opens | ☐ |
| 2 | Enable **Inventory** | Saves; toggle shows on | ☐ |
| 3 | Enable **POS** | Saves | ☐ |
| 4 | Enable **CRM** | Saves | ☐ |
| 5 | Close addon editor | | ☐ |

Repeat for other modules in **Section 7** as needed.

### TC-304 — Finance: invoice & payment

| Step | Action | Expected result | Pass |
|------|--------|-----------------|------|
| 1 | Open **Finance** (dollar icon) for QA restaurant | Invoice form visible | ☐ |
| 2 | Create invoice: amount e.g. **20**, period dates, due date | Success; invoice listed | ☐ |
| 3 | **Record cash payment** partial or full | Payment row; invoice status updates (paid/partial) | ☐ |

### TC-305 — Home visibility

| Step | Action | Expected result | Pass |
|------|--------|-----------------|------|
| 1 | Click **Hide from home** (eye icon) if restaurant is on home | Toggle off | ☐ |
| 2 | Open `/` in new tab; wait up to 60 seconds; refresh | QA restaurant **not** in list | ☐ |
| 3 | Click **Show on home** | Toggle on | ☐ |
| 4 | Refresh `/` | QA restaurant **appears** (may take up to ~60s) | ☐ |

### TC-306 — Renew subscription

| Step | Action | Expected result | Pass |
|------|--------|-----------------|------|
| 1 | Note current **Next due** date for QA restaurant | | ☐ |
| 2 | Click **Renew** (refresh icon) | Confirm if prompted | ☐ |
| 3 | **Next due** extends (~1 month forward) | Sub status active | ☐ |
| 4 | Check admin email | Renewal email with contract PDF attachment | ☐ |
| 5 | Log in as restaurant admin → **Billing** | New invoice period visible if applicable | ☐ |

### TC-307 — Deactivate & reactivate

| Step | Action | Expected result | Pass |
|------|--------|-----------------|------|
| 1 | Click **Deactivate** for QA restaurant | Confirm dialog → confirm | ☐ |
| 2 | Row shows inactive / paused status | | ☐ |
| 3 | Open `https://zboun.vercel.app/{slug}` | **404** Not Found | ☐ |
| 4 | Open `https://zboun.vercel.app/{slug}/menu` | **404** | ☐ |
| 5 | Restaurant admin: log in | Can login; `/dashboard/business` shows **deactivated** message OR redirects with `account_deactivated` | ☐ |
| 6 | Open `/dashboard/billing` while deactivated | Billing page **still loads**; contact email + WhatsApp | ☐ |
| 7 | Super admin: **Activate** restaurant | Active again | ☐ |
| 8 | Public menus load again | 200 OK | ☐ |

### TC-308 — Delete QA restaurant (end of cycle only)

| Step | Action | Expected result | Pass |
|------|--------|-----------------|------|
| 1 | Click **Delete** (trash) on QA restaurant only | Strong confirm | ☐ |
| 2 | Confirm delete | Row removed | ☐ |
| 3 | Public URLs 404 | | ☐ |

**Skip TC-308** if owner wants to keep QA data.

---

## 4. Restaurant admin — dashboard & menu

**Login:** QA restaurant admin email + password from welcome email → `/dashboard/business`

### TC-401 — First login & navigation

| Step | Action | Expected result | Pass |
|------|--------|-----------------|------|
| 1 | Log in | Lands on `/dashboard/business` | ☐ |
| 2 | Header shows QA restaurant name | No error banner | ☐ |
| 3 | Click **QR codes** | `/dashboard/business/qr` | ☐ |
| 4 | Click **Print flyer** | `/dashboard/business/flyer` | ☐ |
| 5 | Click **Billing** | `/dashboard/billing` | ☐ |
| 6 | Click **Change password** | `/dashboard/change-password` | ☐ |
| 7 | Return to dashboard | | ☐ |

### TC-402 — Restaurant settings

| Step | Action | Expected result | Pass |
|------|--------|-----------------|------|
| 1 | Find **Restaurant settings** / profile section | Fields: name, phone, description, logo, banner, location, ETA, LBP rate, etc. | ☐ |
| 2 | Set **Description:** `QA test description for hero` | | ☐ |
| 3 | Set **Phone:** valid WhatsApp number | | ☐ |
| 4 | Set **Location:** `Beirut, QA Street` | | ☐ |
| 5 | Save settings | Success toast or persisted after refresh | ☐ |
| 6 | Click **Open menu** / copy link | URL is `/{slug}` | ☐ |

### TC-403 — Create menu sections

**Section:** “Menu sections” on dashboard.

| Step | Action | Expected result | Pass |
|------|--------|-----------------|------|
| 1 | Enter section name `QA Starters` → submit | Toast: section created | ☐ |
| 2 | Add `QA Mains` | Toast success | ☐ |
| 3 | Add `QA Drinks` | Toast success | ☐ |
| 4 | In table, change `QA Starters` to `QA Appetizers` → Save (disk icon) | Name updates | ☐ |
| 5 | Open **Add menu item** → Section dropdown | All 3 sections listed | ☐ |

### TC-404 — Add menu items (minimum 6)

Use **Add menu item** form for each row:

| Section | Item name | Price ($) | Description | Pass |
|---------|-----------|-----------|-------------|------|
| QA Appetizers | QA Soup | 5.00 | Tomato soup test | ☐ |
| QA Appetizers | QA Salad | 7.50 | House salad | ☐ |
| QA Mains | QA Burger | 12.00 | Burger meal | ☐ |
| QA Mains | QA Pasta | 11.00 | Penne | ☐ |
| QA Drinks | QA Water | 1.00 | — | ☐ |
| QA Drinks | QA Juice | 3.50 | Fresh juice | ☐ |

**After each item:**

| Step | Expected | Pass |
|------|----------|------|
| Green toast with item name | ☐ |
| Item appears in **Manage menu items** table | ☐ |

### TC-405 — Item with image & options

| Step | Action | Expected result | Pass |
|------|--------|-----------------|------|
| 1 | Add item **QA Special Pizza** price **15.00** | | ☐ |
| 2 | Upload image (JPG/PNG, &lt; 5 MB) | Upload succeeds | ☐ |
| 3 | **Option type:** `Size` | | ☐ |
| 4 | Add option values: `Small` (0), `Large` (+2.00) using option values field | | ☐ |
| 5 | Add removable: `Olives` | | ☐ |
| 6 | Add extra: `Extra cheese` +1.00 | | ☐ |
| 7 | Save item | Appears in table with image thumbnail | ☐ |

### TC-406 — Edit & stock

| Step | Action | Expected result | Pass |
|------|--------|-----------------|------|
| 1 | In **Manage menu items**, open edit on **QA Water** | Edit form/modal | ☐ |
| 2 | Change price to **1.50** → save | Public menu shows 1.50 | ☐ |
| 3 | Mark **QA Juice** out of stock / unavailable | `is_available` off | ☐ |
| 4 | Open public order menu | QA Juice shows “Out”; + button disabled | ☐ |
| 4b | Open in-store menu `/{slug}/menu` | QA Juice still visible as out of stock (no + button) | ☐ |
| 5 | Re-enable stock on QA Juice | + works again on order menu | ☐ |

### TC-407 — Filter & search (dashboard)

| Step | Action | Expected result | Pass |
|------|--------|-----------------|------|
| 1 | Use item search box: type `Burger` | Only matching items | ☐ |
| 2 | Filter by section **QA Mains** | Only mains | ☐ |
| 3 | Clear filters | All items return | ☐ |

### TC-408 — Delete section (optional)

| Step | Action | Expected result | Pass |
|------|--------|-----------------|------|
| 1 | Delete empty section or section with moved items | Confirm; section removed | ☐ |

---

## 5. QR codes & flyer

### TC-501 — Dual QR codes

**URL:** `/dashboard/business/qr`

| Step | Action | Expected result | Pass |
|------|--------|-----------------|------|
| 1 | Page title **Menu QR codes** | Two cards side by side (desktop) | ☐ |
| 2 | **Online order menu** card | Badge “Online order”; QR image loads | ☐ |
| 3 | URL shown ends with `/{slug}` only (no `/menu`) | | ☐ |
| 4 | **Download QR** | PNG downloads | ☐ |
| 5 | **Open menu** | Order menu with + buttons | ☐ |
| 6 | **In-restaurant menu** card | Badge “In-store”; QR loads | ☐ |
| 7 | URL ends with `/{slug}/menu` | | ☐ |
| 8 | Scan in-store QR with phone | Opens view-only menu | ☐ |
| 9 | Download in-store PNG | File saves | ☐ |

### TC-502 — Flyer

**URL:** `/dashboard/business/flyer`

| Step | Action | Expected result | Pass |
|------|--------|-----------------|------|
| 1 | Flyer preview loads | Logo, QR, “scan” text | ☐ |
| 2 | Browser print preview (Ctrl+P) | Fits printable area | ☐ |

---

## 6. Billing (restaurant admin)

### TC-503 — Billing page

**URL:** `/dashboard/billing`

| Step | Action | Expected result | Pass |
|------|--------|-----------------|------|
| 1 | **Account status** shows Active/Deactivated + subscription badge | | ☐ |
| 2 | **Current subscription** — monthly fee, period started, next due | Values present (not all `—`) | ☐ |
| 3 | **Contact Zboun** — **Email** button | Opens mail to `zbounlb@outlook.com` with billing subject | ☐ |
| 4 | **WhatsApp** button | Opens WA with billing message | ☐ |
| 5 | **Invoices** table | Shows rows after super admin created invoice (TC-304) | ☐ |
| 6 | Footer note about payments | Mentions contact above | ☐ |

---

## 7. Public guest experience

Replace `{slug}` with QA restaurant slug.

### TC-601 — Online order menu `/{slug}`

| Step | Action | Expected result | Pass |
|------|--------|-----------------|------|
| 1 | Open menu in **desktop** browser | Hero: name, description, logo/banner | ☐ |
| 2 | Search `Soup` | Shows QA Soup only | ☐ |
| 3 | Tap category pill **QA Drinks** | Filters drinks | ☐ |
| 4 | Tap **All** | Full menu | ☐ |
| 5 | Tap **+** on **QA Burger** | Customization modal | ☐ |
| 6 | Remove ingredient / add extra / note / qty 2 | | ☐ |
| 7 | **Add to cart** | Cart sidebar (desktop) shows 2× burger | ☐ |
| 8 | Add **QA Salad** | Cart total updates | ☐ |
| 9 | Enter **Name** and **Address** | Required fields | ☐ |
| 10 | Check **I confirm my order** | | ☐ |
| 11 | Click **Order on WhatsApp** | WhatsApp opens; message lists items, name, address | ☐ |
| 12 | **Mobile:** repeat cart flow | Bottom cart bar → sheet → order | ☐ |

### TC-602 — In-store menu `/{slug}/menu`

| Step | Action | Expected result | Pass |
|------|--------|-----------------|------|
| 1 | Open in-store URL | Same branding as order menu | ☐ |
| 2 | Badge **In-restaurant menu · view only** | Visible on hero | ☐ |
| 3 | Scroll all sections | Items and prices visible | ☐ |
| 4 | Confirm **no +** buttons on item cards | | ☐ |
| 5 | Confirm **no cart** sidebar or mobile cart bar | | ☐ |
| 6 | Rate restaurant (stars) at bottom | Submit 4 or 5 stars | ☐ |
| 7 | Refresh page | Rating persists (guest cookie/local) | ☐ |

### TC-603 — Inactive restaurant

Run only if TC-307 deactivated, or use a known inactive slug:

| Step | Action | Expected result | Pass |
|------|--------|-----------------|------|
| 1 | Open `/{slug}` when deactivated | 404 page | ☐ |
| 2 | Open `/{slug}/menu` | 404 | ☐ |

---

## 8. Optional add-on modules

**Prerequisite:** Super admin enabled each addon (TC-303). Log in as **restaurant admin**.

### TC-701 — Inventory (`/dashboard/business/inventory`)

| Step | Action | Expected result | Pass |
|------|--------|-----------------|------|
| 1 | Page loads without error | | ☐ |
| 2 | Add supplier (name, optional contact) | Appears in list | ☐ |
| 3 | Add inventory item (name, SKU, unit, qty) | Appears in list | ☐ |
| 4 | Record stock movement (in/out) | Quantity updates | ☐ |

### TC-702 — POS (`/dashboard/business/pos`)

| Step | Action | Expected result | Pass |
|------|--------|-----------------|------|
| 1 | Page loads | Open orders / register UI | ☐ |
| 2 | Create new order; add line item | Totals calculate | ☐ |
| 3 | Complete sale with payment method | Receipt / order closed | ☐ |
| 4 | Open receipts list | New receipt listed | ☐ |

### TC-703 — CRM (`/dashboard/business/crm`)

| Step | Action | Expected result | Pass |
|------|--------|-----------------|------|
| 1 | Add customer (name, phone) | Customer row | ☐ |
| 2 | Add note on customer | Note saved | ☐ |
| 3 | Add tag; assign to customer | Tag visible | ☐ |

### TC-704 — Loyalty (`/dashboard/business/loyalty`)

| Step | Action | Expected result | Pass |
|------|--------|-----------------|------|
| 1 | Configure program if required | Saves | ☐ |
| 2 | Add member | Member in list | ☐ |
| 3 | Adjust points if UI allows | Points update | ☐ |

### TC-705 — Events (`/dashboard/business/events`)

| Step | Action | Expected result | Pass |
|------|--------|-----------------|------|
| 1 | Create event / package | Listed | ☐ |
| 2 | Create booking with organiser details | Booking row | ☐ |

### TC-706 — PMS (`/dashboard/business/pms`) — if hotel type or addon enabled

| Step | Action | Expected result | Pass |
|------|--------|-----------------|------|
| 1 | Add room type | | ☐ |
| 2 | Add room | | ☐ |
| 3 | Create reservation | Appears on calendar/list | ☐ |

### TC-707 — E-commerce (`/dashboard/business/ecommerce`)

| Step | Action | Expected result | Pass |
|------|--------|-----------------|------|
| 1 | Store settings save | | ☐ |
| 2 | View orders list | Page loads | ☐ |

### TC-708 — Fleet (`/dashboard/business/fleet`)

| Step | Action | Expected result | Pass |
|------|--------|-----------------|------|
| 1 | Add vehicle | | ☐ |
| 2 | Add driver | | ☐ |
| 3 | Assign delivery | | ☐ |

### TC-709 — Club / Gym (`/dashboard/business/club` or `/gym`)

| Step | Action | Expected result | Pass |
|------|--------|-----------------|------|
| 1 | Open module for fitness business type | Dashboard loads | ☐ |
| 2 | Add member or plan | Data saves | ☐ |

### TC-710 — Accounting (`/dashboard/business/accounting`)

| Step | Action | Expected result | Pass |
|------|--------|-----------------|------|
| 1 | Add expense (category, amount) | Listed | ☐ |
| 2 | Add employee (if payroll UI shown) | Saves | ☐ |

### TC-711 — Retail (`/dashboard/business/retail`)

| Step | Action | Expected result | Pass |
|------|--------|-----------------|------|
| 1 | Dashboard loads | Summary/metrics visible | ☐ |

### TC-712 — Addon disabled

| Step | Action | Expected result | Pass |
|------|--------|-----------------|------|
| 1 | Super admin **disables** Inventory for QA restaurant | | ☐ |
| 2 | Restaurant admin: inventory link hidden OR page blocked | No access to inventory features | ☐ |

---

## 9. Subscriptions, cron & emails

### TC-801 — Cron API security

| Step | Action | Expected result | Pass |
|------|--------|-----------------|------|
| 1 | `GET /api/cron/subscription-reminders` (no secret) | **401** Unauthorized | ☐ |
| 2 | Same URL with wrong `?secret=wrong` | **401** | ☐ |
| 3 | With correct `CRON_SECRET` (ask owner) | **200** JSON `{ ok: true, ... }` | ☐ |

```powershell
curl.exe "https://zboun.vercel.app/api/cron/subscription-reminders?secret=SECRET_HERE"
```

### TC-802 — Email flows (coordinate with owner)

| Test | How to trigger | Expected | Pass |
|------|----------------|----------|------|
| Welcome email | TC-301 create restaurant | Login link + temp password | ☐ |
| Renewal email | TC-306 renew | PDF contract attachment | ☐ |
| 10-day reminder | Set `next_due_at` ~10 days ahead in DB; run cron | Email to admin + ops | ☐ |
| 3-day reminder | Set ~3 days ahead; run cron | Email to admin + ops | ☐ |
| Deactivation email | Let subscription expire or manual deactivate | Paused/deactivation email | ☐ |

*Email timing tests need database access or super admin date tools.*

---

## 10. Cross-browser & devices

| ID | Browser / device | Critical paths | Pass |
|----|------------------|----------------|------|
| TC-901 | Chrome desktop | TC-601, TC-501 | ☐ |
| TC-902 | Safari iOS | Scan QR, order menu, in-store menu | ☐ |
| TC-903 | Android Chrome | Same as iOS | ☐ |
| TC-904 | Small viewport 375px | Dashboard tables scroll; cart sheet | ☐ |

---

## 11. Regression sign-off

| Module | Tester | Date | Pass / Fail | Blocker bugs |
|--------|--------|------|-------------|--------------|
| Smoke automated | | | | |
| Public & marketing | | | | |
| Auth | | | | |
| Super admin | | | | |
| Restaurant menu | | | | |
| QR & flyer | | | | |
| Billing | | | | |
| Public guest | | | | |
| Add-ons | | | | |
| Cron & email | | | | |

**Release recommendation:** ☐ Approve for production ☐ Approve with known issues ☐ Block release  

**Lead QA signature:** _________________________  

---

## 12. Bug report template

Copy for each issue:

```
Title: [TC-xxx] Short summary
Environment: Production / Staging
URL:
User role: Guest / Restaurant admin / Super admin
Steps:
1.
2.
3.
Expected:
Actual:
Screenshot:
Browser/device:
Severity: Blocker / Major / Minor
```

---

## Quick reference — URLs

| Page | URL |
|------|-----|
| Home | `/` |
| Contact | `/contact` |
| Pricing | `/for-restaurants` |
| Login | `/dashboard/login` |
| Super admin | `/dashboard/super-admin` |
| Restaurant dashboard | `/dashboard/business` |
| QR codes | `/dashboard/business/qr` |
| Flyer | `/dashboard/business/flyer` |
| Billing | `/dashboard/billing` |
| Order menu | `/{slug}` |
| In-store menu | `/{slug}/menu` |

---

*Document version: 1.0 — aligned with Zboun features as of May 2026.*
