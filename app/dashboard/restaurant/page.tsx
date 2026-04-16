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
import { CopyMenuLinkButton } from "@/components/copy-menu-link-button";
import { ImageUploadField } from "@/components/image-upload-field";

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
      .select(
        "id, name, description, price, image_url, grams, contents, is_available, category_id, categories(name)",
      )
      .eq("restaurant_id", appUser.restaurant_id)
      .order("name"),
  ]);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const menuUrl = `${appUrl.replace(/\/+$/, "")}/${restaurant?.slug ?? ""}`;
  const totalItems = items?.length ?? 0;
  const availableItems = items?.filter((item) => item.is_available).length ?? 0;
  const outOfStockItems = totalItems - availableItems;
  const sectionCount = categories?.length ?? 0;
  const avgPrice =
    totalItems > 0
      ? (items?.reduce((sum, item) => sum + Number(item.price), 0) ?? 0) / totalItems
      : 0;

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-2xl bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 p-5 text-white shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-emerald-100">Restaurant admin</p>
              <h1 className="text-2xl font-bold">{restaurant?.name} Dashboard</h1>
              <p className="text-sm text-emerald-100">Public menu URL: /{restaurant?.slug}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={menuUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-green-700"
              >
                Open public menu
              </a>
              <CopyMenuLinkButton url={menuUrl} />
              <a href="/dashboard/change-password" className="btn border border-white/50 text-white">
                Change password
              </a>
              <form action={signOutAction}>
                <button className="btn border border-white/50 text-white">
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <article className="panel p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sections</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{sectionCount}</p>
          </article>
          <article className="panel p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Menu items</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{totalItems}</p>
          </article>
          <article className="panel p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">In stock</p>
            <p className="mt-1 text-2xl font-bold text-green-700">{availableItems}</p>
            <p className="text-xs text-slate-500">Out of stock: {outOfStockItems}</p>
          </article>
          <article className="panel p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Avg item price</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">${avgPrice.toFixed(2)}</p>
          </article>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <form
            action={updateRestaurantSettingsAction}
            className="panel p-5 lg:col-span-2"
          >
            <h2 className="panel-title">Store settings</h2>
            <div className="mt-3 grid gap-2 md:grid-cols-3">
              <input name="name" defaultValue={restaurant?.name} placeholder="Store name" className="ui-input" />
              <input name="phone" defaultValue={restaurant?.phone} placeholder="WhatsApp number" className="ui-input" />
              <input name="logo_url" defaultValue={restaurant?.logo_url ?? ""} placeholder="Logo URL" className="ui-input" />
              <button className="btn btn-primary md:col-span-3 rounded-xl">Save settings</button>
            </div>
          </form>

          <form action={createCategoryAction} className="panel p-5">
            <h2 className="panel-title">Add section</h2>
            <div className="mt-3 space-y-2">
              <input name="name" required placeholder="Section name" className="ui-input" />
              <button className="btn btn-success w-full rounded-xl">Add section</button>
            </div>
          </form>
        </section>

        <section className="panel p-5">
          <h2 className="panel-title">Manage sections</h2>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {categories?.map((category) => (
              <div key={category.id} className="rounded-xl border border-slate-200 p-3">
                <form action={updateCategoryAction} className="flex flex-wrap gap-2">
                  <input type="hidden" name="id" value={category.id} />
                  <input name="name" defaultValue={category.name} className="ui-input flex-1" />
                  <button className="btn btn-primary rounded-xl">Save</button>
                </form>
                <form action={deleteCategoryAction} className="mt-2">
                  <input type="hidden" name="id" value={category.id} />
                  <button className="btn btn-danger rounded-xl">Delete section</button>
                </form>
              </div>
            ))}
          </div>
        </section>

        <section className="panel p-5">
          <h2 className="panel-title">Add menu item</h2>
          <form
            action={createMenuItemAction}
            encType="multipart/form-data"
            className="mt-3 grid gap-2 md:grid-cols-4"
          >
            <select name="category_id" required className="ui-select">
              <option value="">Section</option>
              {categories?.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            <input name="name" required placeholder="Item name" className="ui-input" />
            <input name="description" placeholder="Description" className="ui-input" />
            <input name="price" required placeholder="Price" type="number" step="0.01" className="ui-input" />
            <input name="grams" placeholder="Grams (optional)" type="number" min={0} className="ui-input" />
            <input name="contents" placeholder="Contains / ingredients" className="ui-input md:col-span-2" />
            <div className="md:col-span-2">
              <ImageUploadField name="image_file" />
            </div>
            <button className="btn btn-success md:col-span-4 rounded-xl">Add item</button>
          </form>
        </section>

        <section className="panel p-5">
          <h2 className="panel-title">Manage menu items</h2>
          <div className="mt-3 space-y-3">
            {items?.map((item) => (
              <div key={item.id} className="rounded-xl border border-slate-200 p-3">
                <form
                  action={updateMenuItemAction}
                  encType="multipart/form-data"
                  className="grid gap-2 md:grid-cols-5"
                >
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="current_image_url" value={item.image_url ?? ""} />
                  <input name="name" defaultValue={item.name} className="ui-input" />
                  <input name="description" defaultValue={item.description ?? ""} placeholder="Description" className="ui-input" />
                  <input name="price" type="number" step="0.01" defaultValue={item.price} className="ui-input" />
                  <input name="grams" type="number" min={0} defaultValue={item.grams ?? ""} placeholder="Grams" className="ui-input" />
                  <input name="contents" defaultValue={item.contents ?? ""} placeholder="Contains / ingredients" className="ui-input md:col-span-2" />
                  <div className="md:col-span-2">
                    <ImageUploadField
                      name="image_file"
                      initialImageUrl={item.image_url}
                      label="Update image"
                    />
                  </div>
                  <select name="category_id" defaultValue={item.category_id} className="ui-select">
                    {categories?.map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                  <button className="btn btn-primary rounded-xl">Save</button>
                </form>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">Section: {item.categories?.[0]?.name ?? "Uncategorized"}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">${item.price.toFixed(2)}</span>
                  {item.grams ? (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{item.grams}g</span>
                  ) : null}
                  {item.contents ? (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">Contains: {item.contents}</span>
                  ) : null}
                  <form action={toggleMenuItemAvailabilityAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="is_available" value={String(item.is_available)} />
                    <button className={`btn ${item.is_available ? "btn-warning" : "btn-success"}`}>
                      {item.is_available ? "Mark out of stock" : "Mark in stock"}
                    </button>
                  </form>
                  <form action={deleteMenuItemAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <button className="btn btn-danger">Delete item</button>
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
