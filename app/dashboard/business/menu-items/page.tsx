import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { loadRestaurantForAdminDashboard } from "@/lib/restaurant-profile";
import { StoreAdminHeader } from "@/components/store-admin-header";
import { loadStoreAdminHeaderContext } from "@/lib/store-admin-header-context";
import { DashboardSectionJump } from "@/components/dashboard-section-jump";
import { RestaurantDashboardToast } from "@/components/restaurant-dashboard-toast";
import { BusinessMenuItemsSection } from "@/components/business-menu-items-section";
import { SectionManagePanel } from "@/components/section-manage-panel";
import { BrandManagePanel } from "@/components/brand-manage-panel";
import { loadMenuItemsAdminData } from "@/lib/menu-items-admin-data";
import { parseMenuItemsSort, sortMenuItems } from "@/lib/menu-items-admin";
import { MENU_ITEMS_ADMIN_PAGE_SIZE } from "@/lib/dashboard-admin";
import { isMenuItemLowStock } from "@/lib/menu-item-stock";
import {
  getRawBrowseSectionValues,
  normalizeBrowseSections,
} from "@/lib/browse-sections";
import type { BrowseSection } from "@/lib/browse-sections";
import { hasCatalogDashboard, parseBusinessType } from "@/lib/business-types";
import { resolveStoreItemProfile } from "@/lib/store-item-profile";

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
    item_name?: string;
    section_name?: string;
    sections_count?: string;
    brand_name?: string;
  }>;
};

export default async function BusinessMenuItemsPage({ searchParams }: Props) {
  const appUser = await getCurrentUserRole();
  if (!appUser || appUser.role !== "restaurant_admin" || !appUser.restaurant_id) {
    redirect("/dashboard/login");
  }

  const {
    q,
    category,
    stock,
    sort: sortRaw,
    page: pageRaw,
    jump,
    toast,
    item_name: itemNameRaw,
    section_name: sectionNameRaw,
    sections_count: sectionsCountRaw,
    brand_name: brandNameRaw,
  } = await searchParams;

  let itemName: string | undefined;
  if (typeof itemNameRaw === "string" && itemNameRaw.length > 0) {
    try {
      itemName = decodeURIComponent(itemNameRaw);
    } catch {
      itemName = itemNameRaw;
    }
  }

  let sectionName: string | undefined;
  if (typeof sectionNameRaw === "string" && sectionNameRaw.length > 0) {
    try {
      sectionName = decodeURIComponent(sectionNameRaw);
    } catch {
      sectionName = sectionNameRaw;
    }
  }

  const sectionsCount =
    typeof sectionsCountRaw === "string" && sectionsCountRaw.length > 0
      ? Number(sectionsCountRaw)
      : null;

  let brandName: string | undefined;
  if (typeof brandNameRaw === "string" && brandNameRaw.length > 0) {
    try {
      brandName = decodeURIComponent(brandNameRaw);
    } catch {
      brandName = brandNameRaw;
    }
  }

  const supabase = await createServerSupabaseClient();
  const restaurantId = appUser.restaurant_id;

  const [restaurant, header, { data: categories }, { items: normalizedItems, brands: menuBrands }] =
    await Promise.all([
      loadRestaurantForAdminDashboard(supabase, restaurantId),
      loadStoreAdminHeaderContext(supabase, restaurantId),
      supabase
        .from("categories")
        .select("id, name, position")
        .eq("restaurant_id", restaurantId)
        .order("position"),
      loadMenuItemsAdminData(supabase, restaurantId),
    ]);

  const businessType = parseBusinessType(restaurant?.business_type ?? "retail_store");
  if (!hasCatalogDashboard(businessType)) {
    redirect("/dashboard/business");
  }

  const categoryNameById = new Map((categories ?? []).map((c) => [c.id, c.name]));
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
  const listHrefBase = { q: q ?? "", category: selectedCategory, stock: selectedStock, sort: selectedSort };
  const menuItemsLowStockCount = normalizedItems.filter((item) => isMenuItemLowStock(item)).length;

  const rawBrowseSections = getRawBrowseSectionValues(restaurant?.browse_sections ?? []);
  const selectedBrowseSections = normalizeBrowseSections(rawBrowseSections);
  const itemProfileBadgeSections: BrowseSection[] =
    selectedBrowseSections.length > 0
      ? selectedBrowseSections
      : businessType === "restaurant" || businessType === "cloud_kitchen"
        ? ["Food & Restaurants"]
        : ["Sports & Outdoors"];
  const itemProfile = resolveStoreItemProfile(itemProfileBadgeSections);

  return (
    <main className="min-h-screen bg-[#f8f8ff] p-3 sm:p-4 md:p-8">
      <DashboardSectionJump target={jump} />
      <RestaurantDashboardToast
        toast={toast}
        itemName={itemName}
        sectionName={sectionName}
        sectionsCount={Number.isFinite(sectionsCount) ? sectionsCount : null}
        brandName={brandName}
      />
      <div className="mx-auto max-w-7xl space-y-5">
        <StoreAdminHeader
          restaurantName={header.restaurantName}
          categoryLabel={header.categoryLabel}
          slug={header.slug}
          browseSections={header.browseSections}
          menuUrl={header.menuUrl}
          driverManagementEnabled={header.driverManagementEnabled}
          currentPage="menu-items"
          title={itemProfile.isFoodLike ? "Menu items" : "Store items"}
          subtitle="Manage sections and brands, then add and update items."
        />

        <SectionManagePanel
          categories={(categories ?? []).map((c) => ({
            id: c.id,
            name: c.name,
            position: c.position ?? 0,
          }))}
        />

        <BrandManagePanel brands={menuBrands} />

        <BusinessMenuItemsSection
          categories={(categories ?? []).map((c) => ({ id: c.id, name: c.name }))}
          menuBrands={menuBrands}
          itemProfile={itemProfile}
          itemProfileBadgeSections={itemProfileBadgeSections}
          sortedItems={sortedItems}
          pagedItems={pagedItems}
          menuItemsLowStockCount={menuItemsLowStockCount}
          categoryNameById={categoryNameById}
          initialQ={q ?? ""}
          selectedCategory={selectedCategory}
          selectedStock={selectedStock}
          selectedSort={selectedSort}
          normalizedItemsCount={normalizedItems.length}
          itemsSafePage={itemsSafePage}
          itemsTotalPages={itemsTotalPages}
          listHrefBase={listHrefBase}
        />
      </div>
    </main>
  );
}
