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
    <main className="min-h-screen bg-[#f8f8ff] p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="panel flex flex-wrap items-center justify-between gap-3 rounded-2xl p-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-violet-600">Restaurant admin</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Menu QR code</h1>
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

        <MenuQrCard menuUrl={menuUrl} restaurantName={restaurant?.name ?? "restaurant"} />
      </div>
    </main>
  );
}
