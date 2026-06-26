import Link from "next/link";
import { redirect } from "next/navigation";
import { MenuQrCard } from "@/components/menu-qr-card";
import { getStorefrontQrLabels } from "@/lib/browse-sections";
import { getCurrentUserRole } from "@/lib/data";
import { getRestaurantMenuUrls } from "@/lib/restaurant-menu-urls";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function RestaurantQrPage() {
  const appUser = await getCurrentUserRole();
  if (!appUser || appUser.role !== "restaurant_admin" || !appUser.restaurant_id) {
    redirect("/dashboard/login");
  }

  const supabase = await createServerSupabaseClient();
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("name, slug, browse_sections")
    .eq("id", appUser.restaurant_id)
    .single();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const slug = restaurant?.slug ?? "";
  const { order: orderMenuUrl, inStore: inStoreMenuUrl } = getRestaurantMenuUrls(appUrl, slug);
  const restaurantName = restaurant?.name ?? "Store";
  const qrLabels = getStorefrontQrLabels(restaurant?.browse_sections);

  return (
    <main className="min-h-screen bg-[#f8f8ff] p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="panel flex flex-wrap items-center justify-between gap-3 rounded-2xl p-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-violet-600">
              {qrLabels.adminEyebrow}
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">{qrLabels.pageTitle}</h1>
            <p className="mt-2 max-w-xl text-sm text-slate-600">{qrLabels.pageIntro}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/dashboard/business/flyer" className="btn btn-primary">
              Print flyer
            </Link>
            <Link href="/dashboard/business" className="btn btn-secondary">
              ← Dashboard
            </Link>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <MenuQrCard
            variant="order"
            menuUrl={orderMenuUrl}
            restaurantName={restaurantName}
            title={qrLabels.orderTitle}
            description={qrLabels.orderDescription}
            badgeLabel={qrLabels.orderBadge}
            openLinkLabel={qrLabels.openLink}
            downloadSuffix={qrLabels.orderDownloadSuffix}
          />
          <MenuQrCard
            variant="in-store"
            menuUrl={inStoreMenuUrl}
            restaurantName={restaurantName}
            title={qrLabels.inStoreTitle}
            description={qrLabels.inStoreDescription}
            badgeLabel={qrLabels.inStoreBadge}
            openLinkLabel={qrLabels.openLink}
            downloadSuffix={qrLabels.inStoreDownloadSuffix}
          />
        </div>
      </div>
    </main>
  );
}
