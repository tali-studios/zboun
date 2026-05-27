import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUserRole } from "@/lib/data";
import { getRestaurantOrders } from "@/app-actions/orders";
import { RestaurantOrdersPanel } from "@/components/restaurant-orders-panel";

export const dynamic = "force-dynamic";

export default async function RestaurantOrdersPage() {
  const appUser = await getCurrentUserRole();
  if (!appUser || appUser.role !== "restaurant_admin" || !appUser.restaurant_id) {
    redirect("/dashboard/login");
  }

  const orders = await getRestaurantOrders(appUser.restaurant_id);

  return (
    <main className="min-h-screen bg-[#f8f8ff] p-3 sm:p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-5">
        {/* Header */}
        <header className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-700 via-violet-600 to-fuchsia-600 p-5 text-white shadow-lg shadow-violet-600/30 md:p-6">
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-violet-200">Manage</p>
              <h1 className="mt-1 text-xl font-bold md:text-2xl">Orders</h1>
              <p className="mt-0.5 text-xs text-violet-200">Real-time order management</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/dashboard/business"
                className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
              >
                ← Dashboard
              </Link>
            </div>
          </div>
        </header>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <RestaurantOrdersPanel
            initialOrders={orders}
            restaurantId={appUser.restaurant_id}
          />
        </div>
      </div>
    </main>
  );
}
