"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deleteRestaurantAction,
  renewSubscriptionAction,
  toggleRestaurantActiveAction,
  toggleRestaurantHomeVisibilityAction,
} from "@/app-actions/superadmin";

type RestaurantRow = {
  id: string;
  name: string;
  slug: string;
  phone: string;
  is_active: boolean;
  show_on_home: boolean;
  created_at: string;
  category_count: number;
  item_count: number;
  admin_email: string;
};

type Props = {
  restaurants: RestaurantRow[];
};

type ModalState = {
  open: boolean;
  restaurantId: string;
  isActive: boolean;
  action: "delete" | "toggle";
  title: string;
  message: string;
};

export function SuperAdminRestaurantsPanel({ restaurants }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [modal, setModal] = useState<ModalState>({
    open: false,
    restaurantId: "",
    isActive: false,
    action: "delete",
    title: "",
    message: "",
  });

  const filtered = useMemo(() => {
    const search = q.trim().toLowerCase();
    return restaurants.filter((restaurant) => {
      const matchSearch =
        !search ||
        restaurant.name.toLowerCase().includes(search) ||
        restaurant.slug.toLowerCase().includes(search) ||
        restaurant.phone.toLowerCase().includes(search);
      const matchStatus =
        status === "all" ||
        (status === "active" && restaurant.is_active) ||
        (status === "inactive" && !restaurant.is_active);
      return matchSearch && matchStatus;
    });
  }, [q, restaurants, status]);

  function openDeleteModal(restaurant: RestaurantRow) {
    setModal({
      open: true,
      restaurantId: restaurant.id,
      isActive: restaurant.is_active,
      action: "delete",
      title: "Delete restaurant?",
      message:
        "This will remove the restaurant and related menu records. This action cannot be undone.",
    });
  }

  function openToggleModal(restaurant: RestaurantRow) {
    const isActive = restaurant.is_active;
    setModal({
      open: true,
      restaurantId: restaurant.id,
      isActive,
      action: "toggle",
      title: isActive ? "Deactivate restaurant?" : "Activate restaurant?",
      message: isActive
        ? "The public menu will stop working for this restaurant."
        : "The public menu will become available again.",
    });
  }

  function confirmModalAction() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", modal.restaurantId);
      if (modal.action === "toggle") {
        formData.set("is_active", String(modal.isActive));
        await toggleRestaurantActiveAction(formData);
      } else {
        await deleteRestaurantAction(formData);
      }
      setModal((prev) => ({ ...prev, open: false }));
      router.refresh();
    });
  }

  function renewSubscription(restaurantId: string) {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", restaurantId);
      await renewSubscriptionAction(formData);
      router.refresh();
    });
  }

  function toggleHomeVisibility(restaurantId: string, showOnHome: boolean) {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", restaurantId);
      formData.set("show_on_home", String(showOnHome));
      await toggleRestaurantHomeVisibilityAction(formData);
      router.refresh();
    });
  }

  return (
    <section className="panel p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900">Restaurants</h2>
        <div className="text-xs text-slate-500">{filtered.length} results</div>
      </div>

      <div className="grid gap-2 md:grid-cols-4">
        <input
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Search by name, slug, phone"
          className="ui-input md:col-span-2"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as "all" | "active" | "inactive")}
          className="ui-select"
        >
          <option value="all">All</option>
          <option value="active">Active only</option>
          <option value="inactive">Inactive only</option>
        </select>
        <button
          type="button"
          onClick={() => {
            setQ("");
            setStatus("all");
          }}
          className="btn btn-secondary rounded-xl"
        >
          Reset
        </button>
      </div>

      <div className="mt-4 space-y-3 lg:hidden">
        {filtered.map((restaurant) => (
          <article
            key={restaurant.id}
            className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm sm:p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-slate-900">{restaurant.name}</h3>
                <p className="text-xs text-slate-500">/{restaurant.slug}</p>
                <p className="mt-1 text-xs text-slate-600">{restaurant.admin_email}</p>
              </div>
              <span
                className={`rounded-full px-2 py-1 text-xs font-semibold ${
                  restaurant.is_active ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-700"
                }`}
              >
                {restaurant.is_active ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
              <span className="rounded-full bg-slate-100 px-2 py-1">{restaurant.phone}</span>
              <span className="rounded-full bg-slate-100 px-2 py-1">
                {restaurant.category_count} sections
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-1">{restaurant.item_count} items</span>
              <span
                className={`rounded-full px-2 py-1 ${
                  restaurant.show_on_home ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"
                }`}
              >
                {restaurant.show_on_home ? "Visible on home" : "Hidden on home"}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isPending}
                onClick={() => renewSubscription(restaurant.id)}
                className="btn bg-blue-600 text-white disabled:opacity-70"
              >
                Renew
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => openToggleModal(restaurant)}
                className={`btn text-white disabled:opacity-70 ${
                  restaurant.is_active ? "bg-amber-600" : "bg-green-600"
                }`}
              >
                {restaurant.is_active ? "Deactivate" : "Activate"}
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => toggleHomeVisibility(restaurant.id, restaurant.show_on_home)}
                className={`btn text-white disabled:opacity-70 ${
                  restaurant.show_on_home ? "bg-slate-700" : "bg-emerald-600"
                }`}
              >
                {restaurant.show_on_home ? "Hide on home" : "Show on home"}
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => openDeleteModal(restaurant)}
                className="btn bg-red-600 text-white disabled:opacity-70"
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-4 hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[980px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="py-2">Restaurant</th>
              <th className="py-2">Admin</th>
              <th className="py-2">Slug</th>
              <th className="py-2">Sections / Items</th>
              <th className="py-2">Phone</th>
              <th className="py-2">Status</th>
              <th className="py-2">Home</th>
              <th className="py-2">Created</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((restaurant) => (
              <tr key={restaurant.id} className="border-b border-slate-100">
                <td className="py-3 font-medium text-slate-900">{restaurant.name}</td>
                <td className="py-3 text-slate-600">{restaurant.admin_email}</td>
                <td className="py-3 text-slate-600">/{restaurant.slug}</td>
                <td className="py-3 text-slate-600">
                  {restaurant.category_count} / {restaurant.item_count}
                </td>
                <td className="py-3 text-slate-600">{restaurant.phone}</td>
                <td className="py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      restaurant.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {restaurant.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      restaurant.show_on_home
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {restaurant.show_on_home ? "Visible" : "Hidden"}
                  </span>
                </td>
                <td className="py-3 text-slate-600">
                  {new Date(restaurant.created_at).toLocaleDateString()}
                </td>
                <td className="py-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => renewSubscription(restaurant.id)}
                      className="btn bg-blue-600 text-white disabled:opacity-70"
                    >
                      Renew
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => openToggleModal(restaurant)}
                      className={`btn text-white disabled:opacity-70 ${
                        restaurant.is_active ? "bg-amber-600" : "bg-green-600"
                      }`}
                    >
                      {restaurant.is_active ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => toggleHomeVisibility(restaurant.id, restaurant.show_on_home)}
                      className={`btn text-white disabled:opacity-70 ${
                        restaurant.show_on_home ? "bg-slate-700" : "bg-emerald-600"
                      }`}
                    >
                      {restaurant.show_on_home ? "Hide on home" : "Show on home"}
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => openDeleteModal(restaurant)}
                      className="btn bg-red-600 text-white disabled:opacity-70"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal.open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl ring-1 ring-slate-200">
            <h3 className="text-lg font-bold text-slate-900">{modal.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{modal.message}</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModal((prev) => ({ ...prev, open: false }))}
                className="btn btn-secondary rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={confirmModalAction}
                className="btn btn-danger rounded-xl disabled:opacity-70"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
