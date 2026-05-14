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
    <main className="flyer-print-page min-h-screen overflow-x-hidden bg-[#f8f8ff] px-3 py-4 sm:p-8">
      <div className="flyer-print-wrap mx-auto w-full min-w-0 max-w-6xl space-y-6">
        <header className="panel flex flex-wrap items-center justify-between gap-3 rounded-2xl p-5 print:hidden">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-violet-600">Restaurant admin</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Print flyer (A4)</h1>
          </div>
          <Link href="/dashboard/business" className="btn btn-secondary">
            ← Dashboard
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
