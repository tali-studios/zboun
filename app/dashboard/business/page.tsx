import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signOutAction } from "@/app-actions/auth";
import {
  createBrandAction,
  createCategoryAction,
  deleteCategoryAction,
  deleteMenuItemAction,
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
import { RestaurantHoursPanel } from "@/components/restaurant-hours-panel";
import { RestaurantDashboardToast } from "@/components/restaurant-dashboard-toast";
import { parseOpeningHours } from "@/lib/opening-hours";
import { BusinessMenuItemsFilter } from "@/components/business-menu-items-filter";
import { RestaurantMapPin } from "@/components/restaurant-map-pin";
import { RestaurantLocationsPanel } from "@/components/restaurant-locations-panel";
import type { RestaurantLocationRow } from "@/app-actions/restaurant";
import { MenuItemPricingFields } from "@/components/menu-item-pricing-fields";
import { MenuNutritionFields } from "@/components/menu-nutrition-fields";
import { formatMenuNutrition } from "@/lib/menu-nutrition";
import { AddMenuItemForm } from "@/components/add-menu-item-form";
import { BrandManageRow } from "@/components/brand-manage-row";
import { DeliveryFeeSettings } from "@/components/delivery-fee-settings";

export const dynamic = "force-dynamic";

function FormFieldLabel({
  children,
  required,
  optional,
}: {
  children: ReactNode;
  required?: boolean;
  optional?: boolean;
}) {
  return (
    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
      {children}
      {required ? (
        <>
          {" "}
          <span className="text-red-600" aria-hidden="true">
            *
          </span>
          <span className="sr-only">Required.</span>
        </>
      ) : null}
      {optional ? <span className="ml-1 font-normal normal-case text-slate-500">(optional)</span> : null}
    </span>
  );
}

type Props = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    stock?: string;
    jump?: string;
    toast?: string;
    section_name?: string;
    item_name?: string;
    brand_name?: string;
  }>;
};

