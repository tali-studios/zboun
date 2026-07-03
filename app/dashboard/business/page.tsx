import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signOutAction } from "@/app-actions/auth";
import {
  deleteMenuItemAction,
  toggleMenuItemAvailabilityAction,
  updateMenuItemAction,
} from "@/app-actions/restaurant";
import { StoreSettingsForm, StoreSettingsSubmitButton } from "@/components/store-settings-form";
import { getCurrentUserRole, getRestaurantMenuCouponCodes, getRestaurantMenuPromotions } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { CopyMenuLinkButton } from "@/components/copy-menu-link-button";
import { BusinessCategoryDashboard } from "@/components/business-category-dashboard";
import { ImageUploadField } from "@/components/image-upload-field";
import { IngredientListField } from "@/components/ingredient-list-field";
import { normalizeBrowseSections, getBrowseSubTags, getRawBrowseSectionValues, BROWSE_SECTION_ICONS } from "@/lib/browse-sections";
import type { BrowseSection } from "@/lib/browse-sections";
import { getBusinessTypeLabel, hasCatalogDashboard, parseBusinessType } from "@/lib/business-types";
import { formatBrowseSectionsLabel, getStorefrontActionLabels, STORE_ADMIN_LABEL } from "@/lib/browse-sections";
import { resolveStoreItemProfile } from "@/lib/store-item-profile";
import { RestaurantHoursPanel } from "@/components/restaurant-hours-panel";
import { RestaurantDashboardToast } from "@/components/restaurant-dashboard-toast";
import { parseOpeningHours } from "@/lib/opening-hours";
import { BusinessMenuItemsToolbar } from "@/components/business-menu-items-toolbar";
import { parseMenuItemsSort, sortMenuItems } from "@/lib/menu-items-admin";
import { DashboardSectionJump } from "@/components/dashboard-section-jump";
import { MenuItemStockQuickEdit } from "@/components/menu-item-stock-quick-edit";
import { RestaurantLocationsPanel } from "@/components/restaurant-locations-panel";
import type { RestaurantLocationRow } from "@/app-actions/restaurant";
import { MenuItemPricingFields } from "@/components/menu-item-pricing-fields";
import { MenuNutritionFields } from "@/components/menu-nutrition-fields";
import { MenuItemOptionsFields } from "@/components/menu-item-options-fields";
import { MenuItemStockFields } from "@/components/menu-item-stock-fields";
import { getMenuItemStockAlertLevel, isMenuItemLowStock } from "@/lib/menu-item-stock";
import { stockAlertBadgeClass, stockAlertBadgeLabel } from "@/lib/menu-item-stock-alerts";
import { formatMenuNutrition, isNutritionColumnMigrationError } from "@/lib/menu-nutrition";
import { resolveMenuItemBrandId } from "@/lib/menu-brands";
import { AddMenuItemForm } from "@/components/add-menu-item-form";
import { BrandManagePanel } from "@/components/brand-manage-panel";
import { SectionManagePanel } from "@/components/section-manage-panel";
import { MenuPromotionsPanel } from "@/components/menu-promotions-panel";
import { MenuCouponCodesPanel } from "@/components/menu-coupon-codes-panel";
import { DeliveryFeeSettings } from "@/components/delivery-fee-settings";
import { MenuThemePicker } from "@/components/menu-theme-picker";
import { MENU_ITEMS_ADMIN_PAGE_SIZE } from "@/lib/dashboard-admin";
import {
  loadRestaurantForAdminDashboard,
  resolveRestaurantLocationLabel,
  syncRestaurantProfileFromMainBranch,
} from "@/lib/restaurant-profile";

export const dynamic = "force-dynamic";

function buildMenuItemsListHref(opts: {
  q?: string;
  category?: string;
  stock?: string;
  sort?: string;
  page?: number;
}) {
  const params = new URLSearchParams();
  if (opts.q?.trim()) params.set("q", opts.q.trim());
  if (opts.category?.trim()) params.set("category", opts.category.trim());
  if (opts.stock?.trim()) params.set("stock", opts.stock.trim());
  if (opts.sort?.trim() && opts.sort !== "name_asc") params.set("sort", opts.sort.trim());
  if (opts.page && opts.page > 1) params.set("page", String(opts.page));
  const qs = params.toString();
  return qs ? `/dashboard/business?${qs}#items-toolbar` : `/dashboard/business#items-toolbar`;
}

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
    sort?: string;
    page?: string;
    jump?: string;
    toast?: string;
    section_name?: string;
    sections_count?: string;
    item_name?: string;
    brand_name?: string;
  }>;
};

