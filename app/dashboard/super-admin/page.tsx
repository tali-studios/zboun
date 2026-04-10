import { redirect } from "next/navigation";
import { signOutAction } from "@/app-actions/auth";
import {
  createRestaurantAction,
  deleteRestaurantAction,
  renewSubscriptionAction,
  toggleRestaurantActiveAction,
} from "@/app-actions/superadmin";
import { getCurrentUserRole } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type Props = {
  searchParams: Promise<{ success?: string; error?: string; q?: string; status?: string }>;
};

export default async function SuperAdminPage({ searchParams }: Props) {
  const { success, error, q = "", status = "all" } = await searchParams;
  const appUser = await getCurrentUserRole();
  if (!appUser || appUser.role !== "superadmin") {
    redirect("/dashboard/login");
  }

  const supabase = await createServerSupabaseClient();
  let query = supabase
    .from("restaurants")
    .select("id, name, slug, phone, is_active")
    .order("created_at", { ascending: false });

  const searchTerm = q.trim();
  if (searchTerm) {
    query = query.or(
      `name.ilike.%${searchTerm}%,slug.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`,
    );
  }
  if (status === "active") {
    query = query.eq("is_active", true);
  } else if (status === "inactive") {
    query = query.eq("is_active", false);
  }

  const { data: restaurants } = await query;

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

        {success === "restaurant_created_and_invited" && (
          <p className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm font-medium text-green-700">
            Restaurant created and invitation email sent. The admin can use the email link to set
            password and then login to the dashboard.
          </p>
        )}
        {success === "subscription_renewed" && (
          <p className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm font-medium text-green-700">
            Subscription renewed successfully.
          </p>
        )}
        {success === "restaurant_deleted" && (
          <p className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm font-medium text-green-700">
            Restaurant deleted successfully.
          </p>
        )}
        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
            {decodeURIComponent(error)}
          </p>
        )}

        <section className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
          <h2 className="font-bold text-slate-900">Create restaurant + admin invite</h2>
          <form action={createRestaurantAction} className="mt-3 grid gap-2 md:grid-cols-4">
            <input
              name="name"
              required
              placeholder="Restaurant name"
              className="rounded-lg border border-slate-300 px-3 py-2"
            />
            <input
              name="email"
              type="email"
              required
              placeholder="Admin email"
              className="rounded-lg border border-slate-300 px-3 py-2"
            />
            <input
              name="phone"
              type="tel"
              required
              placeholder="WhatsApp number"
              className="rounded-lg border border-slate-300 px-3 py-2"
            />
            <button className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white">
              Create restaurant
            </button>
          </form>
          <p className="mt-3 text-xs text-slate-500">
            An invitation email is sent to the admin with a secure set-password link and dashboard
            access URL.
          </p>
        </section>

        <section className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
          <h2 className="font-bold text-slate-900">Restaurants</h2>
          <form className="mt-4 grid gap-2 md:grid-cols-4">
            <input
              name="q"
              defaultValue={q}
              placeholder="Search by name, slug, phone"
              className="rounded-lg border border-slate-300 px-3 py-2 md:col-span-2"
            />
            <select
              name="status"
              defaultValue={status}
              className="rounded-lg border border-slate-300 px-3 py-2"
            >
              <option value="all">All</option>
              <option value="active">Active only</option>
              <option value="inactive">Inactive only</option>
            </select>
            <div className="flex gap-2">
              <button className="w-full rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white">
                Filter
              </button>
              <a
                href="/dashboard/super-admin"
                className="inline-flex w-full items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Reset
              </a>
            </div>
          </form>
          <div className="mt-4 space-y-2">
            {restaurants?.length === 0 && (
              <p className="rounded-lg border border-slate-200 p-3 text-sm text-slate-600">
                No restaurants found for this filter.
              </p>
            )}
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
                <div className="flex flex-wrap items-center gap-2">
                  <form action={renewSubscriptionAction}>
                    <input type="hidden" name="id" value={restaurant.id} />
                    <button className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
                      Renew subscription
                    </button>
                  </form>
                  <form action={toggleRestaurantActiveAction}>
                    <input type="hidden" name="id" value={restaurant.id} />
                    <input type="hidden" name="is_active" value={String(restaurant.is_active)} />
                    <button
                      className={`rounded-full px-4 py-2 text-sm font-semibold text-white ${
                        restaurant.is_active ? "bg-amber-600" : "bg-green-600"
                      }`}
                    >
                      {restaurant.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </form>
                  <form action={deleteRestaurantAction}>
                    <input type="hidden" name="id" value={restaurant.id} />
                    <button className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white">
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
