# Distance-Based Delivery Fees — Professional Implementation Guide

## Overview

This document outlines a professional, scalable solution for restaurants to charge different delivery fees based on distance from their location to the customer. This feature is common in major delivery platforms (Uber Eats, DoorDash, Deliveroo, Talabat) and provides fairness for both restaurants and customers.

---

## Why Distance-Based Pricing?

### Benefits for Restaurants
- **Fair cost recovery**: longer distances = higher fuel/time costs
- **Encourage nearby orders**: incentivize local customers with lower fees
- **Flexibility**: rural vs. urban pricing strategies
- **Professional appearance**: signals a mature delivery operation

### Benefits for Customers
- **Transparency**: know exactly what they'll pay before ordering
- **Fairness**: nearby customers don't subsidize distant deliveries
- **Choice**: can see if they're within an affordable delivery zone

---

## Recommended Solution: Tiered Pricing

**Database schema is already created** in `add-nationwide-delivery.sql` under the table `restaurant_delivery_tiers`.

### How It Works

1. **Restaurant defines distance ranges (tiers)**
   - Example for a Beirut restaurant:
     - 0–3 km: $2
     - 3–7 km: $3
     - 7–12 km: $5
     - 12–20 km: $8

2. **System calculates distance** when customer enters delivery address
   - Uses Haversine formula (already implemented in `src/lib/geo.ts`)
   - Finds closest restaurant branch if multiple locations exist

3. **Fee is automatically applied** at checkout
   - Customer sees: "Delivery: $3 (5 km away)"
   - Falls back to flat `delivery_fee_usd` if no tiers configured

4. **No overlapping ranges** enforced by database constraint
   - PostgreSQL `EXCLUDE` constraint prevents errors
   - Each tier must have a clear start/end boundary

---

## Alternative Approaches (Not Recommended)

### Option B: Per-Kilometer Pricing
- **How**: Base fee + $X per km after Y km
- **Example**: $2 base + $0.50/km after 5 km
- **Why not**: harder for customers to estimate, less predictable

### Option C: Predefined Delivery Zones
- **How**: Restaurant draws polygons on a map (Beirut, Jounieh, Baabda)
- **Example**: Zone A = $2, Zone B = $4, Zone C = $6
- **Why not**: complex to set up, requires map drawing UI, hard to maintain

**Recommendation**: Stick with **tiered distance ranges** (Option A) for simplicity, transparency, and ease of management.

---

## Implementation Checklist

### ✅ Already Completed
- [x] Database table `restaurant_delivery_tiers` created
- [x] Database function `calculate_delivery_fee(restaurant_id, distance_km)` created
- [x] Row-level security policies (admins can edit their own tiers)
- [x] Non-overlapping range constraint
- [x] Distance calculation functions (`distanceKm`, `minDistanceToRestaurantKm`)

### 🚧 Next Steps

#### 1. **Admin UI: Manage Delivery Tiers** (High Priority)
Create a panel in `/dashboard/business` where restaurant admins can:
- ✏️ Add a new tier: "From X km to Y km → $Z"
- 🗑️ Delete a tier
- 📊 See all tiers in a sortable list
- 💾 Save changes with validation (no gaps, no overlaps)

**File to edit**: `app/dashboard/business/page.tsx`  
**New component**: `src/components/delivery-tiers-panel.tsx`

#### 2. **Customer Order Flow: Show Dynamic Fee** (High Priority)
Update the order/checkout page to:
- Calculate customer's distance from restaurant
- Query `calculate_delivery_fee()` function
- Display: "Delivery: $3.50 (7.2 km away)"
- Update WhatsApp message to include distance-based fee

**Files to edit**:
- `src/components/menu-client.tsx` (where order is built)
- `src/app-actions/orders.ts` (WhatsApp message generation)

#### 3. **Menu Page: Show Fee Range** (Medium Priority)
On `/{slug}` menu page, show delivery fee info:
- "Delivery: $2–$8 depending on location"
- Or if customer has set location: "Delivery: $3 to your area"

**File to edit**: `app/[slug]/page.tsx`

#### 4. **Home/Search: Badge for Tiered Pricing** (Low Priority)
Optional: show an indicator on restaurant cards:
- "💰 Distance-based delivery"
- Helps customers understand pricing upfront

**Files to edit**:
- `src/components/restaurant-directory.tsx`
- `src/components/search-page-content.tsx`

---

## User Experience Examples

### Example 1: Typical Restaurant (Beirut Café)
```
Tiers:
- 0–5 km   → $2
- 5–10 km  → $4
- 10–15 km → $7

Customer in Achrafieh (3 km away):
→ Sees: "Delivery: $2 (3 km)"

Customer in Jounieh (12 km away):
→ Sees: "Delivery: $7 (12 km)"

Customer in Tripoli (80 km away):
→ Sees: "Delivery unavailable (outside delivery radius)"
```

### Example 2: Nationwide Delivery Store
```
delivers_nationwide = true
Tiers:
- 0–10 km    → $3
- 10–30 km   → $8
- 30–100 km  → $15

Customer anywhere in Lebanon:
→ Store appears in search
→ Fee calculated based on distance
```

### Example 3: No Tiers Configured (Fallback)
```
Tiers: (none)
delivery_fee_usd = $2.50

All customers:
→ Flat $2.50 delivery fee
→ Works exactly as before
```

---

## Technical Design Patterns