export default async function RestaurantDashboardPage({ searchParams }: Props) {
  const appUser = await getCurrentUserRole();
  if (!appUser || appUser.role !== "restaurant_admin" || !appUser.restaurant_id) {
    redirect("/dashboard/login");
  }
  const { q, category, stock, sort: sortRaw, page: pageRaw, jump, toast, section_name: sectionNameRaw, sections_count: sectionsCountRaw, item_name: itemNameRaw, brand_name: brandNameRaw } =
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
  const sectionsCount =
    typeof sectionsCountRaw === "string" && sectionsCountRaw.length > 0
      ? Number(sectionsCountRaw)
      : null;

  const supabase = await createServerSupabaseClient();
  const restaurantId = appUser.restaurant_id;
  const today = new Date().toISOString().split("T")[0];

  const [restaurantRaw, { data: categories }, { data: addonRows }, menuPromotions, menuCouponCodes] = await Promise.all([
    loadRestaurantForAdminDashboard(supabase, restaurantId),
    supabase
      .from("categories")
      .select("id, name, position")
      .eq("restaurant_id", restaurantId)
      .order("position"),
    supabase
      .from("restaurant_addons")
      .select("addon_key, is_enabled")
      .eq("restaurant_id", restaurantId),
    getRestaurantMenuPromotions(restaurantId),
    getRestaurantMenuCouponCodes(restaurantId),
  ]);

  const addonOn = (key: string) =>
    Boolean(addonRows?.find((addon) => addon.addon_key === key)?.is_enabled);

  const [
    { data: inventoryItems },
    { data: accountingExpenses },
    { data: posOrders },
    { data: crmCustomers },
    { data: loyaltyMembers },
    { data: todayReservations },
    { data: upcomingBookings },
    { data: pmsRooms },
    { data: ecommerceOrders },
    { data: fleetDeliveries },
    { data: clubMembers },
  ] = await Promise.all([
    addonOn("inventory")
      ? supabase
          .from("inventory_items")
          .select("id, current_qty, min_qty")
          .eq("restaurant_id", restaurantId)
      : Promise.resolve({ data: [] as { id: string; current_qty: number; min_qty: number }[] }),
    addonOn("accounting")
      ? supabase
          .from("accounting_expenses")
          .select("id, amount, occurred_at")
          .eq("restaurant_id", restaurantId)
          .order("occurred_at", { ascending: false })
          .limit(100)
      : Promise.resolve({ data: [] as { id: string; amount: number; occurred_at: string }[] }),
    addonOn("pos")
      ? supabase
          .from("pos_orders")
          .select("id, status, created_at")
          .eq("restaurant_id", restaurantId)
          .order("created_at", { ascending: false })
          .limit(100)
      : Promise.resolve({ data: [] as { id: string; status: string; created_at: string }[] }),
    addonOn("crm")
      ? supabase.from("crm_customers").select("id, is_vip, total_spend").eq("restaurant_id", restaurantId)
      : Promise.resolve({ data: [] as { id: string; is_vip: boolean; total_spend: number }[] }),
    addonOn("loyalty")
      ? supabase.from("loyalty_members").select("id, tier, is_active").eq("restaurant_id", restaurantId)
      : Promise.resolve({ data: [] as { id: string; tier: string; is_active: boolean }[] }),
    addonOn("events")
      ? supabase
          .from("table_reservations")
          .select("id, status")
          .eq("restaurant_id", restaurantId)
          .eq("reservation_date", today)
      : Promise.resolve({ data: [] as { id: string; status: string }[] }),
    addonOn("events")
      ? supabase
          .from("event_bookings")
          .select("id, status, event_date")
          .eq("restaurant_id", restaurantId)
          .gte("event_date", today)
          .not("status", "in", '("cancelled","completed")')
      : Promise.resolve({ data: [] as { id: string; status: string; event_date: string }[] }),
    addonOn("pms")
      ? supabase.from("pms_rooms").select("id, status, is_active").eq("restaurant_id", restaurantId)
      : Promise.resolve({ data: [] as { id: string; status: string; is_active: boolean }[] }),
    addonOn("ecommerce")
      ? supabase
          .from("ecommerce_orders")
          .select("id, status, payment_status")
          .eq("restaurant_id", restaurantId)
          .not("status", "in", '("delivered","cancelled")')
          .limit(200)
      : Promise.resolve({ data: [] as { id: string; status: string; payment_status: string }[] }),
    addonOn("fleet")
      ? supabase
          .from("fleet_deliveries")
          .select("id, status")
          .eq("restaurant_id", restaurantId)
          .not("status", "in", '("delivered","failed","cancelled")')
          .limit(100)
      : Promise.resolve({ data: [] as { id: string; status: string }[] }),
    addonOn("club")
      ? supabase.from("club_members").select("id, status").eq("restaurant_id", restaurantId).limit(500)
      : Promise.resolve({ data: [] as { id: string; status: string }[] }),
  ]);

  const itemsSelectBase =
    "id, name, brand_id, brand_name, description, price, image_url, grams, display_quantity, display_unit, contents, sold_by_weight, price_per_kg, weight_step_kg, removable_ingredients, add_ingredients, option_label, option_values, is_available, category_id, menu_brands(id, name, logo_url), categories(name)";
  const itemsSelectWithStock = `${itemsSelectBase}, track_stock, stock_quantity`;
  const itemsSelectWithStockAlerts = `${itemsSelectWithStock}, stock_alert_warning_qty, stock_alert_urgent_qty, stock_alert_critical_qty`;
  const itemsSelectWithNutrition = `${itemsSelectWithStockAlerts}, calories, protein_g`;
  const itemsSelectLegacy =
    "id, name, brand_id, brand_name, description, price, image_url, grams, contents, sold_by_weight, price_per_kg, weight_step_kg, removable_ingredients, add_ingredients, is_available, category_id, categories(name)";

  const { data: itemsWithOptions, error: itemsWithOptionsError } = await supabase
    .from("menu_items")
    .select(itemsSelectWithNutrition)
    .eq("restaurant_id", appUser.restaurant_id)
    .order("name");

  let itemsRows: unknown[] | null = itemsWithOptions;
  let itemsQueryError = itemsWithOptionsError;

  if (itemsQueryError && isNutritionColumnMigrationError(itemsQueryError.message, itemsQueryError.code)) {
    const retry = await supabase
      .from("menu_items")
      .select(itemsSelectWithStockAlerts)
      .eq("restaurant_id", appUser.restaurant_id)
      .order("name");
    itemsRows = retry.data;
    itemsQueryError = retry.error;
  }

  if (
    itemsQueryError &&
    /stock_alert_/i.test(itemsQueryError.message ?? "")
  ) {
    const retry = await supabase
      .from("menu_items")
      .select(itemsSelectWithStock)
      .eq("restaurant_id", appUser.restaurant_id)
      .order("name");
    itemsRows = retry.data;
    itemsQueryError = retry.error;
  }

  if (
    itemsQueryError &&
    /track_stock|stock_quantity/i.test(itemsQueryError.message ?? "")
  ) {
    const retry = await supabase
      .from("menu_items")
      .select(itemsSelectBase)
      .eq("restaurant_id", appUser.restaurant_id)
      .order("name");
    itemsRows = retry.data;
    itemsQueryError = retry.error;
  }

  const { data: legacyItems } =
    itemsQueryError &&
    /option_label|option_values|brand_name|brand_id|menu_brands|display_quantity|display_unit/i.test(
      itemsQueryError.message ?? "",
    )
      ? await supabase
          .from("menu_items")
          .select(itemsSelectLegacy)
          .eq("restaurant_id", appUser.restaurant_id)
          .order("name")
      : { data: null };

  const items = (itemsRows ??
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
    track_stock?: boolean;
    stock_quantity?: number | null;
    stock_alert_warning_qty?: number | null;
    stock_alert_urgent_qty?: number | null;
    stock_alert_critical_qty?: number | null;
    is_available: boolean;
    category_id: string | null;
    categories?: { name?: string } | null;
  }>;

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

  const normalizedItems = items.map((item) => {
    const menuBrand = Array.isArray(item.menu_brands)
      ? (item.menu_brands[0] ?? null)
      : (item.menu_brands ?? null);
    const resolvedBrandId = resolveMenuItemBrandId(
      {
        brand_id: item.brand_id,
        brand_name: item.brand_name,
        menu_brands: menuBrand,
      },
      menuBrands,
    );

    return {
      ...item,
      menu_brands: menuBrand,
      brand_id: resolvedBrandId || null,
      brand_name: menuBrand?.name ?? item.brand_name ?? null,
      option_label: item.option_label ?? null,
      option_values: Array.isArray(item.option_values) ? item.option_values : [],
    };
  });

  const menuItemsLowStockCount = items.filter((item) => isMenuItemLowStock(item)).length;

  const inventoryEnabled = addonOn("inventory");
  const inventoryLowStock = inventoryEnabled
    ? (inventoryItems ?? []).filter((i) => Number(i.current_qty) < Number(i.min_qty)).length
    : 0;
  const inventoryOutOfStock = inventoryEnabled
    ? (inventoryItems ?? []).filter((i) => Number(i.current_qty) <= 0).length
    : 0;
  const accountingEnabled = addonOn("accounting");
  const currentMonthStart = new Date();
  currentMonthStart.setDate(1);
  currentMonthStart.setHours(0, 0, 0, 0);
  const accountingMonthExpenses = accountingEnabled
    ? (accountingExpenses ?? [])
        .filter((expense) => new Date(expense.occurred_at) >= currentMonthStart)
        .reduce((sum, expense) => sum + Number(expense.amount), 0)
    : 0;
  const posEnabled = addonOn("pos");
  const posOpenOrders = posEnabled ? (posOrders ?? []).filter((order) => order.status === "open").length : 0;
  const crmEnabled = addonOn("crm");
  const crmTotalCustomers = crmEnabled ? (crmCustomers ?? []).length : 0;
  const crmVipCount = crmEnabled ? (crmCustomers ?? []).filter((c) => c.is_vip).length : 0;
  const loyaltyEnabled = addonOn("loyalty");
  const loyaltyActiveMembers = loyaltyEnabled ? (loyaltyMembers ?? []).filter((m) => m.is_active).length : 0;
  const loyaltyNonStandard = loyaltyEnabled ? (loyaltyMembers ?? []).filter((m) => m.tier !== "standard" && m.is_active).length : 0;
  const eventsEnabled = addonOn("events");
  const pmsEnabled = addonOn("pms");
  const pmsActiveRooms = pmsEnabled ? (pmsRooms ?? []).filter((r) => r.is_active) : [];
  const pmsOccupied = pmsActiveRooms.filter((r) => r.status === "occupied").length;
  const pmsOccupancyRate = pmsActiveRooms.length > 0 ? Math.round((pmsOccupied / pmsActiveRooms.length) * 100) : 0;
  const eventsTodayCount = eventsEnabled ? (todayReservations ?? []).filter((r) => r.status !== "cancelled").length : 0;
  const eventsUpcomingCount = eventsEnabled ? (upcomingBookings ?? []).length : 0;
  const ecommerceEnabled = addonOn("ecommerce");
  const ecommercePendingOrders = ecommerceEnabled ? (ecommerceOrders ?? []).filter((o) => o.status === "pending").length : 0;
  const ecommerceActiveOrders = ecommerceEnabled ? (ecommerceOrders ?? []).length : 0;
  const fleetEnabled = addonOn("fleet");
  const fleetActiveDeliveries = fleetEnabled ? (fleetDeliveries ?? []).length : 0;
  const clubEnabled = addonOn("club");
  const clubActiveMembers = clubEnabled ? (clubMembers ?? []).filter((m) => m.status === "active").length : 0;

  const { data: restaurantLocationsRaw } = await supabase
    .from("restaurant_locations")
    .select("id, name, latitude, longitude, address, phone, is_main, position")
    .eq("restaurant_id", appUser.restaurant_id)
    .order("position", { ascending: true });
  const restaurantLocations = (restaurantLocationsRaw ?? []) as RestaurantLocationRow[];

  let restaurant = restaurantRaw;
  if (restaurant) {
    const synced = await syncRestaurantProfileFromMainBranch(
      supabase,
      appUser.restaurant_id,
      restaurant,
      restaurantLocations,
    );
    restaurant = { ...restaurant, ...synced };
  }
  const storeLocationLabel = resolveRestaurantLocationLabel(restaurant?.location, restaurantLocations);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const menuUrl = `${appUrl.replace(/\/+$/, "")}/${restaurant?.slug ?? ""}`;
  const businessType = parseBusinessType(restaurant?.business_type ?? "retail_store");
  const categoryLabel = formatBrowseSectionsLabel(restaurant?.browse_sections);
  const storefrontLabels = getStorefrontActionLabels(restaurant?.browse_sections);
  const isMenuBusiness = hasCatalogDashboard(businessType);
  const categoryNameById = new Map((categories ?? []).map((category) => [category.id, category.name]));
  const normalizedQuery = (q ?? "").trim().toLowerCase();
  const selectedCategory = (category ?? "").trim();
  const selectedStock = (stock ?? "").trim();
  const selectedSort = parseMenuItemsSort(sortRaw);
  const filteredItems = normalizedItems.filter((item) => {
    if (selectedCategory && item.category_id !== selectedCategory) return false;
    if (selectedStock === "in" && !item.is_available) return false;
    if (selectedStock === "out" && item.is_available) return false;
    if (selectedStock === "low" && !isMenuItemLowStock(item)) return false;
    if (selectedStock === "tracked" && !item.track_stock) return false;
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
  const sortedItems = sortMenuItems(filteredItems, selectedSort, categoryNameById);
  const itemsPage = Math.max(1, Number.parseInt(String(pageRaw ?? "1"), 10) || 1);
  const itemsTotalPages = Math.max(1, Math.ceil(sortedItems.length / MENU_ITEMS_ADMIN_PAGE_SIZE));
  const itemsSafePage = Math.min(itemsPage, itemsTotalPages);
  const itemsPageStart = (itemsSafePage - 1) * MENU_ITEMS_ADMIN_PAGE_SIZE;
  const pagedItems = sortedItems.slice(itemsPageStart, itemsPageStart + MENU_ITEMS_ADMIN_PAGE_SIZE);
  const itemsRangeStart = sortedItems.length === 0 ? 0 : itemsPageStart + 1;
  const itemsRangeEnd = Math.min(itemsPageStart + MENU_ITEMS_ADMIN_PAGE_SIZE, sortedItems.length);
  const listHrefBase = { q: q ?? "", category: selectedCategory, stock: selectedStock, sort: selectedSort };
  const rawBrowseSections = getRawBrowseSectionValues(restaurant?.browse_sections ?? []);
  const selectedBrowseSections = normalizeBrowseSections(rawBrowseSections);
  const selectedBrowseSubTags = getBrowseSubTags(rawBrowseSections);
  const browseSectionsForForm =
    selectedBrowseSections.length > 0 ? selectedBrowseSections : (["Food & Restaurants"] as const);
  const itemProfileBadgeSections: BrowseSection[] =
    selectedBrowseSections.length > 0
      ? selectedBrowseSections
      : businessType === "restaurant" || businessType === "cloud_kitchen"
      ? ["Food & Restaurants"]
      : ["General Shops"];
  const itemProfile = resolveStoreItemProfile(itemProfileBadgeSections);

  if (!isMenuBusiness) {
    return (
      <>
        <RestaurantDashboardToast toast={toast} sectionName={sectionName} sectionsCount={sectionsCount} itemName={itemName} brandName={brandName} />
        <BusinessCategoryDashboard
          businessType={businessType}
          businessTypeLabel={categoryLabel}
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
      <DashboardSectionJump target={jump} />
      <RestaurantDashboardToast toast={toast} sectionName={sectionName} sectionsCount={sectionsCount} itemName={itemName} brandName={brandName} />
      <div className="mx-auto max-w-7xl space-y-5">
        {/* Dashboard header */}
        <header className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-700 via-violet-600 to-fuchsia-600 p-5 text-white shadow-lg shadow-violet-600/30 md:p-6">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl"
          />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-violet-200">{STORE_ADMIN_LABEL}</p>
              <h1 className="mt-1 text-xl font-bold md:text-2xl">{restaurant?.name}</h1>
              <p className="mt-0.5 text-xs text-violet-200 md:text-sm">
                {categoryLabel}
                {isMenuBusiness ? (
                  <>
                    {" "}
                    · {storefrontLabels.slugLabel}:{" "}
                    <span className="font-medium text-white">/{restaurant?.slug}</span>
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
                    {storefrontLabels.open}
                  </Link>
                  <CopyMenuLinkButton url={menuUrl} label={storefrontLabels.copyLink} />
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
                  <Link href="#items-toolbar" className="btn rounded-full border border-white/30 bg-white/10 text-white hover:bg-white/20">
                    Menu items
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
        <section>
          <StoreSettingsForm className="panel divide-y divide-slate-100 overflow-hidden p-0">
          <div className="p-5">
            <h2 className="panel-title">Store settings</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <input type="hidden" name="current_logo_url" value={restaurant?.logo_url ?? ""} />
              <input type="hidden" name="current_banner_url" value={restaurant?.banner_url ?? ""} />
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Store Name</span>
                <input name="name" defaultValue={restaurant?.name} placeholder="Store name" className="ui-input" />
                <p className="text-xs text-slate-500">Public name shown at the top of your menu.</p>
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
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Location / area</span>
                <input
                  name="location"
                  defaultValue={storeLocationLabel}
                  placeholder="e.g. Mar Mikhael"
                  className="ui-input"
                />
                <p className="text-xs text-slate-500">Neighborhood or short address label for customers.</p>
              </label>
              <label className="space-y-1">
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
              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Guest checkout</span>
                <label className="ui-input flex cursor-pointer items-center gap-2.5">
                  <input
                    type="checkbox"
                    name="allow_guest_checkout"
                    value="true"
                    defaultChecked={restaurant?.allow_guest_checkout ?? false}
                    className="h-4 w-4 shrink-0 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                  />
                  <span className="text-sm text-slate-800">Allow orders without signing in</span>
                </label>
                <p className="text-xs text-slate-500">When off, customers must create an account before checkout.</p>
              </div>
              <label className="space-y-1 md:col-span-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Store Description</span>
                <textarea
                  name="description"
                  defaultValue={restaurant?.description ?? ""}
                  placeholder="Short about text shown under your store name on your page"
                  className="ui-input min-h-24"
                />
                <p className="text-xs text-slate-500">Example: Fresh pasta and handmade sauces since 2015.</p>
              </label>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 md:col-span-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Business categories</p>
                <p className="mt-1 text-xs text-slate-500">
                  Where customers find you on the home page. Contact Zboun support to change your categories.
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {browseSectionsForForm.map((section) => (
                    <span
                      key={section}
                      className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200"
                    >
                      {BROWSE_SECTION_ICONS[section]} {section}
                    </span>
                  ))}
                  {selectedBrowseSubTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 ring-1 ring-violet-100"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                {rawBrowseSections.map((value) => (
                  <input key={value} type="hidden" name="browse_sections" value={value} />
                ))}
              </div>
              <MenuThemePicker defaultColor={restaurant?.menu_theme_color ?? null} />
              <div className="md:col-span-3">
                <ImageUploadField
                  name="logo_file"
                  label="Store logo"
                  initialImageUrl={restaurant?.logo_url ?? null}
                />
              </div>
              <div className="md:col-span-3">
                <ImageUploadField
                  name="banner_file"
                  label="Store banner image"
                  initialImageUrl={restaurant?.banner_url ?? null}
                />
                <p className="mt-1 text-xs text-slate-500">Recommended wide image (for top profile header on menu page).</p>
              </div>
            </div>
          </div>

          <div className="p-5">
            <DeliveryFeeSettings
              freeDeliveryDefault={restaurant?.free_delivery ?? false}
              deliveryFeeDefault={Number(restaurant?.delivery_fee_usd ?? 0)}
              fastDeliveryEnabledDefault={restaurant?.fast_delivery_enabled ?? false}
              fastDeliveryFeeDefault={Number(restaurant?.fast_delivery_fee_usd ?? 0)}
              deliveryRadiusDefault={restaurant?.delivery_radius_km ?? null}
            />
          </div>

          <div className="bg-slate-50/60 p-5">
            <StoreSettingsSubmitButton className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70">
              Save store &amp; delivery settings
            </StoreSettingsSubmitButton>
          </div>
          </StoreSettingsForm>
        </section>

        <SectionManagePanel
          categories={(categories ?? []).map((c) => ({
            id: c.id,
            name: c.name,
            position: c.position ?? 0,
          }))}
        />

        <RestaurantHoursPanel
          openingHours={parseOpeningHours(restaurant?.opening_hours)}
          isTemporarilyClosed={restaurant?.is_temporarily_closed ?? false}
        />
        </>
        ) : (
          <section className="panel p-5">
            <h2 className="panel-title">Business profile</h2>
            <p className="mt-1 text-sm text-slate-600">
              This dashboard is tailored for {getBusinessTypeLabel(businessType)}. Menu and home-browse tools are hidden
              for non-restaurant businesses.
            </p>
            <StoreSettingsForm className="mt-4 grid gap-3 md:grid-cols-2">
              <input type="hidden" name="current_logo_url" value={restaurant?.logo_url ?? ""} />
              <input type="hidden" name="current_banner_url" value={restaurant?.banner_url ?? ""} />
              <input type="hidden" name="lbp_rate" value={String(restaurant?.lbp_rate ?? 89500)} />
              <input type="hidden" name="delivery_fee_usd" value={String(restaurant?.delivery_fee_usd ?? 2)} />
              <input type="hidden" name="delivery_radius_km" value={String(restaurant?.delivery_radius_km ?? 5)} />
              <input type="hidden" name="fast_delivery_fee_usd" value={String(restaurant?.fast_delivery_fee_usd ?? 0)} />
              {rawBrowseSections.map((value) => (
                <input key={value} type="hidden" name="browse_sections" value={value} />
              ))}
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
                  defaultValue={storeLocationLabel}
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
              <StoreSettingsSubmitButton className="btn btn-primary rounded-xl md:col-span-2">
                Save profile
              </StoreSettingsSubmitButton>
            </StoreSettingsForm>
          </section>
        )}

        {isMenuBusiness ? (
          <RestaurantLocationsPanel
            restaurantId={appUser.restaurant_id}
            initialLocations={restaurantLocations}
          />
        ) : null}

        <BrandManagePanel brands={menuBrands} />

        <MenuPromotionsPanel
          promotions={menuPromotions}
          sections={(categories ?? []).map((c) => ({ id: c.id, name: c.name }))}
          brands={menuBrands}
          menuItems={(items ?? []).map((item) => ({
            id: item.id,
            name: item.name,
            category_id: item.category_id ?? null,
          }))}
        />

        <MenuCouponCodesPanel coupons={menuCouponCodes} />

        <section className="rounded-2xl border border-violet-100 bg-gradient-to-br from-[#faf9ff] to-white p-5 shadow-sm">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Add {itemProfile.isFoodLike ? "menu item" : "store item"}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Fill in the essentials, then expand optional sections for more detail — fields below match your store&apos;s categories.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
              {itemProfileBadgeSections.map((section) => (
                <span
                  key={section}
                  className="rounded-full bg-violet-100 px-2.5 py-1 text-[11px] font-bold text-violet-700"
                >
                  {BROWSE_SECTION_ICONS[section]} {section}
                </span>
              ))}
            </div>
          </div>
          <AddMenuItemForm
            categories={(categories ?? []).map((c) => ({ id: c.id, name: c.name }))}
            brands={menuBrands}
            profile={itemProfile}
          />
        </section>

        <section className="panel overflow-hidden p-0 md:p-0">
          <div className="border-b border-slate-200 px-4 py-4 md:px-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="panel-title" id="items-toolbar">
                  {itemProfile.isFoodLike ? "Menu items" : "Store items"}
                </h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  Search, filter, and update stock directly in the table — click any quantity to edit it.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                  {normalizedItems.length} item{normalizedItems.length !== 1 ? "s" : ""}
                </span>
                {menuItemsLowStockCount > 0 && (
                  <Link
                    href={buildMenuItemsListHref({ stock: "low" })}
                    className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 transition hover:bg-amber-100"
                  >
                    ⚠ {menuItemsLowStockCount} low stock
                  </Link>
                )}
              </div>
            </div>
          </div>

          <BusinessMenuItemsToolbar
            categories={(categories ?? []).map((c) => ({ id: c.id, name: c.name }))}
            initialQ={q ?? ""}
            initialCategory={selectedCategory}
            initialStock={selectedStock}
            initialSort={selectedSort}
            totalCount={normalizedItems.length}
            filteredCount={sortedItems.length}
          />

          <div className="overflow-x-auto">
            <table className="min-w-[980px] w-full text-sm md:min-w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">Item</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">Section</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">Price</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    Stock qty
                    <span className="ml-1.5 rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold text-violet-700 normal-case tracking-normal">
                      editable
                    </span>
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pagedItems.map((item, idx) => {
                  const alertLevel = getMenuItemStockAlertLevel(item);
                  const rowBg = idx % 2 === 0 ? "bg-white" : "bg-slate-50/40";
                  return (
                  <tr key={item.id} className={`${rowBg} transition-colors hover:bg-violet-50/30`}>
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt=""
                            className="h-10 w-10 shrink-0 rounded-xl object-cover shadow-sm ring-1 ring-slate-200"
                          />
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg">
                            🍽️
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 leading-snug">{item.name}</p>
                          {item.brand_name ? (
                            <span className="mt-0.5 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                              {item.brand_name}
                            </span>
                          ) : null}
                          {!item.is_available ? (
                            <span className="ml-1 mt-0.5 inline-block rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                              Out of stock
                            </span>
                          ) : alertLevel && alertLevel !== "ok" ? (
                            <span className={`ml-1 mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${stockAlertBadgeClass(alertLevel)}`}>
                              {stockAlertBadgeLabel(item)}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        {categoryNameById.get(item.category_id ?? "") ?? "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-semibold text-slate-900">${item.price.toFixed(2)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <MenuItemStockQuickEdit
                        itemId={item.id}
                        itemName={item.name}
                        trackStock={Boolean(item.track_stock)}
                        stockQuantity={item.stock_quantity ?? null}
                        warningQty={item.stock_alert_warning_qty}
                        urgentQty={item.stock_alert_urgent_qty}
                        criticalQty={item.stock_alert_critical_qty}
                      />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-nowrap items-center gap-1.5">

                        {/* EDIT */}
                        <div className="relative">
                          <input id={`edit-${item.id}`} type="checkbox" className="peer hidden" />
                          <label
                            htmlFor={`edit-${item.id}`}
                            aria-label="Edit item"
                            title="Edit this item"
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-violet-200 bg-violet-50 text-violet-600 transition hover:bg-violet-100 hover:text-violet-800"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
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

                                {/* — Identity — */}
                                <label className="space-y-1">
                                  <FormFieldLabel required>Section</FormFieldLabel>
                                  <select name="category_id" required defaultValue={item.category_id ?? ""} className="ui-select">
                                    {categories?.map((category) => (
                                      <option key={category.id} value={category.id}>{category.name}</option>
                                    ))}
                                  </select>
                                </label>
                                <label className="space-y-1">
                                  <FormFieldLabel required>Item name</FormFieldLabel>
                                  <input name="name" required defaultValue={item.name} placeholder="Item name" className="ui-input" />
                                </label>
                                <label className="space-y-1">
                                  <FormFieldLabel optional>Brand</FormFieldLabel>
                                  <select name="brand_id" defaultValue={resolveMenuItemBrandId(item, menuBrands)} className="ui-select">
                                    <option value="">No brand</option>
                                    {menuBrands.map((brand) => (
                                      <option key={brand.id} value={brand.id}>{brand.name}</option>
                                    ))}
                                  </select>
                                </label>
                                <label className="space-y-1 md:col-span-2">
                                  <FormFieldLabel optional>Description</FormFieldLabel>
                                  <input name="description" defaultValue={item.description ?? ""} placeholder="Description" className="ui-input" />
                                </label>

                                {/* — Pricing — */}
                                <div className="md:col-span-2">
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
                                </div>

                                {/* — Contents & nutrition — only for categories where it applies — */}
                                {(itemProfile.contents || itemProfile.nutrition) ? (
                                  <>
                                    {itemProfile.contents ? (
                                      <label className="space-y-1 md:col-span-2">
                                        <FormFieldLabel optional>
                                          {itemProfile.isFoodLike ? "Contains / ingredients" : "Ingredients / contents"}
                                        </FormFieldLabel>
                                        <input name="contents" defaultValue={item.contents ?? ""} placeholder="e.g. wheat, milk, sesame" className="ui-input" />
                                      </label>
                                    ) : (
                                      <input type="hidden" name="contents" value={item.contents ?? ""} />
                                    )}
                                    {itemProfile.nutrition && (
                                      <div className="md:col-span-2">
                                        <MenuNutritionFields
                                          idPrefix={`edit-${item.id}-nutrition`}
                                          defaultCalories={item.calories}
                                          defaultProteinG={item.protein_g}
                                        />
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <input type="hidden" name="contents" value={item.contents ?? ""} />
                                )}

                                {/* — Stock — */}
                                <div className="md:col-span-2">
                                  <MenuItemStockFields
                                    idPrefix={`edit-stock-${item.id}-`}
                                    defaultTrackStock={Boolean(item.track_stock)}
                                    defaultStockQuantity={item.stock_quantity}
                                    defaultWarningQty={item.stock_alert_warning_qty}
                                    defaultUrgentQty={item.stock_alert_urgent_qty}
                                    defaultCriticalQty={item.stock_alert_critical_qty}
                                  />
                                </div>

                                {/* — Options/Variants — */}
                                <div className="md:col-span-2">
                                  <MenuItemOptionsFields
                                    idPrefix={`edit-opt-${item.id}-`}
                                    defaultLabel={item.option_label}
                                    defaultValues={(item.option_values ?? [])
                                      .filter((entry): entry is { name: string; price?: number } =>
                                        Boolean(entry && typeof entry.name === "string" && entry.name.trim()))
                                      .map((entry) => ({
                                        name: entry.name,
                                        price: Number.isFinite(Number(entry.price)) ? Number(entry.price) : 0,
                                      }))}
                                  />
                                </div>

                                {/* — Ingredient customization — only for categories where dish-style customization applies — */}
                                {itemProfile.ingredientCustomization ? (
                                  <>
                                    <IngredientListField
                                      name="removable_ingredients"
                                      label={`Remove (${categoryNameById.get(item.category_id ?? "") ?? "section"})`}
                                      defaultItems={(item.removable_ingredients ?? [])
                                        .filter((entry): entry is { name: string } =>
                                          Boolean(entry && typeof entry.name === "string" && entry.name.trim()))
                                        .map((entry) => ({ name: entry.name }))}
                                    />
                                    <IngredientListField
                                      name="add_ingredients"
                                      label="Add-ons (extra price per line)"
                                      withPrice
                                      defaultItems={(item.add_ingredients ?? [])
                                        .filter((entry): entry is { name: string; price?: number } =>
                                          Boolean(entry && typeof entry.name === "string" && entry.name.trim()))
                                        .map((entry) => ({
                                          name: entry.name,
                                          price: Number.isFinite(Number(entry.price)) ? Number(entry.price) : 0,
                                        }))}
                                    />
                                  </>
                                ) : (
                                  <>
                                    <input type="hidden" name="removable_ingredients" value="[]" />
                                    <input type="hidden" name="add_ingredients" value="[]" />
                                  </>
                                )}

                                {/* — Image — */}
                                <div className="md:col-span-2">
                                  <ImageUploadField name="image_file" initialImageUrl={item.image_url} label="Update image" optional />
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
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-500 transition hover:bg-red-100 hover:text-red-700"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
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
                            className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition ${
                              item.is_available
                                ? "border border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100 hover:text-amber-800"
                                : "border border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-800"
                            }`}
                          >
                            {item.is_available ? (
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                              </svg>
                            ) : (
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
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
                  );
                })}
              </tbody>
            </table>
            {sortedItems.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-16 text-center">
                <span className="text-4xl">📦</span>
                <p className="text-sm font-medium text-slate-500">No items match your current filters.</p>
              </div>
            ) : null}
          </div>
          {sortedItems.length > MENU_ITEMS_ADMIN_PAGE_SIZE ? (
            <div className="mt-0 flex items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 md:px-5">
              {itemsSafePage > 1 ? (
                <Link
                  href={buildMenuItemsListHref({ ...listHrefBase, page: itemsSafePage - 1 })}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Previous
                </Link>
              ) : (
                <span className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-300">
                  Previous
                </span>
              )}
              <span className="text-xs font-medium text-slate-500">
                Page {itemsSafePage} of {itemsTotalPages}
              </span>
              {itemsSafePage < itemsTotalPages ? (
                <Link
                  href={buildMenuItemsListHref({ ...listHrefBase, page: itemsSafePage + 1 })}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Next
                </Link>
              ) : (
                <span className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-300">
                  Next
                </span>
              )}
            </div>
          ) : null}
        </section>

      </div>
    </main>
  );
}
