import { redirect } from "next/navigation";
import { signOutAction } from "@/app-actions/auth";
import {
  createCategoryAction,
  deleteCategoryAction,
  deleteMenuItemAction,
  createMenuItemAction,
  toggleMenuItemAvailabilityAction,
  updateCategoryAction,
  updateMenuItemAction,
  updateRestaurantSettingsAction,
} from "@/app-actions/restaurant";
import { getCurrentUserRole } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

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
      .select("id, name, position")
      .eq("restaurant_id", appUser.restaurant_id)
      .order("position"),
    supabase
      .from("menu_items")
      .select("id, name, description, price, is_available, category_id, categories(name)")
      .eq("restaurant_id", appUser.restaurant_id)
      .order("name"),
  ]);

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-green-700">Restaurant admin</p>
              <h1 className="text-2xl font-bold text-slate-900">{restaurant?.name} Dashboard</h1>
              <p className="text-sm text-slate-500">Public menu URL: /{restaurant?.slug}</p>
            </div>
            <form action={signOutAction}>
              <button className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold">
                Sign out
              </button>
            </form>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-3">
          <form
            action={updateRestaurantSettingsAction}
            className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 lg:col-span-2"
          >
            <h2 className="font-bold text-slate-900">Store settings</h2>
            <div className="mt-3 grid gap-2 md:grid-cols-3">
              <input name="name" defaultValue={restaurant?.name} placeholder="Store name" className="rounded-lg border border-slate-300 px-3 py-2" />
              <input name="phone" defaultValue={restaurant?.phone} placeholder="WhatsApp number" className="rounded-lg border border-slate-300 px-3 py-2" />
              <input name="logo_url" defaultValue={restaurant?.logo_url ?? ""} placeholder="Logo URL" className="rounded-lg border border-slate-300 px-3 py-2" />
              <button className="md:col-span-3 rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white">Save settings</button>
            </div>
          </form>

          <form action={createCategoryAction} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="font-bold text-slate-900">Add section</h2>
            <div className="mt-3 space-y-2">
              <input name="name" required placeholder="Section name" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              <button className="w-full rounded-lg bg-green-600 px-4 py-2 font-semibold text-white">Add section</button>
            </div>
          </form>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="font-bold text-slate-900">Manage sections</h2>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {categories?.map((category) => (
              <div key={category.id} className="rounded-xl border border-slate-200 p-3">
                <form action={updateCategoryAction} className="flex flex-wrap gap-2">
                  <input type="hidden" name="id" value={category.id} />
                  <input name="name" defaultValue={category.name} className="flex-1 rounded-lg border border-slate-300 px-3 py-2" />
                  <button className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white">Save</button>
                </form>
                <form action={deleteCategoryAction} className="mt-2">
                  <input type="hidden" name="id" value={category.id} />
                  <button className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white">Delete section</button>
                </form>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="font-bold text-slate-900">Add menu item</h2>
          <form action={createMenuItemAction} className="mt-3 grid gap-2 md:grid-cols-4">
            <select name="category_id" required className="rounded-lg border border-slate-300 px-3 py-2">
              <option value="">Section</option>
              {categories?.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            <input name="name" required placeholder="Item name" className="rounded-lg border border-slate-300 px-3 py-2" />
            <input name="description" placeholder="Description" className="rounded-lg border border-slate-300 px-3 py-2" />
            <input name="price" required placeholder="Price" type="number" step="0.01" className="rounded-lg border border-slate-300 px-3 py-2" />
            <button className="md:col-span-4 rounded-lg bg-green-600 px-4 py-2 font-semibold text-white">Add item</button>
          </form>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="font-bold text-slate-900">Manage menu items</h2>
          <div className="mt-3 space-y-3">
            {items?.map((item) => (
              <div key={item.id} className="rounded-xl border border-slate-200 p-3">
                <form action={updateMenuItemAction} className="grid gap-2 md:grid-cols-5">
                  <input type="hidden" name="id" value={item.id} />
                  <input name="name" defaultValue={item.name} className="rounded-lg border border-slate-300 px-3 py-2" />
                  <input name="description" defaultValue={item.description ?? ""} placeholder="Description" className="rounded-lg border border-slate-300 px-3 py-2" />
                  <input name="price" type="number" step="0.01" defaultValue={item.price} className="rounded-lg border border-slate-300 px-3 py-2" />
                  <select name="category_id" defaultValue={item.category_id} className="rounded-lg border border-slate-300 px-3 py-2">
                    {categories?.map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                  <button className="rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white">Save</button>
                </form>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">Section: {item.categories?.name ?? "Uncategorized"}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">${item.price.toFixed(2)}</span>
                  <form action={toggleMenuItemAvailabilityAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="is_available" value={String(item.is_available)} />
                    <button className={`rounded-full px-3 py-1 text-xs font-semibold text-white ${item.is_available ? "bg-amber-600" : "bg-green-600"}`}>
                      {item.is_available ? "Mark out of stock" : "Mark in stock"}
                    </button>
                  </form>
                  <form action={deleteMenuItemAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <button className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">Delete item</button>
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
