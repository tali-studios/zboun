import { NextResponse } from "next/server";
import { getCurrentUserRole } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { loadRestaurantForAdminDashboard } from "@/lib/restaurant-profile";
import {
  getRawBrowseSectionValues,
  normalizeBrowseSections,
} from "@/lib/browse-sections";
import { parseBusinessType } from "@/lib/business-types";
import { resolveStoreItemProfile } from "@/lib/store-item-profile";
import { buildCatalogImportTemplateBuffer } from "@/lib/catalog-import-template";
import type { BrowseSection } from "@/lib/browse-sections";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUserRole();
  if (!user || user.role !== "restaurant_admin" || !user.restaurant_id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createServerSupabaseClient();
  const restaurantId = user.restaurant_id;
  const [restaurant, { count: brandCount }] = await Promise.all([
    loadRestaurantForAdminDashboard(supabase, restaurantId),
    supabase
      .from("menu_brands")
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", restaurantId),
  ]);

  const businessType = parseBusinessType(restaurant?.business_type ?? "retail_store");
  const rawBrowseSections = getRawBrowseSectionValues(restaurant?.browse_sections ?? []);
  const selectedBrowseSections = normalizeBrowseSections(rawBrowseSections);
  const profileSections: BrowseSection[] =
    selectedBrowseSections.length > 0
      ? selectedBrowseSections
      : businessType === "restaurant" || businessType === "cloud_kitchen"
        ? ["Food & Restaurants"]
        : ["Sports & Outdoors"];
  const profile = resolveStoreItemProfile(profileSections);

  const buffer = await buildCatalogImportTemplateBuffer({
    profile,
    hasBrands: (brandCount ?? 0) > 0,
    storeName: restaurant?.name ?? undefined,
  });

  const safeSlug = String(restaurant?.slug ?? "catalog")
    .replace(/[^a-z0-9-_]/gi, "-")
    .slice(0, 40);
  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="zboun-${safeSlug}-import-template.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
