# Location, map & “restaurants near me” — product & technical plan

Reference UX: delivery apps (pick location → map pin → saved Home/Work/Other).

---

## Can we add this to Zboun?

**Yes.** Today the home page lists all active restaurants on the home feed. There is **no latitude/longitude** on restaurants yet — only a text `location` field. Distance filtering requires coordinates for:

1. **Each restaurant** (where they deliver from / are based)
2. **Each guest’s delivery point** (map pin or saved address)

---

## Do we need a signup page?

| Goal | Signup required? |
|------|------------------|
| Pick location **once per visit** (browser only) | **No** — store in `localStorage` / session |
| **Save Home / Work / multiple addresses** across devices | **Yes** — consumer accounts |
| Order history tied to a person | **Yes** |
| Marketing / “welcome back” | **Yes** |

**Recommendation**

- **Phase 1 (no signup):** “Where should we deliver?” sheet on home → current location OR map pin → filter restaurants within X km → remember on this device only.
- **Phase 2 (signup):** `/signup` + `/login` for **customers** (separate from restaurant admin) → table `customer_addresses` (Home, Work, custom labels) like your screenshots.

Restaurant admins and super admins stay on the existing `/dashboard/login`.

---

## Architecture overview

```
┌─────────────────────────────────────────────────────────────┐
│  Home page                                                   │
│  [Delivery to: Home ▼]  →  Location sheet                    │
│    · Use current location (Geolocation API)                  │
│    · Choose on map (Google Map + draggable pin)              │
│    · Saved addresses (Phase 2: logged-in user)               │
└──────────────────────────┬──────────────────────────────────┘
                           │ lat, lng
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Filter restaurants where distance(restaurant, user) ≤ R km   │
└─────────────────────────────────────────────────────────────┘
```

---

## Database changes

### Restaurants (required)

```sql
alter table public.restaurants
  add column if not exists latitude double precision,
  add column if not exists longitude double precision,
  add column if not exists delivery_radius_km numeric(6,2) default 10;

create index if not exists idx_restaurants_geo
  on public.restaurants (latitude, longitude)
  where latitude is not null and longitude is not null;
```

- Super admin / restaurant settings: set pin on map OR geocode text `location`.
- `delivery_radius_km`: optional per restaurant (how far they deliver).

### Customer addresses (Phase 2)

```sql
-- role: consumer in public.users OR separate auth.users + profiles

create table public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null check (label in ('home','work','other') or length(label) > 0),
  nickname text, -- e.g. "Mom's", "uni"
  latitude double precision not null,
  longitude double precision not null,
  formatted_address text,
  street text,
  building text,
  apartment text,
  phone text,
  driver_notes text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
```

---

## Google Maps — keys & security

**Never commit API keys to Git.** Use environment variables only.

| Variable | Use |
|----------|-----|
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Maps JavaScript API (map + pin) in browser — restrict by HTTP referrer (`zboun.vercel.app`, localhost) |
| `GOOGLE_MAPS_SERVER_KEY` (optional) | Geocoding / Places on server only — restrict by IP |

Enable in Google Cloud Console:

- Maps JavaScript API
- Places API (autocomplete search)
- Geocoding API (address ↔ coordinates)

**If a key was pasted in chat or email, rotate it immediately** in Google Cloud → Credentials.

Add to Vercel + `.env.local`:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_new_key_here
NEXT_PUBLIC_DEFAULT_DELIVERY_RADIUS_KM=15
```

---

## Distance calculation

For each restaurant with `(lat, lng)`:

```ts
function distanceKm(a: LatLng, b: LatLng): number {
  // Haversine formula
}
```

Show on home only if `distanceKm(user, restaurant) <= min(userRadius, restaurant.delivery_radius_km)`.

Default guest radius: e.g. **15 km** (configurable).

---

## UI phases (match your screenshots)

### Phase 1 — Guest location (no account)

1. Home header: **“Deliver to · [Choose location]”**
2. Bottom sheet:
   - Search address (Places Autocomplete)
   - Use current location
   - Deliver somewhere else → full-screen map, draggable pin, **Confirm**
3. Optional: save as “Home” in `localStorage` only (one slot) — not synced across phones.

### Phase 2 — Customer accounts

1. `/signup` — email + password (Supabase Auth)
2. `/account/addresses` — list Home / Work / custom + add/edit/delete
3. Location sheet shows **Saved addresses** with green border on selected
4. Add new address → map + nickname + street/building/apt/phone/notes (screenshot 3)

### Phase 3 — Restaurant admin

1. Business settings: **map pin** for restaurant location + delivery radius slider
2. Geocode existing `location` text for old rows

---

## What stays the same

- Ordering is still **WhatsApp** — delivery address can be appended to the WA message from saved location.
- Restaurant admin login unchanged.
- In-store QR menu (`/{slug}/menu`) unchanged.

---

## Effort estimate (rough)

| Phase | Scope | Size |
|-------|--------|------|
| 1 | DB coords + geocode admin + home filter + map picker (guest) | Medium |
| 2 | Consumer signup + saved addresses | Medium–large |
| 3 | Per-restaurant radius, ETA by distance | Small |

---

## QA additions (when built)

- TC: pick location → only nearby restaurants shown
- TC: change location → list updates
- TC: restaurant without lat/lng → hidden or “location not set”
- TC: logged-in user saves 3 addresses, switches between them
- TC: API key not exposed in page source beyond public Maps key (referrer-restricted)

---

## Decision needed from product owner

1. **Phase 1 only** for launch, or **Phase 1 + 2** together?
2. Default search radius: **10 km**, **15 km**, or user-selectable?
3. Filter **delivery radius per restaurant** or one global radius?
4. Consumer signup: **email/password** or **phone OTP** (common in Lebanon)?

Once decided, implementation can start with SQL migration + home location sheet + restaurant coordinates in admin.