export default async function RestaurantDashboardPage({ searchParams }: Props) {
  const appUser = await getCurrentUserRole();
  if (!appUser || appUser.role !== "restaurant_admin" || !appUser.restaurant_id) {
    redirect("/dashboard/login");
  }
  const { q, category, stock, toast, section_name: sectionNameRaw, item_name: itemNameRaw, brand_name: brandNameRaw } =
    await searchParams;
  let sectionName: string | undefined = undefined;
  if (typeof sectionNameRaw === "string" && sectionNameRaw.length > 0) {
    try {
      sectionName = decodeURIComponent(sectionNameRaw);
    } catch {
      sectionName = sectionNameRaw;
    }
  }
  let itemName: string | undefined = undefined;
  if (typeof itemNameRaw === "string" && itemNameRaw.length > 0) {
    try {
      itemName = decodeURIComponent(itemNameRaw);
    } catch {
      itemName = itemNameRaw;
    }
  }
  let brandName: string | undefined = undefined;
  if (typeof brandNameRaw === "string" && brandNameRaw.length > 0) {
    try {
      brandName = decodeURIComponent(brandNameRaw);
    } catch {
      brandName = brandNameRaw;
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
        "name, slug, phone, logo_url, banner_url, description, lbp_rate, browse_sections, location, eta_label, business_type, latitude, longitude, opening_hours, is_temporarily_closed, free_delivery, delivery_fee_usd, fast_delivery_enabled, fast_delivery_fee_usd",
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
    "id, name, brand_id, brand_name, description, price, image_url, grams, display_quantity, display_unit, calories, protein_g, contents, sold_by_weight, price_per_kg, weight_step_kg, removable_ingredients, add_ingredients, option_label, option_values, is_available, category_id, menu_brands(id, name, logo_url), categories(name)";
  const itemsSelectLegacy =
    "id, name, brand_name, description, price, image_url, grams, contents, sold_by_weight, price_per_kg, weight_step_kg, removable_ingredients, add_ingredients, is_available, category_id, categories(name)";

  const { data: itemsWithOptions, error: itemsWithOptionsError } = await supabase
    .from("menu_items")
    .select(itemsSelectWithOptions)
    .eq("restaurant_id", appUser.restaurant_id)
    .order("name");

  const { data: legacyItems } =
    itemsWithOptionsError &&
    /option_label|option_values|brand_name|brand_id|menu_brands|display_quantity|display_unit|calories|protein_g/i.test(itemsWithOptionsError.message ?? "")
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
    brand_name?: string | null;
    brand_id?: string | null;
    menu_brands?: { id: string; name: string; logo_url: string | null } | null;
    description: string | null;
    price: number;
    image_url: string | null;
    grams: number | null;
    display_quantity?: number | null;
    display_unit?: string | null;
    calories?: number | null;
    protein_g?: number | null;
    contents: string | null;
    sold_by_weight?: boolean;
    price_per_kg?: number | null;
    weight_step_kg?: number | null;
    removable_ingredients: Array<{ name?: string }>;
    add_ingredients: Array<{ name?: string; price?: number }>;
    option_label?: string | null;
    option_values?: Array<{ name?: string; price?: number }>;
    is_available: boolean;
    category_id: string | null;
    categories?: { name?: string } | null;
  }>;

  const normalizedItems = items.map((item) => {
    const menuBrand = Array.isArray(item.menu_brands)
      ? (item.menu_brands[0] ?? null)
      : (item.menu_brands ?? null);

    return {
      ...item,
      menu_brands: menuBrand,
      brand_id: item.brand_id ?? menuBrand?.id ?? null,
      brand_name: menuBrand?.name ?? item.brand_name ?? null,
      option_label: item.option_label ?? null,
      option_values: Array.isArray(item.option_values) ? item.option_values : [],
    };
  });

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

  const { data: restaurantLocationsRaw } = await supabase
    .from("restaurant_locations")
    .select("id, name, latitude, longitude, address, phone, is_main, position")
    .eq("restaurant_id", appUser.restaurant_id)
    .order("position", { ascending: true });
  const restaurantLocations = (restaurantLocationsRaw ?? []) as RestaurantLocationRow[];

  const { data: menuBrandsRaw } = await supabase
    .from("menu_brands")
    .select("id, name, logo_url")
    .eq("restaurant_id", appUser.restaurant_id)
    .order("name");
  const menuBrands = (menuBrandsRaw ?? []) as Array<{
    id: string;
    name: string;
    logo_url: string | null;
  }>;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const menuUrl = `${appUrl.replace(/\/+$/, "")}/${restaurant?.slug ?? ""}`;
  const businessType = parseBusinessType(restaurant?.business_type ?? "restaurant");
  const businessTypeLabel = getBusinessTypeLabel(businessType);
  const isMenuBusiness = supportsHomeBrowseCategory(businessType);
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
      (item.brand_name ?? "").toLowerCase().includes(normalizedQuery) ||
      (item.menu_brands?.name ?? "").toLowerCase().includes(normalizedQuery) ||
      (item.description ?? "").toLowerCase().includes(normalizedQuery) ||
      (item.contents ?? "").toLowerCase().includes(normalizedQuery) ||
      categoryName.toLowerCase().includes(normalizedQuery) ||
      optionText.includes(normalizedQuery)
    );
  });
  const selectedBrowseSection =
    normalizeBrowseSections(restaurant?.browse_sections ?? [])[0] ?? "Lunch";

  if (!isMenuBusiness) {
    return (
      <>
        <RestaurantDashboardToast toast={toast} sectionName={sectionName} itemName={itemName} brandName={brandName} />
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
      <RestaurantDashboardToast toast={toast} sectionName={sectionName} itemName={itemName} brandName={brandName} />
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
                  <Link
                    href={menuUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn rounded-full bg-white text-violet-700 shadow-sm hover:bg-violet-50"
                  >
                    Open menu
                  </Link>
                  <CopyMenuLinkButton url={menuUrl} />
                  <Link
                    href="/dashboard/business/orders"
                    className="btn rounded-full border border-white/30 bg-white/10 text-white hover:bg-white/20"
                  >
                    Orders
                  </Link>
                  <Link href="/dashboard/business/qr" className="btn rounded-full border border-white/30 bg-white/10 text-white hover:bg-white/20">
                    QR codes
                  </Link>
                  <Link href="/dashboard/business/flyer" className="btn rounded-full border border-white/30 bg-white/10 text-white hover:bg-white/20">
                    Print flyer
                  </Link>
                </>
              ) : null}
              <Link href="/dashboard/billing" className="btn rounded-full border border-white/30 bg-white/10 text-white hover:bg-white/20">
                Billing
              </Link>
              <Link href="/dashboard/change-password" className="btn rounded-full border border-white/30 bg-white/10 text-white hover:bg-white/20">
                Password
              </Link>
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

        {isMenuBusiness ? (
        <>
        <section className="grid gap-4 lg:grid-cols-3">
          <form
            action={updateRestaurantSettingsAction}
            className="flex flex-col gap-4 lg:col-span-2"
          >
          <div className="panel p-5">
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
            </div>
          </div>

          <DeliveryFeeSettings
            freeDeliveryDefault={restaurant?.free_delivery ?? false}
            deliveryFeeDefault={Number(restaurant?.delivery_fee_usd ?? 0)}
            fastDeliveryEnabledDefault={restaurant?.fast_delivery_enabled ?? false}
            fastDeliveryFeeDefault={Number(restaurant?.fast_delivery_fee_usd ?? 0)}
          />

          <div className="panel p-5">
            <button type="submit" className="btn btn-primary w-full rounded-xl sm:w-auto">
              Save store &amp; delivery settings
            </button>
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

        <RestaurantHoursPanel
          openingHours={parseOpeningHours(restaurant?.opening_hours)}
          isTemporarilyClosed={restaurant?.is_temporarily_closed ?? false}
        />
        </>
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

        {isMenuBusiness ? (
          <RestaurantLocationsPanel
            restaurantId={appUser.restaurant_id}
            initialLocations={restaurantLocations}
          />
        ) : null}

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
          <div className="flex items-center justify-between gap-3">
            <h2 className="panel-title">Manage brands</h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {menuBrands.length} brands
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Brands appear in a dropdown when adding menu items. Customers will see the brand name and logo on each item.
          </p>

          <form action={createBrandAction} className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
            <h3 className="text-sm font-bold text-slate-900">Add brand</h3>
            <div className="mt-3 grid gap-4 lg:grid-cols-2">
              <div className="space-y-3">
                <label className="block space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Brand name</span>
                  <input name="name" required placeholder="Brand name" className="ui-input" />
                </label>
                <p className="text-xs text-slate-500">
                  Examples: Häagen-Dazs, Nestlé, Cadbury. Use brands to group items (e.g. ice cream by brand).
                </p>
                <button type="submit" className="btn btn-success w-full rounded-xl sm:w-auto sm:min-w-[10rem]">
                  Add brand
                </button>
              </div>
              <ImageUploadField name="logo_file" label="Brand logo" optional />
            </div>
          </form>

          {menuBrands.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
              No brands yet. Add your first brand above, then pick it when creating grocery or packaged items.
            </p>
          ) : (
            <div className="-mx-4 mt-4 overflow-x-auto sm:mx-0 sm:rounded-2xl sm:border sm:border-slate-200 sm:bg-white sm:shadow-sm">
              <table className="min-w-[640px] text-sm md:min-w-full">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="w-[9.5rem] px-4 py-3">Logo</th>
                    <th className="px-4 py-3">Brand name</th>
                    <th className="w-[1%] whitespace-nowrap px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {menuBrands.map((brand) => (
                    <BrandManageRow key={brand.id} brand={brand} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-violet-100 bg-gradient-to-br from-[#faf9ff] to-white p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="text-base font-bold text-slate-900">Add menu item</h2>
            <p className="mt-0.5 text-xs text-slate-500">Fill in the details below and click "Add item to menu"</p>
          </div>
          <AddMenuItemForm
            categories={(categories ?? []).map((c) => ({ id: c.id, name: c.name }))}
            brands={menuBrands}
          />
        </section>

        <section className="panel p-4 md:p-5">
          <h2 className="panel-title mb-3" id="items-toolbar">
            Manage menu items
          </h2>
          <BusinessMenuItemsFilter
            categories={(categories ?? []).map((c) => ({ id: c.id, name: c.name }))}
            initialQ={q ?? ""}
            initialCategory={selectedCategory}
            initialStock={selectedStock}
          />
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
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {item.name}
                      {item.brand_name ? (
                        <span className="mt-0.5 block text-xs font-normal text-slate-500">{item.brand_name}</span>
                      ) : null}
                    </td>
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
                      <div className="flex min-w-0 flex-nowrap items-center justify-start gap-2">
                        <div className="relative">
                          <input id={`view-${item.id}`} type="checkbox" className="peer hidden" />
                          <label
                            htmlFor={`view-${item.id}`}
                            aria-label="View item details"
                            title="View item details"
                            className="inline-flex cursor-pointer items-center justify-center rounded-full border border-slate-200 px-2.5 py-1.5 text-center text-[11px] font-semibold text-slate-700 hover:bg-slate-50 max-sm:h-10 max-sm:w-10 max-sm:min-w-10 max-sm:p-0 sm:text-xs"
                          >
                            <svg className="h-4 w-4 shrink-0 sm:hidden" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="hidden sm:inline">View</span>
                          </label>
                          <div className="pointer-events-none fixed inset-0 z-40 hidden items-center justify-center bg-slate-900/50 p-4 peer-checked:flex peer-checked:pointer-events-auto">
                            <label htmlFor={`view-${item.id}`} className="absolute inset-0 cursor-pointer" />
                            <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-white p-4 shadow-xl sm:p-5">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1 pr-2">
                                  <h3 className="text-lg font-bold text-slate-900">{item.name}</h3>
                                  <p className="mt-1 text-sm text-slate-600">
                                    Section: {categoryNameById.get(item.category_id ?? "") ?? "Uncategorized"}
                                  </p>
                                </div>
                                <label
                                  htmlFor={`view-${item.id}`}
                                  className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-500 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-800"
                                  aria-label="Close"
                                  title="Close"
                                >
                                  <span className="text-2xl leading-none" aria-hidden>
                                    ×
                                  </span>
                                </label>
                              </div>
                              <div className="mt-4 space-y-2 text-sm text-slate-700">
                                <p><span className="font-semibold">Price:</span> ${item.price.toFixed(2)}</p>
                                {item.brand_name ? <p><span className="font-semibold">Brand:</span> {item.brand_name}</p> : null}
                                {item.description ? <p><span className="font-semibold">Description:</span> {item.description}</p> : null}
                                {item.contents ? <p><span className="font-semibold">Contains / ingredients:</span> {item.contents}</p> : null}
                                {formatMenuNutrition(item.calories, item.protein_g) ? (
                                  <p><span className="font-semibold">Nutrition:</span> {formatMenuNutrition(item.calories, item.protein_g)}</p>
                                ) : null}
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
                                <label htmlFor={`view-${item.id}`} title="Close" className="inline-flex cursor-pointer rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                                  Close
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="relative">
                          <input id={`edit-${item.id}`} type="checkbox" className="peer hidden" />
                          <label
                            htmlFor={`edit-${item.id}`}
                            aria-label="Edit item"
                            title="Edit this item"
                            className="inline-flex cursor-pointer items-center justify-center rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1.5 text-center text-[11px] font-semibold text-violet-700 hover:bg-violet-100 max-sm:h-10 max-sm:w-10 max-sm:min-w-10 max-sm:p-0 sm:text-xs"
                          >
                            <svg className="h-4 w-4 shrink-0 sm:hidden" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                            <span className="hidden sm:inline">Edit</span>
                          </label>
                          <div className="pointer-events-none fixed inset-0 z-40 hidden items-center justify-center bg-slate-900/50 p-4 peer-checked:flex peer-checked:pointer-events-auto">
                            <label htmlFor={`edit-${item.id}`} className="absolute inset-0 cursor-pointer" />
                            <div className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-auto rounded-2xl bg-white p-4 shadow-xl sm:p-5">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1 pr-2">
                                  <h3 className="text-lg font-bold text-slate-900">Edit: {item.name}</h3>
                                  <p className="mt-1 text-sm text-slate-600">
                                    Section: {categoryNameById.get(item.category_id ?? "") ?? "Uncategorized"}
                                  </p>
                                </div>
                                <label
                                  htmlFor={`edit-${item.id}`}
                                  className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-500 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-800"
                                  aria-label="Close"
                                  title="Close"
                                >
                                  <span className="text-2xl leading-none" aria-hidden>
                                    ×
                                  </span>
                                </label>
                              </div>
                              <form action={updateMenuItemAction} className="mt-4 grid gap-3 md:grid-cols-2">
                                <input type="hidden" name="id" value={item.id} />
                                <input type="hidden" name="current_image_url" value={item.image_url ?? ""} />
                                <label className="space-y-1">
                                  <FormFieldLabel required>Section</FormFieldLabel>
                                  <select name="category_id" required defaultValue={item.category_id ?? ""} className="ui-select">
                                    {categories?.map((category) => (
                                      <option key={category.id} value={category.id}>{category.name}</option>
                                    ))}
                                  </select>
                                  <p className="text-xs text-slate-500">Where this item appears in your menu.</p>
                                </label>
                                <label className="space-y-1">
                                  <FormFieldLabel required>Item name</FormFieldLabel>
                                  <input name="name" required defaultValue={item.name} placeholder="Item name" className="ui-input" />
                                  <p className="text-xs text-slate-500">Displayed to customers in the menu.</p>
                                </label>
                                <label className="space-y-1">
                                  <FormFieldLabel optional>Brand</FormFieldLabel>
                                  <select
                                    name="brand_id"
                                    defaultValue={item.brand_id ?? ""}
                                    className="ui-select"
                                  >
                                    <option value="">No brand</option>
                                    {menuBrands.map((brand) => (
                                      <option key={brand.id} value={brand.id}>
                                        {brand.name}
                                      </option>
                                    ))}
                                  </select>
                                  <p className="text-xs text-slate-500">
                                    Pick from your saved brands (manage them above).
                                  </p>
                                </label>
                                <label className="space-y-1 md:col-span-2">
                                  <FormFieldLabel optional>Description</FormFieldLabel>
                                  <input name="description" defaultValue={item.description ?? ""} placeholder="Description (what this item is)" className="ui-input" />
                                  <p className="text-xs text-slate-500">Explain what the item is.</p>
                                </label>
                                <MenuItemPricingFields
                                  idPrefix={`edit-${item.id}-qty`}
                                  defaultPrice={item.price}
                                  defaultGrams={item.grams}
                                  defaultDisplayQuantity={item.display_quantity}
                                  defaultDisplayUnit={item.display_unit}
                                  defaultSoldByWeight={Boolean((item as { sold_by_weight?: boolean }).sold_by_weight)}
                                  defaultPricePerKg={(item as { price_per_kg?: number | null }).price_per_kg}
                                  defaultWeightStepKg={(item as { weight_step_kg?: number | null }).weight_step_kg}
                                />
                                <label className="space-y-1 md:col-span-2">
                                  <FormFieldLabel optional>Contains / ingredients</FormFieldLabel>
                                  <input name="contents" defaultValue={item.contents ?? ""} placeholder="Contains / ingredients (allergens, key contents)" className="ui-input" />
                                  <p className="text-xs text-slate-500">Useful for allergens and key components.</p>
                                </label>
                                <div className="md:col-span-2">
                                  <MenuNutritionFields
                                    idPrefix={`edit-${item.id}-nutrition`}
                                    defaultCalories={item.calories}
                                    defaultProteinG={item.protein_g}
                                  />
                                </div>
                                <label className="space-y-1 md:col-span-2">
                                  <FormFieldLabel optional>Option type</FormFieldLabel>
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
                                  label={`Add ingredients (${categoryNameById.get(item.category_id ?? "") ?? "section"}) — extra price per line`}
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
                                  label={`Option values for ${item.option_label || "item"}`}
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
                                  <ImageUploadField
                                    name="image_file"
                                    initialImageUrl={item.image_url}
                                    label="Update image"
                                    optional
                                  />
                                </div>
                                <div className="md:col-span-2 border-t border-slate-100 pt-1">
                                  <button type="submit" className="btn btn-primary w-full rounded-xl py-3">
                                    Save changes
                                  </button>
                                </div>
                              </form>
                              <div className="mt-3 flex justify-end border-t border-slate-100 pt-3">
                                <label htmlFor={`edit-${item.id}`} title="Close" className="inline-flex cursor-pointer rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                                  Close
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="relative">
                          <input id={`delete-${item.id}`} type="checkbox" className="peer hidden" />
                          <label
                            htmlFor={`delete-${item.id}`}
                            aria-label="Delete item"
                            title="Delete this item"
                            className="inline-flex cursor-pointer items-center justify-center rounded-full border border-red-200 bg-red-50 px-2.5 py-1.5 text-center text-[11px] font-semibold text-red-700 hover:bg-red-100 max-sm:h-10 max-sm:w-10 max-sm:min-w-10 max-sm:p-0 sm:text-xs"
                          >
                            <svg className="h-4 w-4 shrink-0 sm:hidden" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                            <span className="hidden sm:inline">Delete</span>
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
                            aria-label={item.is_available ? "Mark out of stock" : "Mark in stock"}
                            title={item.is_available ? "Mark as out of stock" : "Mark as in stock"}
                            className={`inline-flex cursor-pointer items-center justify-center rounded-full px-2.5 py-1.5 text-center text-[11px] font-semibold text-white max-sm:h-10 max-sm:w-10 max-sm:min-w-10 max-sm:p-0 sm:text-xs ${
                              item.is_available ? "bg-amber-500 hover:bg-amber-600" : "bg-violet-600 hover:bg-violet-700"
                            }`}
                          >
                            {item.is_available ? (
                              <svg className="h-4 w-4 shrink-0 sm:hidden" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                              </svg>
                            ) : (
                              <svg className="h-4 w-4 shrink-0 sm:hidden" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                            <span className="hidden sm:inline">{item.is_available ? "Out of Stock" : "In Stock"}</span>
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
