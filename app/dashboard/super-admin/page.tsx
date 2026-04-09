import { redirect } from "next/navigation";
import { signOutAction } from "@/app-actions/auth";
import {
  createRestaurantAction,
  toggleRestaurantActiveAction,
} from "@/app-actions/superadmin";
import { getCurrentUserRole } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function SuperAdminPage() {
  const appUser = await getCurrentUserRole();
  if (!appUser || appUser.role !== "superadmin") {
    redirect("/dashboard/login");
  }

  const supabase = await createServerSupabaseClient();
  const { data: restaurants } = await supabase
    .from("restaurants")
    .select("id, name, slug, phone, is_active")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Super admin</h1>
          <form action={signOutAction}>
            <button className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold">
              Sign out
            </button>
          </form>
        </header>

        <section className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
          <h2 className="font-bold text-slate-900">Create restaurant</h2>
          <form action={createRestaurantAction} className="mt-3 grid gap-2 md:grid-cols-3">
            <input name="name" required placeholder="Restaurant name" className="rounded-lg border border-slate-300 px-3 py-2" />
            <input name="phone" required placeholder="WhatsApp number" className="rounded-lg border border-slate-300 px-3 py-2" />
            <button className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white">
              Create
            </button>
          </form>
        </section>

        <section className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
          <h2 className="font-bold text-slate-900">Restaurants</h2>
          <div className="mt-4 space-y-2">
            {restaurants?.map((restaurant) => (
              <div
                key={restaurant.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 p-3"
              >
                <div>
                  <p className="font-semibold text-slate-900">{restaurant.name}</p>
                  <p className="text-sm text-slate-600">
                    /{restaurant.slug} - {restaurant.phone}
                  </p>
                </div>
                <form action={toggleRestaurantActiveAction}>
                  <input type="hidden" name="id" value={restaurant.id} />
                  <input type="hidden" name="is_active" value={String(restaurant.is_active)} />
                  <button
                    className={`rounded-full px-4 py-2 text-sm font-semibold text-white ${
                      restaurant.is_active ? "bg-red-600" : "bg-green-600"
                    }`}
                  >
                    {restaurant.is_active ? "Deactivate" : "Activate"}
                  </button>
                </form>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