### Pattern 1: Query Delivery Fee (Client-Side)
```typescript
// In React component (menu page or checkout)
const { data: fee } = useSWR(
  restaurantId && customerDistance 
    ? `/api/delivery-fee?restaurant=${restaurantId}&distance=${customerDistance}`
    : null
);
```

### Pattern 2: Query Delivery Fee (Server-Side)
```typescript
// In server action
const { data } = await supabase
  .rpc('calculate_delivery_fee', {
    p_restaurant_id: restaurantId,
    p_distance_km: distance
  });
const deliveryFee = data ?? 0;
```

### Pattern 3: Fetch All Tiers for Admin UI
```typescript
const { data: tiers } = await supabase
  .from('restaurant_delivery_tiers')
  .select('*')
  .eq('restaurant_id', restaurantId)
  .order('position');
```

---

## Edge Cases & Error Handling

| Scenario | Behavior |
|----------|----------|
| No tiers defined | Fall back to flat `delivery_fee_usd` |
| Distance = 5.0 km, tier = 3–7 km | Use the 3–7 km tier (inclusive boundaries) |
| Distance = 2.9 km, only tier starts at 3 km | No matching tier → use flat fee |
| Restaurant has no lat/lng | Can't calculate distance → use flat fee |
| Customer has no location set | Show fee range or prompt to set location |
| Overlapping tiers attempted | Database constraint prevents save, show error |
| Gap in tiers (0–5, 10–15) | Allowed; 5–10 km uses flat fee |

---

## Migration Strategy

### Phase 1: Launch (Zero Disruption)
- All restaurants default to `delivers_nationwide = false`, no tiers
- Existing flat fees continue working
- Zero changes needed for current restaurants

### Phase 2: Pilot with 3–5 Restaurants
- Onboard willing partners who deliver to varied distances
- Collect feedback on admin UI and customer clarity
- Refine based on real-world usage

### Phase 3: Marketing Push
- Announce feature to all restaurant partners
- Create tutorial video for setting up tiers
- Monitor adoption, answer questions

### Phase 4: Analytics
- Track: % of restaurants using tiers
- Track: Average delivery fee by distance
- Track: Customer complaints/confusion (if any)

---

## Admin UI Mockup (Text Description)

```
┌─────────────────────────────────────────────────────────┐
│  Delivery Fee Tiers                              [+ Add] │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  No tiers configured. All customers pay the flat         │
│  delivery fee of $2.50.                                  │
│                                                           │
│  [+ Add your first tier]                                 │
│                                                           │
└─────────────────────────────────────────────────────────┘

After adding tiers:

┌─────────────────────────────────────────────────────────┐
│  Delivery Fee Tiers                              [+ Add] │
├─────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────┐  │
│  │  0 km  →  5 km     $2.00           [Edit] [Delete]│  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │  5 km  → 10 km     $4.00           [Edit] [Delete]│  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │ 10 km  → 20 km     $7.00           [Edit] [Delete]│  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Customer-Facing UI Mockup (Text Description)

### On Menu Page (Before Ordering)
```
╔═══════════════════════════════════════════════════════╗
║  Shawarma Land                                  ⭐ 4.8 ║
╠═══════════════════════════════════════════════════════╣
║  📍 Hamra, Beirut                                      ║
║  🚚 Delivery: $2–$7 based on distance                 ║
║     (Set your location for exact fee)                  ║
╚═══════════════════════════════════════════════════════╝
```

### On Checkout (After Location Set)
```
╔═══════════════════════════════════════════════════════╗
║  Order Summary                                         ║
╠═══════════════════════════════════════════════════════╣
║  2x Chicken Shawarma                           $12.00  ║
║  1x Fries                                       $3.00  ║
║  ───────────────────────────────────────────────────  ║
║  Subtotal                                      $15.00  ║
║  Delivery (6.2 km away)                         $4.00  ║
║  ═══════════════════════════════════════════════════  ║
║  Total                                         $19.00  ║
╚═══════════════════════════════════════════════════════╝
```

---

## Success Metrics

Track these KPIs after launch:

1. **Adoption Rate**
   - % of restaurants using tiered pricing
   - Target: 20% within 3 months

2. **Customer Clarity**
   - Support tickets mentioning "delivery fee" or "distance"
   - Target: <2% increase vs. flat fee baseline

3. **Order Conversion**
   - Orders completed / orders started (checkout flow)
   - Target: No decrease vs. flat fee baseline

4. **Revenue Impact**
   - Average delivery fee before/after tiers
   - Restaurants report profitability improvement

---

## Next Steps — Decision Points

Before proceeding with full implementation, please confirm:

1. ✅ **Approve tiered pricing approach** (vs. per-km or zone-based)
2. ⏸️ **Priority level**:
   - 🔥 High: Build admin UI + customer display now
   - 📅 Medium: Build after other features
   - ❄️ Low: Nice-to-have, deprioritize for now

3. 🎨 **Design preferences**:
   - Match current Zboun style (violet/fuchsia accents)
   - Simple table vs. visual distance slider
   - Show fee prominently on menu page or hide until checkout

4. 🧪 **Testing plan**:
   - Internal testing only
   - Beta with 3–5 pilot restaurants
   - Full rollout to all partners

---

## Questions?

This is a proven pattern used by all major delivery platforms. The database groundwork is complete. Now we just need to build the UI for restaurant admins to configure their tiers, and update the customer order flow to display and use those tiers.

Ready to proceed? Let me know your priority and any design preferences, and I'll build the remaining pieces!
