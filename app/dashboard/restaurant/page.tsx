import { redirect } from "next/navigation";
import { signOutAction } from "@/app-actions/auth";
import {
  createCategoryAction,
  createMenuItemAction,
  updateRestaurantSettingsAction,
} from "@/app-actions/restaurant";
import { getCurrentUserRole } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function RestaurantDashboardPage() {
  const appUser = await getCurrentUserRole();
  if (!appUser || appUser.role !== "restaurant_admin" || !appUser.restaurant_id) {
    redirect("/dashboard/login");
  }

  const supabase = await createServerSupabaseClient();
  const [{ data: restaurant }, { data: categories }, { data: items }] = await Promise.all([
    supabase
      .from("restaurants")
      .select("name, slug, phone, logo_url")
      .eq("id", appUser.restaurant_id)
      .single(),
    supabase
      .from("categories")
      .select("id, name")
      .eq("restaurant_id", appUser.restaurant_id)
      .order("position"),
    supabase
      .from("menu_items")
      .select("id, name, price, is_available, categories(name)")
      .eq("restaurant_id", appUser.restaurant_id)
      .order("name"),
  ]);

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-slate-900">Restaurant dashboard</h1>
          <form action={signOutAction}>
            <button className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold">
              Sign out
            </button>
          </form>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <form action={updateRestaurantSettingsAction} className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
            <h2 className="font-bold text-slate-900">Store settings</h2>
            <div className="mt-3 space-y-2">
              <input name="name" defaultValue={restaurant?.name} placeholder="Store name" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              <input name="phone" defaultValue={restaurant?.phone} placeholder="WhatsApp number" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              <input name="logo_url" defaultValue={restaurant?.logo_url ?? ""} placeholder="Logo URL" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              <button className="rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white">Save</button>
            </div>
            <p className="mt-2 text-xs text-slate-500">Public menu URL: /{restaurant?.slug}</p>
          </form>

          <form action={createCategoryAction} className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
            <h2 className="font-bold text-slate-900">Add category</h2>
            <div className="mt-3 flex gap-2">
              <input name="name" required placeholder="Category name" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              <button className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white">Add</button>
            </div>
          </form>
        </section>

        <section className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
          <h2 className="font-bold text-slate-900">Add menu item</h2>
          <form action={createMenuItemAction} className="mt-3 grid gap-2 md:grid-cols-4">
            <select name="category_id" required className="rounded-lg border border-slate-300 px-3 py-2">
              <option value="">Category</option>
              {categories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <input name="name" required placeholder="Item name" className="rounded-lg border border-slate-300 px-3 py-2" />
            <input name="description" placeholder="Description" className="rounded-lg border border-slate-300 px-3 py-2" />
            <input name="price" required placeholder="Price" type="number" step="0.01" className="rounded-lg border border-slate-300 px-3 py-2" />
            <button className="md:col-span-4 rounded-lg bg-green-600 px-4 py-2 font-semibold text-white">
              Add item
            </button>
          </form>
        </section>

        <section className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
          <h2 className="font-bold text-slate-900">Current menu items</h2>
          <div className="mt-3 space-y-2 text-sm">
            {items?.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                <p className="font-medium text-slate-800">
                  {item.name} - ${item.price.toFixed(2)}
                </p>
                <span className="text-xs text-slate-500">{item.is_available ? "In stock" : "Out of stock"}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
