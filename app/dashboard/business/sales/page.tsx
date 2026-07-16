import { redirect } from "next/navigation";
import { getCurrentUserRole, getRestaurantMenuCouponCodes, getRestaurantMenuPromotions } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { StoreAdminHeader } from "@/components/store-admin-header";
import { loadStoreAdminHeaderContext } from "@/lib/store-admin-header-context";
import { DashboardSectionJump } from "@/components/dashboard-section-jump";
import { RestaurantDashboardToast } from "@/components/restaurant-dashboard-toast";
import { MenuPromotionsPanel } from "@/components/menu-promotions-panel";
import { MenuCouponCodesPanel } from "@/components/menu-coupon-codes-panel";
import { hasCatalogDashboard, parseBusinessType } from "@/lib/business-types";
import { loadRestaurantForAdminDashboard } from "@/lib/restaurant-profile";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    jump?: string;
    toast?: string;
    error?: string;
  }>;
};

export default async function BusinessSalesPage({ searchParams }: Props) {
  const appUser = await getCurrentUserRole();
  if (!appUser || appUser.role !== "restaurant_admin" || !appUser.restaurant_id) {
    redirect("/dashboard/login");
  }

  const { jump, toast, error } = await searchParams;
  const supabase = await createServerSupabaseClient();
  const restaurantId = appUser.restaurant_id;

  const [restaurant, header, { data: categories }, menuPromotions, menuCouponCodes, { data: menuBrandsRaw }, { data: promotionMenuItems }] =
    await Promise.all([
      loadRestaurantForAdminDashboard(supabase, restaurantId),
      loadStoreAdminHeaderContext(supabase, restaurantId),
      supabase
        .from("categories")
        .select("id, name, position")
        .eq("restaurant_id", restaurantId)
        .order("position"),
      getRestaurantMenuPromotions(restaurantId),
      getRestaurantMenuCouponCodes(restaurantId),
      supabase
        .from("menu_brands")
        .select("id, name, logo_url")
        .eq("restaurant_id", restaurantId)
        .order("name"),
      supabase
        .from("menu_items")
        .select("id, name, category_id")
        .eq("restaurant_id", restaurantId)
        .order("name"),
    ]);

  const businessType = parseBusinessType(restaurant?.business_type ?? "retail_store");
  if (!hasCatalogDashboard(businessType)) {
    redirect("/dashboard/business");
  }

  const menuBrands = (menuBrandsRaw ?? []) as Array<{
    id: string;
    name: string;
    logo_url: string | null;
  }>;

  const toastFromError =
    error === "invalid_promotion" ||
    error === "invalid_promotion_scope" ||
    error === "promotion_save_failed" ||
    error === "invalid_coupon" ||
    error === "coupon_code_exists" ||
    error === "coupon_save_failed"
      ? error
      : null;

  return (
    <main className="min-h-screen bg-[#f8f8ff] p-3 sm:p-4 md:p-8">
      <DashboardSectionJump target={jump} />
      <RestaurantDashboardToast toast={toast ?? toastFromError} />
      <div className="mx-auto max-w-7xl space-y-5">
        <StoreAdminHeader
          restaurantName={header.restaurantName}
          categoryLabel={header.categoryLabel}
          slug={header.slug}
          browseSections={header.browseSections}
          menuUrl={header.menuUrl}
          driverManagementEnabled={header.driverManagementEnabled}
          currentPage="sales"
          title="Sales & discounts"
          subtitle="Run store-wide or item sales, and manage coupon codes customers can apply at checkout."
        />

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
