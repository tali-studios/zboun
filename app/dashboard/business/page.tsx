import { redirect } from "next/navigation";
import { StoreSettingsForm, StoreSettingsSubmitButton } from "@/components/store-settings-form";
import { getCurrentUserRole, getRestaurantMenuCouponCodes, getRestaurantMenuPromotions } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { StoreAdminHeader } from "@/components/store-admin-header";
import { BusinessCategoryDashboard } from "@/components/business-category-dashboard";
import { ImageUploadField } from "@/components/image-upload-field";
import { normalizeBrowseSections, getBrowseSubTags, getRawBrowseSectionValues, BROWSE_SECTION_ICONS } from "@/lib/browse-sections";
import { getBusinessTypeLabel, hasCatalogDashboard, parseBusinessType } from "@/lib/business-types";
import { formatBrowseSectionsLabel } from "@/lib/browse-sections";
import { RestaurantHoursPanel } from "@/components/restaurant-hours-panel";
import { RestaurantDashboardToast } from "@/components/restaurant-dashboard-toast";
import { parseOpeningHours } from "@/lib/opening-hours";
import { DashboardSectionJump } from "@/components/dashboard-section-jump";
import { RestaurantLocationsPanel } from "@/components/restaurant-locations-panel";
import type { RestaurantLocationRow } from "@/app-actions/restaurant";
import { BrandManagePanel } from "@/components/brand-manage-panel";
import { SectionManagePanel } from "@/components/section-manage-panel";
import { MenuPromotionsPanel } from "@/components/menu-promotions-panel";
import { MenuCouponCodesPanel } from "@/components/menu-coupon-codes-panel";
import { DeliveryFeeSettings } from "@/components/delivery-fee-settings";
import { MenuThemePicker } from "@/components/menu-theme-picker";
import {
  loadRestaurantForAdminDashboard,
  resolveRestaurantLocationLabel,
  syncRestaurantProfileFromMainBranch,
} from "@/lib/restaurant-profile";
import { getRestaurantSubdomainStoreUrl } from "@/lib/restaurant-menu-urls";

export const dynamic = "force-dynamic";

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

  const [{ data: menuBrandsRaw }, { data: promotionMenuItems }] = await Promise.all([
    supabase
      .from("menu_brands")
      .select("id, name, logo_url")
      .eq("restaurant_id", appUser.restaurant_id)
      .order("name"),
    supabase
      .from("menu_items")
      .select("id, name, category_id")
      .eq("restaurant_id", appUser.restaurant_id)
      .order("name"),
  ]);
  const menuBrands = (menuBrandsRaw ?? []) as Array<{
    id: string;
    name: string;
    logo_url: string | null;
  }>;

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
  const menuUrl = getRestaurantSubdomainStoreUrl(appUrl, restaurant?.slug ?? "");
  const businessType = parseBusinessType(restaurant?.business_type ?? "retail_store");
  const categoryLabel = formatBrowseSectionsLabel(restaurant?.browse_sections);
  const isMenuBusiness = hasCatalogDashboard(businessType);
  const rawBrowseSections = getRawBrowseSectionValues(restaurant?.browse_sections ?? []);
  const selectedBrowseSections = normalizeBrowseSections(rawBrowseSections);
  const selectedBrowseSubTags = getBrowseSubTags(rawBrowseSections);
  const browseSectionsForForm =
    selectedBrowseSections.length > 0 ? selectedBrowseSections : (["Food & Restaurants"] as const);

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
        <StoreAdminHeader
          restaurantName={restaurant?.name ?? "Store"}
          categoryLabel={categoryLabel}
          slug={restaurant?.slug}
          browseSections={restaurant?.browse_sections}
          menuUrl={menuUrl}
          driverManagementEnabled={restaurant?.driver_management_enabled ?? false}
          currentPage="dashboard"
        />

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
                <input
                  value={restaurant?.name ?? ""}
                  readOnly
                  disabled
                  className="ui-input cursor-not-allowed border-slate-200 bg-slate-200 text-slate-500 opacity-100"
                />
                <p className="text-xs text-slate-500">
                  Set by Zboun — contact support if you need this changed.
                </p>
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
              driverManagementEnabledDefault={restaurant?.driver_management_enabled ?? false}
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
          menuItems={(promotionMenuItems ?? []).map((item) => ({
            id: item.id,
            name: item.name,
            category_id: item.category_id ?? null,
          }))}
        />

        <MenuCouponCodesPanel coupons={menuCouponCodes} />

      </div>
    </main>
  );
}
