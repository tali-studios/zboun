import Link from "next/link";
import { redirect } from "next/navigation";
import { MenuFlyerCard } from "@/components/menu-flyer-card";
import { getCurrentUserRole } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function RestaurantFlyerPage() {
  const appUser = await getCurrentUserRole();
  if (!appUser || appUser.role !== "restaurant_admin" || !appUser.restaurant_id) {
    redirect("/dashboard/login");
  }

  const supabase = await createServerSupabaseClient();
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("name, slug, logo_url")
    .eq("id", appUser.restaurant_id)
    .single();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const menuUrl = `${appUrl.replace(/\/+$/, "")}/${restaurant?.slug ?? ""}`;

  return (
    <main className="flyer-print-page min-h-screen p-4 md:p-8">
      <div className="flyer-print-wrap mx-auto max-w-6xl space-y-6">
        <header className="panel flex items-center justify-between rounded-2xl p-5 print:hidden">
          <div>
            <p className="text-sm font-medium text-emerald-700">Restaurant admin</p>
            <h1 className="text-2xl font-bold text-slate-900">Print Flyer (A4)</h1>
          </div>
          <Link href="/dashboard/restaurant" className="btn btn-secondary">
            Back to dashboard
          </Link>
        </header>

        <MenuFlyerCard
          menuUrl={menuUrl}
          restaurantName={restaurant?.name ?? "Restaurant"}
          logoUrl={restaurant?.logo_url ?? null}
        />
      </div>
    </main>
  );
}
