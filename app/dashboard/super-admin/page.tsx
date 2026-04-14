import { redirect } from "next/navigation";
import { signOutAction } from "@/app-actions/auth";
import {
  createRestaurantAction,
} from "@/app-actions/superadmin";
import { SuperAdminRestaurantsPanel } from "@/components/super-admin-restaurants-panel";
import { getCurrentUserRole } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ success?: string; error?: string }>;
};

export default async function SuperAdminPage({ searchParams }: Props) {
  const { success, error } = await searchParams;
  const appUser = await getCurrentUserRole();
  if (!appUser || appUser.role !== "superadmin") {
    redirect("/dashboard/login");
  }

  const supabase = await createServerSupabaseClient();
  const query = supabase
    .from("restaurants")
    .select("id, name, slug, phone, is_active, created_at")
    .order("created_at", { ascending: false });

  const [{ data: restaurants }, { data: categories }, { data: items }, { data: admins }] =
    await Promise.all([
      query,
      supabase.from("categories").select("id, restaurant_id"),
      supabase.from("menu_items").select("id, restaurant_id"),
      supabase
        .from("users")
        .select("restaurant_id, email")
        .eq("role", "restaurant_admin"),
    ]);

  const categoryCountByRestaurant = (categories ?? []).reduce<Record<string, number>>(
    (acc, category) => {
      acc[category.restaurant_id] = (acc[category.restaurant_id] ?? 0) + 1;
      return acc;
    },
    {},
  );

  const itemCountByRestaurant = (items ?? []).reduce<Record<string, number>>((acc, item) => {
    acc[item.restaurant_id] = (acc[item.restaurant_id] ?? 0) + 1;
    return acc;
  }, {});

  const adminEmailByRestaurant = (admins ?? []).reduce<Record<string, string>>((acc, admin) => {
    if (admin.restaurant_id && admin.email) {
      acc[admin.restaurant_id] = admin.email;
    }
    return acc;
  }, {});

  const restaurantsWithDetails = (restaurants ?? []).map((restaurant) => ({
    ...restaurant,
    category_count: categoryCountByRestaurant[restaurant.id] ?? 0,
    item_count: itemCountByRestaurant[restaurant.id] ?? 0,
    admin_email: adminEmailByRestaurant[restaurant.id] ?? "No admin linked",
  }));

  const stats = {
    totalRestaurants: restaurantsWithDetails.length,
    activeRestaurants: restaurantsWithDetails.filter((restaurant) => restaurant.is_active).length,
    totalSections: restaurantsWithDetails.reduce((sum, restaurant) => sum + restaurant.category_count, 0),
    totalItems: restaurantsWithDetails.reduce((sum, restaurant) => sum + restaurant.item_count, 0),
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Platform control center</p>
              <h1 className="text-2xl font-bold text-slate-900">Super admin</h1>
            </div>
            <form action={signOutAction}>
              <button className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold">
                Sign out
              </button>
            </form>
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Restaurants
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{stats.totalRestaurants}</p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Active stores
            </p>
            <p className="mt-1 text-2xl font-bold text-green-700">{stats.activeRestaurants}</p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Total sections
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{stats.totalSections}</p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Total menu items
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{stats.totalItems}</p>
          </div>
        </section>

        {success === "restaurant_created_and_invited" && (
          <p className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm font-medium text-green-700">
            Restaurant created and invitation email sent. The admin can use the email link to set
            password and then login to the dashboard.
          </p>
        )}
        {success === "restaurant_created_with_fallback" && (
          <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-700">
            Restaurant created. Supabase invite failed, so a direct account was created and
            onboarding email with temporary password was sent.
          </p>
        )}
        {success === "restaurant_created_email_failed" && (
          <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-700">
            Restaurant and admin account were created, but sending email failed. You can create
            another test account or share login details manually.
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

        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
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

        <SuperAdminRestaurantsPanel restaurants={restaurantsWithDetails} />
      </div>
    </main>
  );
}
