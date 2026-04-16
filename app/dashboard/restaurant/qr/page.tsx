import Link from "next/link";
import { redirect } from "next/navigation";
import { MenuQrCard } from "@/components/menu-qr-card";
import { getCurrentUserRole } from "@/lib/data";
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
    .select("name, slug")
    .eq("id", appUser.restaurant_id)
    .single();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const menuUrl = `${appUrl.replace(/\/+$/, "")}/${restaurant?.slug ?? ""}`;

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="panel flex items-center justify-between rounded-2xl p-5">
          <div>
            <p className="text-sm font-medium text-emerald-700">Restaurant admin</p>
            <h1 className="text-2xl font-bold text-slate-900">Menu QR</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/restaurant/flyer" className="btn btn-primary">
              Print flyer
            </Link>
            <Link href="/dashboard/restaurant" className="btn btn-secondary">
              Back to dashboard
            </Link>
          </div>
        </header>

        <MenuQrCard menuUrl={menuUrl} restaurantName={restaurant?.name ?? "restaurant"} />
      </div>
    </main>
  );
}
