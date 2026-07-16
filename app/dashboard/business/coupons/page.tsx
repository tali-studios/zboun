import { redirect } from "next/navigation";
import { getCurrentUserRole, getRestaurantMenuCouponCodes } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { StoreAdminHeader } from "@/components/store-admin-header";
import { loadStoreAdminHeaderContext } from "@/lib/store-admin-header-context";
import { DashboardSectionJump } from "@/components/dashboard-section-jump";
import { RestaurantDashboardToast } from "@/components/restaurant-dashboard-toast";
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

export default async function BusinessCouponsPage({ searchParams }: Props) {
  const appUser = await getCurrentUserRole();
  if (!appUser || appUser.role !== "restaurant_admin" || !appUser.restaurant_id) {
    redirect("/dashboard/login");
  }

  const { jump, toast, error } = await searchParams;
  const supabase = await createServerSupabaseClient();
  const restaurantId = appUser.restaurant_id;

  const [restaurant, header, menuCouponCodes] = await Promise.all([
    loadRestaurantForAdminDashboard(supabase, restaurantId),
    loadStoreAdminHeaderContext(supabase, restaurantId),
    getRestaurantMenuCouponCodes(restaurantId),
  ]);

  const businessType = parseBusinessType(restaurant?.business_type ?? "retail_store");
  if (!hasCatalogDashboard(businessType)) {
    redirect("/dashboard/business");
  }

  const toastFromError =
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
          currentPage="coupons"
          title="Coupon codes"
          subtitle="Create shareable promo codes customers can apply at checkout."
        />

        <MenuCouponCodesPanel coupons={menuCouponCodes} />
      </div>
    </main>
  );
}
