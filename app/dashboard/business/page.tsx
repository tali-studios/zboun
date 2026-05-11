import { redirect } from "next/navigation";
import { signOutAction } from "@/app-actions/auth";
import {
  createCategoryAction,
  deleteCategoryAction,
  deleteMenuItemAction,
  createMenuItemAction,
  toggleMenuItemAvailabilityAction,
  updateCategoryAction,
  updateMenuItemAction,
  updateRestaurantSettingsAction,
} from "@/app-actions/restaurant";
import { getCurrentUserRole } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { CopyMenuLinkButton } from "@/components/copy-menu-link-button";
import { BusinessCategoryDashboard } from "@/components/business-category-dashboard";
import { ImageUploadField } from "@/components/image-upload-field";
import { IngredientListField } from "@/components/ingredient-list-field";
import { BROWSE_SECTION_OPTIONS, normalizeBrowseSections } from "@/lib/browse-sections";
import { getBusinessTypeLabel, parseBusinessType, supportsHomeBrowseCategory } from "@/lib/business-types";
import { RestaurantDashboardToast } from "@/components/restaurant-dashboard-toast";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    stock?: string;
    jump?: string;
    toast?: string;
    section_name?: string;
  }>;
};

export default async function RestaurantDashboardPage({ searchParams }: Props) {
  const appUser = await getCurrentUserRole();
  if (!appUser || appUser.role !== "restaurant_admin" || !appUser.restaurant_id) {
    redirect("/dashboard/login");
  }
  const { q, category, stock, toast, section_name: sectionNameRaw } = await searchParams;
  let sectionName: string | undefined = undefined;
  if (typeof sectionNameRaw === "string" && sectionNameRaw.length > 0) {
    try {
      sectionName = decodeURIComponent(sectionNameRaw);
    } catch {
      sectionName = sectionNameRaw;
    }
  }

  const supabase = await createServerSupabaseClient();
  const [
    { data: restaurant },
    { data: categories },
    { data: inventoryAddon },
    { data: inventoryItems },
    { data: accountingAddon },
    { data: accountingExpenses },
    { data: posAddon },
    { data: posOrders },
    { data: crmAddon },
    { data: crmCustomers },
    { data: loyaltyAddon },
    { data: loyaltyMembers },
    { data: eventsAddon },
    { data: todayReservations },
    { data: upcomingBookings },
    { data: pmsAddon },
    { data: pmsRooms },
    { data: ecommerceAddon },
    { data: ecommerceOrders },
    { data: fleetAddon },
    { data: fleetDeliveries },
    { data: clubAddon },
    { data: clubMembers },
  ] = await Promise.all([
    supabase
      .from("restaurants")
      .select(
        "name, slug, phone, logo_url, banner_url, description, lbp_rate, browse_sections, location, eta_label, business_type",
      )
      .eq("id", appUser.restaurant_id)
      .single(),
    supabase
      .from("categories")
      .select("id, name, position")
      .eq("restaurant_id", appUser.restaurant_id)
      .order("position"),
    supabase
      .from("restaurant_addons")
      .select("is_enabled")
      .eq("restaurant_id", appUser.restaurant_id)
      .eq("addon_key", "inventory")
      .maybeSingle(),
    supabase
      .from("inventory_items")
      .select("id, current_qty, min_qty")
      .eq("restaurant_id", appUser.restaurant_id),
    supabase
      .from("restaurant_addons")
      .select("is_enabled")
      .eq("restaurant_id", appUser.restaurant_id)
      .eq("addon_key", "accounting")
      .maybeSingle(),
    supabase
      .from("accounting_expenses")
      .select("id, amount, occurred_at")
      .eq("restaurant_id", appUser.restaurant_id)
      .order("occurred_at", { ascending: false })
      .limit(100),
    supabase
      .from("restaurant_addons")
      .select("is_enabled")
      .eq("restaurant_id", appUser.restaurant_id)
      .eq("addon_key", "pos")
      .maybeSingle(),
    supabase
      .from("pos_orders")
      .select("id, status, created_at")
      .eq("restaurant_id", appUser.restaurant_id)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("restaurant_addons")
      .select("is_enabled")
      .eq("restaurant_id", appUser.restaurant_id)
      .eq("addon_key", "crm")
      .maybeSingle(),
    supabase
      .from("crm_customers")
      .select("id, is_vip, total_spend")
      .eq("restaurant_id", appUser.restaurant_id),
    supabase
      .from("restaurant_addons")
      .select("is_enabled")
      .eq("restaurant_id", appUser.restaurant_id)
      .eq("addon_key", "loyalty")
      .maybeSingle(),
    supabase
      .from("loyalty_members")
      .select("id, tier, is_active")
      .eq("restaurant_id", appUser.restaurant_id),
    supabase
      .from("restaurant_addons")
      .select("is_enabled")
      .eq("restaurant_id", appUser.restaurant_id)
      .eq("addon_key", "events")
      .maybeSingle(),
    supabase
      .from("table_reservations")
      .select("id, status")
      .eq("restaurant_id", appUser.restaurant_id)
      .eq("reservation_date", new Date().toISOString().split("T")[0]),
    supabase
      .from("event_bookings")
      .select("id, status, event_date")
      .eq("restaurant_id", appUser.restaurant_id)
      .gte("event_date", new Date().toISOString().split("T")[0])
      .not("status", "in", '("cancelled","completed")'),
    supabase
      .from("restaurant_addons")
      .select("is_enabled")
      .eq("restaurant_id", appUser.restaurant_id)
      .eq("addon_key", "pms")
      .maybeSingle(),
    supabase
      .from("pms_rooms")
      .select("id, status, is_active")
      .eq("restaurant_id", appUser.restaurant_id),
    supabase.from("restaurant_addons").select("is_enabled")
      .eq("restaurant_id", appUser.restaurant_id).eq("addon_key", "ecommerce").maybeSingle(),
    supabase.from("ecommerce_orders").select("id, status, payment_status")
      .eq("restaurant_id", appUser.restaurant_id)
      .not("status", "in", '("delivered","cancelled")').limit(200),
    supabase.from("restaurant_addons").select("is_enabled")
      .eq("restaurant_id", appUser.restaurant_id).eq("addon_key", "fleet").maybeSingle(),
    supabase.from("fleet_deliveries").select("id, status")
      .eq("restaurant_id", appUser.restaurant_id)
      .not("status", "in", '("delivered","failed","cancelled")').limit(100),
    supabase.from("restaurant_addons").select("is_enabled")
      .eq("restaurant_id", appUser.restaurant_id).eq("addon_key", "club").maybeSingle(),
    supabase.from("club_members").select("id, status")
      .eq("restaurant_id", appUser.restaurant_id).limit(500),
  ]);

  const itemsSelectWithOptions =
    "id, name, description, price, image_url, grams, contents, removable_ingredients, add_ingredients, option_label, option_values, is_available, category_id, categories(name)";
  const itemsSelectLegacy =
    "id, name, description, price, image_url, grams, contents, removable_ingredients, add_ingredients, is_available, category_id, categories(name)";

  const { data: itemsWithOptions, error: itemsWithOptionsError } = await supabase
    .from("menu_items")
    .select(itemsSelectWithOptions)
    .eq("restaurant_id", appUser.restaurant_id)
    .order("name");

  const { data: legacyItems } =
    itemsWithOptionsError &&
    /option_label|option_values/i.test(itemsWithOptionsError.message ?? "")
      ? await supabase
          .from("menu_items")
          .select(itemsSelectLegacy)
          .eq("restaurant_id", appUser.restaurant_id)
          .order("name")
      : { data: null };

  const items = (itemsWithOptions ??
    legacyItems ??
    []) as Array<{
    id: string;
    name: string;
    description: string | null;
    price: number;
    image_url: string | null;
    grams: number | null;
    contents: string | null;
    removable_ingredients: Array<{ name?: string }>;
    add_ingredients: Array<{ name?: string; price?: number }>;
    option_label?: string | null;
    option_values?: Array<{ name?: string; price?: number }>;
    is_available: boolean;
    category_id: string | null;
    categories?: { name?: string } | null;
  }>;

  const normalizedItems = items.map((item) => ({
    ...item,
    option_label: item.option_label ?? null,
    option_values: Array.isArray(item.option_values) ? item.option_values : [],
  }));

  const inventoryEnabled = Boolean(inventoryAddon?.is_enabled);
  const inventoryLowStock = inventoryEnabled
    ? (inventoryItems ?? []).filter((i) => Number(i.current_qty) < Number(i.min_qty)).length
    : 0;
  const inventoryOutOfStock = inventoryEnabled
    ? (inventoryItems ?? []).filter((i) => Number(i.current_qty) <= 0).length
    : 0;
  const accountingEnabled = Boolean(accountingAddon?.is_enabled);
  const currentMonthStart = new Date();
  currentMonthStart.setDate(1);
  currentMonthStart.setHours(0, 0, 0, 0);
  const accountingMonthExpenses = accountingEnabled
    ? (accountingExpenses ?? [])
        .filter((expense) => new Date(expense.occurred_at) >= currentMonthStart)
        .reduce((sum, expense) => sum + Number(expense.amount), 0)
    : 0;
  const posEnabled = Boolean(posAddon?.is_enabled);
  const posOpenOrders = posEnabled ? (posOrders ?? []).filter((order) => order.status === "open").length : 0;
  const crmEnabled = Boolean(crmAddon?.is_enabled);
  const crmTotalCustomers = crmEnabled ? (crmCustomers ?? []).length : 0;
  const crmVipCount = crmEnabled ? (crmCustomers ?? []).filter((c) => c.is_vip).length : 0;
  const loyaltyEnabled = Boolean(loyaltyAddon?.is_enabled);
  const loyaltyActiveMembers = loyaltyEnabled ? (loyaltyMembers ?? []).filter((m) => m.is_active).length : 0;
  const loyaltyNonStandard = loyaltyEnabled ? (loyaltyMembers ?? []).filter((m) => m.tier !== "standard" && m.is_active).length : 0;
  const eventsEnabled = Boolean(eventsAddon?.is_enabled);
  const pmsEnabled = Boolean(pmsAddon?.is_enabled);
  const pmsActiveRooms = pmsEnabled ? (pmsRooms ?? []).filter((r) => r.is_active) : [];
  const pmsOccupied = pmsActiveRooms.filter((r) => r.status === "occupied").length;
  const pmsOccupancyRate = pmsActiveRooms.length > 0 ? Math.round((pmsOccupied / pmsActiveRooms.length) * 100) : 0;
  const eventsTodayCount = eventsEnabled ? (todayReservations ?? []).filter((r) => r.status !== "cancelled").length : 0;
  const eventsUpcomingCount = eventsEnabled ? (upcomingBookings ?? []).length : 0;
  const ecommerceEnabled = Boolean(ecommerceAddon?.is_enabled);
  const ecommercePendingOrders = ecommerceEnabled ? (ecommerceOrders ?? []).filter((o) => o.status === "pending").length : 0;
  const ecommerceActiveOrders = ecommerceEnabled ? (ecommerceOrders ?? []).length : 0;
  const fleetEnabled = Boolean(fleetAddon?.is_enabled);
  const fleetActiveDeliveries = fleetEnabled ? (fleetDeliveries ?? []).length : 0;
  const clubEnabled = Boolean(clubAddon?.is_enabled);
  const clubActiveMembers = clubEnabled ? (clubMembers ?? []).filter((m) => m.status === "active").length : 0;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const menuUrl = `${appUrl.replace(/\/+$/, "")}/${restaurant?.slug ?? ""}`;
  const businessType = parseBusinessType(restaurant?.business_type ?? "restaurant");
  const businessTypeLabel = getBusinessTypeLabel(businessType);
  const isMenuBusiness = supportsHomeBrowseCategory(businessType);
  const totalItems = normalizedItems.length;
  const availableItems = normalizedItems.filter((item) => item.is_available).length;
  const outOfStockItems = totalItems - availableItems;
  const sectionCount = categories?.length ?? 0;
  const categoryNameById = new Map((categories ?? []).map((category) => [category.id, category.name]));
  const normalizedQuery = (q ?? "").trim().toLowerCase();
  const selectedCategory = (category ?? "").trim();
  const selectedStock = (stock ?? "").trim();
  const filteredItems = normalizedItems.filter((item) => {
    if (selectedCategory && item.category_id !== selectedCategory) return false;
    if (selectedStock === "in" && !item.is_available) return false;
    if (selectedStock === "out" && item.is_available) return false;
    if (!normalizedQuery) return true;
    const categoryName = categoryNameById.get(item.category_id ?? "") ?? "";
    const optionText = `${item.option_label ?? ""} ${JSON.stringify(item.option_values ?? [])}`.toLowerCase();
    return (
      item.name.toLowerCase().includes(normalizedQuery) ||
      (item.description ?? "").toLowerCase().includes(normalizedQuery) ||
      (item.contents ?? "").toLowerCase().includes(normalizedQuery) ||
      categoryName.toLowerCase().includes(normalizedQuery) ||
      optionText.includes(normalizedQuery)
    );
  });
  const avgPrice =
    totalItems > 0
      ? (normalizedItems.reduce((sum, item) => sum + Number(item.price), 0) ?? 0) / totalItems
      : 0;
  const selectedBrowseSection =
    normalizeBrowseSections(restaurant?.browse_sections ?? [])[0] ?? "Lunch";

  if (!isMenuBusiness) {
    return (
      <>
        <RestaurantDashboardToast toast={toast} sectionName={sectionName} />
        <BusinessCategoryDashboard
          businessType={businessType}
          businessTypeLabel={businessTypeLabel}
          restaurantName={restaurant?.name ?? ""}
          profileCompleteness={[restaurant?.description, restaurant?.location, restaurant?.phone].filter(Boolean).length}
          clubActiveMembers={clubActiveMembers}
          crmTotalCustomers={crmTotalCustomers}
          pmsActiveRooms={pmsActiveRooms.length}
          pmsOccupancyRate={pmsOccupancyRate}
          ecommerceActiveOrders={ecommerceActiveOrders}
          ecommercePendingOrders={ecommercePendingOrders}
          posOpenOrders={posOpenOrders}
          fleetActiveDeliveries={fleetActiveDeliveries}
          accountingMonthExpenses={accountingMonthExpenses}
          enabledModuleCount={[inventoryEnabled, accountingEnabled, posEnabled, crmEnabled, loyaltyEnabled, eventsEnabled, pmsEnabled, ecommerceEnabled, fleetEnabled, clubEnabled].filter(Boolean).length}
          inventoryEnabled={inventoryEnabled}
          accountingEnabled={accountingEnabled}
          posEnabled={posEnabled}
          crmEnabled={crmEnabled}
          loyaltyEnabled={loyaltyEnabled}
          eventsEnabled={eventsEnabled}
          pmsEnabled={pmsEnabled}
          ecommerceEnabled={ecommerceEnabled}
          fleetEnabled={fleetEnabled}
          clubEnabled={clubEnabled}
        />
      </>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f8ff] p-3 sm:p-4 md:p-8">
      <RestaurantDashboardToast toast={toast} sectionName={sectionName} />
      <div className="mx-auto max-w-7xl space-y-5">
        {/* Dashboard header */}
        <header className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-700 via-violet-600 to-fuchsia-600 p-5 text-white shadow-lg shadow-violet-600/30 md:p-6">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl"
          />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-violet-200">Restaurant admin</p>
              <h1 className="mt-1 text-xl font-bold md:text-2xl">{restaurant?.name}</h1>
              <p className="mt-0.5 text-xs text-violet-200 md:text-sm">
                {businessTypeLabel}
                {isMenuBusiness ? (
                  <>
                    {" "}
                    · Menu: <span className="font-medium text-white">/{restaurant?.slug}</span>
                  </>
                ) : null}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {isMenuBusiness ? (
                <>
                  <a
                    href={menuUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn rounded-full bg-white text-violet-700 shadow-sm hover:bg-violet-50"
                  >
                    Open menu
                  </a>
                  <CopyMenuLinkButton url={menuUrl} />
                  <a href="/dashboard/business/qr" className="btn rounded-full border border-white/30 bg-white/10 text-white hover:bg-white/20">
                    QR code
                  </a>
                  <a href="/dashboard/business/flyer" className="btn rounded-full border border-white/30 bg-white/10 text-white hover:bg-white/20">
                    Print flyer
                  </a>
                </>
              ) : null}
              <a href="/dashboard/change-password" className="btn rounded-full border border-white/30 bg-white/10 text-white hover:bg-white/20">
                Password
              </a>
              <form action={signOutAction} className="w-full sm:w-auto">
                <button
                  type="submit"
                  className="btn w-full rounded-full border border-rose-400/50 bg-rose-600 text-white shadow-sm hover:border-rose-300/60 hover:bg-rose-500 sm:w-auto"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </header>

        {/* Stats */}
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <article className="panel p-5">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Sections</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{sectionCount}</p>
          </article>
          <article className="panel p-5">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Menu items</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{totalItems}</p>
          </article>
          <article className="panel p-5">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">In stock</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-violet-700">{availableItems}</p>
            <p className="mt-1 text-xs text-slate-400">{outOfStockItems} out of stock</p>
          </article>
          <article className="panel p-5">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Avg price</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">${avgPrice.toFixed(2)}</p>
          </article>
        </section>

        {isMenuBusiness ? (
        <section className="grid gap-4 lg:grid-cols-3">
          <form
            action={updateRestaurantSettingsAction}
            className="panel p-5 lg:col-span-2"
          >
            <h2 className="panel-title">Store settings</h2>
            <div className="mt-3 grid gap-2 md:grid-cols-3">
              <input type="hidden" name="current_logo_url" value={restaurant?.logo_url ?? ""} />
              <input type="hidden" name="current_banner_url" value={restaurant?.banner_url ?? ""} />
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Store Name</span>
                <input name="name" defaultValue={restaurant?.name} placeholder="Store name" className="ui-input" />
                <p className="text-xs text-slate-500">Public name shown at the top of your menu.</p>
              </label>
              <label className="space-y-1 md:col-span-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Store Description</span>
                <textarea
                  name="description"
                  defaultValue={restaurant?.description ?? ""}
                  placeholder="Short about text shown under your restaurant name on menu page"
                  className="ui-input min-h-24"
                />
                <p className="text-xs text-slate-500">Example: Fresh pasta and handmade sauces since 2015.</p>
              </label>
              <label className="space-y-1 md:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Location / area</span>
                <input
                  name="location"
                  defaultValue={restaurant?.location ?? ""}
                  placeholder="e.g. Mar Mikhael"
                  className="ui-input"
                />
                <p className="text-xs text-slate-500">Neighborhood or short address label for customers.</p>
              </label>
              <label className="space-y-1 md:col-span-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Prep / delivery time label
                </span>
                <input
                  name="eta_label"
                  defaultValue={restaurant?.eta_label ?? ""}
                  placeholder="e.g. 20–30 min"
                  className="ui-input"
                />
                <p className="text-xs text-slate-500">Short text for the time pill on home cards (optional).</p>
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phone Number</span>
                <input
                  name="phone"
                  defaultValue={restaurant?.phone}
                  placeholder="WhatsApp number"
                  className="ui-input"
                />
                <p className="text-xs text-slate-500">Used for customer WhatsApp contact actions.</p>
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Dollar Rate</span>
                <input
                  name="lbp_rate"
                  type="number"
                  step="0.01"
                  min={1}
                  defaultValue={restaurant?.lbp_rate ?? 89500}
                  placeholder="L.L rate per $1"
                  className="ui-input"
                />
                <p className="text-xs text-slate-500">Exchange rate used to display LBP conversions.</p>
              </label>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 md:col-span-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Home browse category
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Pick one section where your restaurant appears on the home page.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {BROWSE_SECTION_OPTIONS.map((section) => (
                    <label
                      key={section}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700"
                    >
                      <input
                        type="radio"
                        name="browse_section"
                        value={section}
                        defaultChecked={section === selectedBrowseSection}
                        className="h-4 w-4 accent-violet-600"
                      />
                      <span>{section}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="md:col-span-3">
                <ImageUploadField
                  name="logo_file"
                  label="Restaurant logo"
                  initialImageUrl={restaurant?.logo_url ?? null}
                />
              </div>
              <div className="md:col-span-3">
                <ImageUploadField
                  name="banner_file"
                  label="Restaurant banner image"
                  initialImageUrl={restaurant?.banner_url ?? null}
                />
                <p className="mt-1 text-xs text-slate-500">Recommended wide image (for top profile header on menu page).</p>
              </div>
              <button className="btn btn-primary md:col-span-3 rounded-xl">Save settings</button>
            </div>
          </form>

          <form action={createCategoryAction} className="panel p-5">
            <h2 className="panel-title">Add section</h2>
            <div className="mt-3 space-y-2">
              <input name="name" required placeholder="Section name" className="ui-input" />
              <p className="text-xs text-slate-500">Examples: Burgers, Drinks, Desserts, Grocery.</p>
              <button className="btn btn-success w-full rounded-xl">Add section</button>
            </div>
          </form>
        </section>
        ) : (
          <section className="panel p-5">
            <h2 className="panel-title">Business profile</h2>
            <p className="mt-1 text-sm text-slate-600">
              This dashboard is tailored for {businessTypeLabel}. Menu and home-browse tools are hidden
              for non-restaurant businesses.
            </p>
            <form action={updateRestaurantSettingsAction} className="mt-4 grid gap-3 md:grid-cols-2">
              <input type="hidden" name="current_logo_url" value={restaurant?.logo_url ?? ""} />
              <input type="hidden" name="current_banner_url" value={restaurant?.banner_url ?? ""} />
              <input type="hidden" name="lbp_rate" value={String(restaurant?.lbp_rate ?? 89500)} />
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Business Name</span>
                <input name="name" defaultValue={restaurant?.name} placeholder="Business name" className="ui-input" />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phone Number</span>
                <input
                  name="phone"
                  defaultValue={restaurant?.phone}
                  placeholder="Phone number"
                  className="ui-input"
                />
              </label>
              <label className="space-y-1 md:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Description</span>
                <textarea
                  name="description"
                  defaultValue={restaurant?.description ?? ""}
                  placeholder="Describe your business"
                  className="ui-input min-h-24"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Location</span>
                <input
                  name="location"
                  defaultValue={restaurant?.location ?? ""}
                  placeholder="Location"
                  className="ui-input"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">ETA Label</span>
                <input
                  name="eta_label"
                  defaultValue={restaurant?.eta_label ?? ""}
                  placeholder="e.g. By appointment"
                  className="ui-input"
                />
              </label>
              <button className="btn btn-primary rounded-xl md:col-span-2">Save profile</button>
            </form>
          </section>
        )}

        <section className="panel p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="panel-title">Manage sections</h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {sectionCount} sections
            </span>
          </div>
          <div className="-mx-4 mt-4 overflow-x-auto sm:mx-0 sm:rounded-2xl sm:border sm:border-slate-200 sm:bg-white sm:shadow-sm">
            <table className="min-w-[560px] text-sm md:min-w-full">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Section name</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories?.map((category) => (
                  <tr key={category.id}>
                    <td className="px-4 py-3">
                      <input type="hidden" name="id" value={category.id} form={`update-category-${category.id}`} />
                      <input
                        name="name"
                        defaultValue={category.name}
                        placeholder="Section name shown to customers"
                        className="ui-input max-w-md"
                        aria-label={`Section name for ${category.name}`}
                        form={`update-category-${category.id}`}
                      />
                    </td>
                    <td className="w-[1%] whitespace-nowrap px-4 py-3">
                      <div className="flex items-center gap-2">
                        <form id={`update-category-${category.id}`} action={updateCategoryAction}>
                          <button
                            type="submit"
                            title="Save section"
                            aria-label={`Save ${category.name}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-violet-600 text-sm text-white shadow-sm transition hover:bg-violet-700"
                          >
                            💾
                          </button>
                        </form>
                        <form action={deleteCategoryAction}>
                          <input type="hidden" name="id" value={category.id} />
                          <button
                            type="submit"
                            title="Delete section"
                            aria-label={`Delete ${category.name}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-sm text-white shadow-sm transition hover:bg-red-700"
                          >
                            🗑
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel p-5">
          <h2 className="panel-title">Add menu item</h2>
          <form
            action={createMenuItemAction}
            className="mt-3 grid gap-3 md:grid-cols-4"
            id="add-item"
          >
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Section</span>
              <select name="category_id" required className="ui-select">
                <option value="">Section</option>
                {categories?.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              <p className="text-xs text-slate-500">Where this item appears in your menu.</p>
            </label>
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Item name</span>
              <input name="name" required placeholder="Item name" className="ui-input" />
              <p className="text-xs text-slate-500">Customer-facing product name.</p>
            </label>
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Price</span>
              <input name="price" required placeholder="Price" type="number" step="0.01" className="ui-input" />
              <p className="text-xs text-slate-500">Base price before optional add-ons.</p>
            </label>
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Weight (grams)</span>
              <input name="grams" placeholder="Optional" type="number" min={0} className="ui-input" />
              <p className="text-xs text-slate-500">Optional for weighted items.</p>
            </label>
            <label className="space-y-1 md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Description (what this item is)
              </span>
              <input
                name="description"
                placeholder="Example: Grilled chicken burger with sauce and fries"
                className="ui-input"
              />
            </label>
            <label className="space-y-1 md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Contains / ingredients (allergens or key ingredients)
              </span>
              <input
                name="contents"
                placeholder="Example: wheat, milk, sesame, nuts"
                className="ui-input"
              />
            </label>
            <label className="space-y-1 md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Option type (optional)
              </span>
              <input
                name="option_label"
                placeholder="Examples: Size, Quantity, Type, Packing"
                className="ui-input"
              />
              <p className="text-xs text-slate-500">
                Add one option type, then add values and optional extra prices below.
              </p>
            </label>
            <IngredientListField
              name="removable_ingredients"
              label="Remove ingredients (one by one)"
            />
            <IngredientListField
              name="add_ingredients"
              label="Add ingredients (+ optional price)"
              withPrice
            />
            <IngredientListField
              name="option_values"
              label="Options values (Small / Large, 1kg / 2kg, etc.)"
              withPrice
            />
            <div className="md:col-span-2">
              <ImageUploadField name="image_file" />
            </div>
            <button className="btn btn-success md:col-span-4 rounded-xl">Add item</button>
          </form>
        </section>

        <section className="panel p-4 md:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3" id="items-toolbar">
            <h2 className="panel-title">Manage menu items</h2>
            <div className="grid w-full gap-2 sm:flex sm:w-auto sm:flex-wrap" >
              <a href="#add-item" className="btn btn-secondary rounded-xl text-center">
                + Add item
              </a>
              <a href="#items-toolbar" className="btn btn-secondary rounded-xl text-center">
                Toolbar
              </a>
            </div>
          </div>
          <form action="/dashboard/business" method="get" className="mt-3 grid gap-2 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-5">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Search</p>
              <input
                name="q"
                defaultValue={q ?? ""}
                placeholder="Search by item, section, ingredient, option"
                className="ui-input"
              />
              <p className="mt-1 text-xs text-slate-500">Search item names, descriptions, ingredients, and options.</p>
            </div>
            <label className="space-y-1 lg:col-span-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Section</span>
              <select name="category" defaultValue={selectedCategory} className="ui-select">
                <option value="">All sections</option>
                {categories?.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              <p className="text-xs text-slate-500">Filter items by one section.</p>
            </label>
            <label className="space-y-1 lg:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Stock</span>
              <select name="stock" defaultValue={selectedStock} className="ui-select">
                <option value="">All</option>
                <option value="in">In stock</option>
                <option value="out">Out of stock</option>
              </select>
              <p className="text-xs text-slate-500">Show items.</p>
            </label>
            <div className="grid grid-cols-2 gap-2 lg:col-span-2">
              <button className="btn btn-secondary flex-1" type="submit">
                Apply
              </button>
              <a href="/dashboard/business" className="btn btn-secondary flex-1 text-center">
                Clear
              </a>
            </div>
          </form>
          {normalizedQuery ? (
            <p className="mt-2 text-sm text-slate-600">
              Showing {filteredItems.length} result(s) for "<span className="font-semibold">{q}</span>".
            </p>
          ) : null}
          <div className="-mx-4 mt-4 overflow-x-auto sm:mx-0 sm:rounded-2xl sm:border sm:border-slate-200 sm:bg-white sm:shadow-sm">
            <table className="min-w-[760px] text-sm md:min-w-full">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3">Section</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">{item.name}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {categoryNameById.get(item.category_id ?? "") ?? "Uncategorized"}
                    </td>
                    <td className="px-4 py-3 text-slate-700">${item.price.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          item.is_available
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {item.is_available ? "In stock" : "Out of stock"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                        <div className="relative">
                          <input id={`view-${item.id}`} type="checkbox" className="peer hidden" />
                          <label htmlFor={`view-${item.id}`} className="block cursor-pointer rounded-full border border-slate-200 px-2.5 py-1.5 text-center text-[11px] font-semibold text-slate-700 hover:bg-slate-50 sm:text-xs">
                            View
                          </label>
                          <div className="pointer-events-none fixed inset-0 z-40 hidden items-center justify-center bg-slate-900/50 p-4 peer-checked:flex peer-checked:pointer-events-auto">
                            <label htmlFor={`view-${item.id}`} className="absolute inset-0 cursor-pointer" />
                            <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-white p-4 shadow-xl sm:p-5">
                              <h3 className="text-lg font-bold text-slate-900">{item.name}</h3>
                              <p className="mt-1 text-sm text-slate-600">
                                Section: {categoryNameById.get(item.category_id ?? "") ?? "Uncategorized"}
                              </p>
                              <div className="mt-4 space-y-2 text-sm text-slate-700">
                                <p><span className="font-semibold">Price:</span> ${item.price.toFixed(2)}</p>
                                {item.description ? <p><span className="font-semibold">Description:</span> {item.description}</p> : null}
                                {item.contents ? <p><span className="font-semibold">Contains / ingredients:</span> {item.contents}</p> : null}
                                {item.option_label && Array.isArray(item.option_values) && item.option_values.length > 0 ? (
                                  <p>
                                    <span className="font-semibold">{item.option_label} options:</span>{" "}
                                    {item.option_values.map((v: { name?: string; price?: number }) =>
                                      `${v.name ?? ""}${Number(v.price ?? 0) > 0 ? ` (+$${Number(v.price).toFixed(2)})` : ""}`,
                                    ).join(", ")}
                                  </p>
                                ) : null}
                              </div>
                              <div className="mt-4 text-right">
                                <label htmlFor={`view-${item.id}`} className="inline-flex cursor-pointer rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                                  Close
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="relative">
                          <input id={`edit-${item.id}`} type="checkbox" className="peer hidden" />
                          <label htmlFor={`edit-${item.id}`} className="block cursor-pointer rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1.5 text-center text-[11px] font-semibold text-violet-700 hover:bg-violet-100 sm:text-xs">
                            Edit
                          </label>
                          <div className="pointer-events-none fixed inset-0 z-40 hidden items-center justify-center bg-slate-900/50 p-4 peer-checked:flex peer-checked:pointer-events-auto">
                            <label htmlFor={`edit-${item.id}`} className="absolute inset-0 cursor-pointer" />
                            <div className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-auto rounded-2xl bg-white p-4 shadow-xl sm:p-5">
                              <h3 className="text-lg font-bold text-slate-900">Edit: {item.name}</h3>
                              <p className="mt-1 text-sm text-slate-600">
                                Section: {categoryNameById.get(item.category_id ?? "") ?? "Uncategorized"}
                              </p>
                              <form action={updateMenuItemAction} className="mt-4 grid gap-2 md:grid-cols-2">
                                <input type="hidden" name="id" value={item.id} />
                                <input type="hidden" name="current_image_url" value={item.image_url ?? ""} />
                                <label className="space-y-1">
                                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Item name</span>
                                  <input name="name" defaultValue={item.name} placeholder="Item name" className="ui-input" />
                                  <p className="text-xs text-slate-500">Displayed to customers in the menu.</p>
                                </label>
                                <label className="space-y-1">
                                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Description</span>
                                  <input name="description" defaultValue={item.description ?? ""} placeholder="Description (what this item is)" className="ui-input" />
                                  <p className="text-xs text-slate-500">Explain what the item is.</p>
                                </label>
                                <label className="space-y-1">
                                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Price</span>
                                  <input name="price" type="number" step="0.01" defaultValue={item.price} placeholder="Price" className="ui-input" />
                                  <p className="text-xs text-slate-500">Base price before add-ons.</p>
                                </label>
                                <label className="space-y-1">
                                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Weight (grams)</span>
                                  <input name="grams" type="number" min={0} defaultValue={item.grams ?? ""} placeholder="Weight in grams" className="ui-input" />
                                  <p className="text-xs text-slate-500">Optional for weighted products.</p>
                                </label>
                                <label className="space-y-1 md:col-span-2">
                                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Contains / ingredients</span>
                                  <input name="contents" defaultValue={item.contents ?? ""} placeholder="Contains / ingredients (allergens, key contents)" className="ui-input" />
                                  <p className="text-xs text-slate-500">Useful for allergens and key components.</p>
                                </label>
                                <label className="space-y-1 md:col-span-2">
                                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Option type</span>
                                  <input name="option_label" defaultValue={item.option_label ?? ""} placeholder="Option type (Size, Quantity, Type...)" className="ui-input" />
                                  <p className="text-xs text-slate-500">Example: Size, Quantity, Type, or Pack.</p>
                                </label>
                                <IngredientListField
                                  name="removable_ingredients"
                                  label={`Remove ingredients (${categoryNameById.get(item.category_id ?? "") ?? "section"})`}
                                  defaultItems={(item.removable_ingredients ?? [])
                                    .filter(
                                      (entry): entry is { name: string } =>
                                        Boolean(entry && typeof entry.name === "string" && entry.name.trim()),
                                    )
                                    .map((entry) => ({ name: entry.name }))}
                                />
                                <IngredientListField
                                  name="add_ingredients"
                                  label={`Add ingredients (${categoryNameById.get(item.category_id ?? "") ?? "section"}) + optional price`}
                                  withPrice
                                  defaultItems={(item.add_ingredients ?? [])
                                    .filter(
                                      (entry): entry is { name: string; price?: number } =>
                                        Boolean(entry && typeof entry.name === "string" && entry.name.trim()),
                                    )
                                    .map((entry) => ({
                                      name: entry.name,
                                      price: Number.isFinite(Number(entry.price)) ? Number(entry.price) : 0,
                                    }))}
                                />
                                <IngredientListField
                                  name="option_values"
                                  label={`Option values for ${item.option_label || "item"} (+ optional price)`}
                                  withPrice
                                  defaultItems={(item.option_values ?? [])
                                    .filter(
                                      (entry): entry is { name: string; price?: number } =>
                                        Boolean(entry && typeof entry.name === "string" && entry.name.trim()),
                                    )
                                    .map((entry) => ({
                                      name: entry.name,
                                      price: Number.isFinite(Number(entry.price)) ? Number(entry.price) : 0,
                                    }))}
                                />
                                <div className="md:col-span-2">
                                  <ImageUploadField name="image_file" initialImageUrl={item.image_url} label="Update image" />
                                </div>
                                <label className="space-y-1">
                                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Section</span>
                                  <select name="category_id" defaultValue={item.category_id ?? ""} className="ui-select">
                                    {categories?.map((category) => (
                                      <option key={category.id} value={category.id}>{category.name}</option>
                                    ))}
                                  </select>
                                  <p className="text-xs text-slate-500">Move item to another section if needed.</p>
                                </label>
                                <div className="flex items-end">
                                  <button className="btn btn-primary w-full rounded-xl">Save changes</button>
                                </div>
                              </form>
                              <div className="mt-4 text-right">
                                <label htmlFor={`edit-${item.id}`} className="inline-flex cursor-pointer rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                                  Close
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="relative">
                          <input id={`delete-${item.id}`} type="checkbox" className="peer hidden" />
                          <label htmlFor={`delete-${item.id}`} className="block cursor-pointer rounded-full border border-red-200 bg-red-50 px-2.5 py-1.5 text-center text-[11px] font-semibold text-red-700 hover:bg-red-100 sm:text-xs">
                            Delete
                          </label>
                          <div className="pointer-events-none fixed inset-0 z-40 hidden items-center justify-center bg-slate-900/50 p-4 peer-checked:flex peer-checked:pointer-events-auto">
                            <label htmlFor={`delete-${item.id}`} className="absolute inset-0 cursor-pointer" />
                            <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-4 shadow-xl sm:p-5">
                              <h3 className="text-lg font-bold text-slate-900">Delete item?</h3>
                              <p className="mt-2 text-sm text-slate-600">
                                Please confirm deleting <span className="font-semibold">{item.name}</span>. This cannot be undone.
                              </p>
                              <div className="mt-4 flex justify-end gap-2">
                                <label htmlFor={`delete-${item.id}`} className="inline-flex cursor-pointer rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                                  Cancel
                                </label>
                                <form action={deleteMenuItemAction}>
                                  <input type="hidden" name="id" value={item.id} />
                                  <button className="inline-flex rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
                                    Yes, delete
                                  </button>
                                </form>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="relative">
                          <input id={`stock-${item.id}`} type="checkbox" className="peer hidden" />
                          <label
                            htmlFor={`stock-${item.id}`}
                            className={`block cursor-pointer rounded-full px-2.5 py-1.5 text-center text-[11px] font-semibold text-white sm:text-xs ${
                              item.is_available ? "bg-amber-500 hover:bg-amber-600" : "bg-violet-600 hover:bg-violet-700"
                            }`}
                          >
                            {item.is_available ? "Out of Stock" : "In Stock"}
                          </label>
                          <div className="pointer-events-none fixed inset-0 z-40 hidden items-center justify-center bg-slate-900/50 p-4 peer-checked:flex peer-checked:pointer-events-auto">
                            <label htmlFor={`stock-${item.id}`} className="absolute inset-0 cursor-pointer" />
                            <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-4 shadow-xl sm:p-5">
                              <h3 className="text-lg font-bold text-slate-900">Confirm stock change</h3>
                              <p className="mt-2 text-sm text-slate-600">
                                {item.is_available
                                  ? `Mark ${item.name} as out of stock?`
                                  : `Mark ${item.name} as in stock?`}
                              </p>
                              <div className="mt-4 flex justify-end gap-2">
                                <label htmlFor={`stock-${item.id}`} className="inline-flex cursor-pointer rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                                  Cancel
                                </label>
                                <form action={toggleMenuItemAvailabilityAction}>
                                  <input type="hidden" name="id" value={item.id} />
                                  <input type="hidden" name="is_available" value={String(item.is_available)} />
                                  <button className="inline-flex rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700">
                                    Confirm
                                  </button>
                                </form>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredItems.length === 0 ? (
              <p className="p-4 text-sm text-slate-500">No items found for current filters.</p>
            ) : null}
          </div>
        </section>

      </div>
    </main>
  );
}
