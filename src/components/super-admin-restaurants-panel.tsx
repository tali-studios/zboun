"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deleteRestaurantAction,
  renewSubscriptionAction,
  setNextDueDateAction,
  toggleRestaurantActiveAction,
  toggleRestaurantHomeVisibilityAction,
  updateRestaurantBrowseSectionsAction,
  updateSubscriptionStatusAction,
} from "@/app-actions/superadmin";
import { BROWSE_SECTION_OPTIONS, normalizeBrowseSections } from "@/lib/browse-sections";

type RestaurantRow = {
  id: string;
  name: string;
  slug: string;
  phone: string;
  is_active: boolean;
  show_on_home: boolean;
  browse_sections: string[] | null;
  created_at: string;
  category_count: number;
  item_count: number;
  admin_email: string;
  subscription_id: string | null;
  plan_name: string | null;
  subscription_status: string | null;
  next_due_at: string | null;
  billing_cycle_price: number;
  last_payment_at: string | null;
  outstanding_balance: number;
};

type Props = {
  restaurants: RestaurantRow[];
};

type ActionIconButtonProps = {
  label: string;
  icon: string;
  className: string;
  disabled?: boolean;
  onClick: () => void;
};

function ActionIconButton({ label, icon, className, disabled, onClick }: ActionIconButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-base font-bold text-white shadow-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 ${className}`}
    >
      <span aria-hidden>{icon}</span>
    </button>
  );
}

type ModalState = {
  open: boolean;
  restaurantId: string;
  isActive: boolean;
  action: "delete" | "toggle";
  title: string;
  message: string;
};

type BrowseSectionsEditorState = {
  open: boolean;
  restaurantId: string;
  restaurantName: string;
  sections: string[];
};

export function SuperAdminRestaurantsPanel({ restaurants }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [infoRestaurant, setInfoRestaurant] = useState<RestaurantRow | null>(null);
  const [modal, setModal] = useState<ModalState>({
    open: false,
    restaurantId: "",
    isActive: false,
    action: "delete",
    title: "",
    message: "",
  });
  const [browseSectionsEditor, setBrowseSectionsEditor] = useState<BrowseSectionsEditorState>({
    open: false,
    restaurantId: "",
    restaurantName: "",
    sections: [],
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

  function openBrowseSectionsEditor(restaurant: RestaurantRow) {
    setBrowseSectionsEditor({
      open: true,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      sections: normalizeBrowseSections(restaurant.browse_sections ?? []),
    });
  }

  function toggleBrowseSection(section: string, checked: boolean) {
    setBrowseSectionsEditor((prev) => ({
      ...prev,
      sections: checked
        ? Array.from(new Set([...prev.sections, section]))
        : prev.sections.filter((item) => item !== section),
    }));
  }

  function saveBrowseSections() {
    const chosen = browseSectionsEditor.sections;
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", browseSectionsEditor.restaurantId);
      chosen.forEach((section) => formData.append("browse_sections", section));
      await updateRestaurantBrowseSectionsAction(formData);
      setBrowseSectionsEditor((prev) => ({ ...prev, open: false }));
      router.refresh();
    });
  }

  function updateSubscriptionStatus(subscriptionId: string, currentStatus: string | null) {
    const next = window.prompt(
      "Set subscription status: trial, active, overdue, paused, cancelled",
      currentStatus ?? "active",
    );
    if (!next) return;
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", subscriptionId);
      formData.set("status", next);
      await updateSubscriptionStatusAction(formData);
      router.refresh();
    });
  }

  function setNextDueDate(subscriptionId: string, currentDate: string | null) {
    const current = currentDate ? currentDate.slice(0, 10) : "";
    const next = window.prompt("Set next due date (YYYY-MM-DD)", current);
    if (!next) return;
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", subscriptionId);
      formData.set("next_due_at", `${next}T00:00:00.000Z`);
      await setNextDueDateAction(formData);
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
              </div>
              <span
                className={`rounded-full px-2 py-1 text-xs font-semibold ${
                  restaurant.is_active ? "bg-violet-100 text-violet-700" : "bg-slate-200 text-slate-700"
                }`}
              >
                {restaurant.is_active ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
              <span className="rounded-full bg-slate-100 px-2 py-1">
                {restaurant.subscription_status ?? "No subscription"}
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-1">
                Due: {restaurant.next_due_at ? new Date(restaurant.next_due_at).toLocaleDateString() : "—"}
              </span>
              <span className="rounded-full bg-amber-50 px-2 py-1 text-amber-700">
                Outstanding: ${restaurant.outstanding_balance.toFixed(2)}
              </span>
              <span
                className={`rounded-full px-2 py-1 ${
                  restaurant.show_on_home ? "bg-violet-100 text-violet-700" : "bg-slate-200 text-slate-700"
                }`}
              >
                {restaurant.show_on_home ? "Visible on home" : "Hidden on home"}
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-1">
                Sections: {normalizeBrowseSections(restaurant.browse_sections ?? []).join(", ") || "Lunch"}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <ActionIconButton
                label="Renew subscription"
                icon="↻"
                className="bg-blue-600 hover:bg-blue-500"
                disabled={isPending}
                onClick={() => renewSubscription(restaurant.id)}
              />
              <ActionIconButton
                label={restaurant.is_active ? "Deactivate restaurant" : "Activate restaurant"}
                icon={restaurant.is_active ? "⏸" : "▶"}
                className={restaurant.is_active ? "bg-amber-600 hover:bg-amber-500" : "bg-violet-600 hover:bg-violet-500"}
                disabled={isPending}
                onClick={() => openToggleModal(restaurant)}
              />
              <ActionIconButton
                label={restaurant.show_on_home ? "Hide from home page" : "Show on home page"}
                icon={restaurant.show_on_home ? "👁" : "🏠"}
                className={restaurant.show_on_home ? "bg-slate-700 hover:bg-slate-600" : "bg-violet-600 hover:bg-violet-500"}
                disabled={isPending}
                onClick={() => toggleHomeVisibility(restaurant.id, restaurant.show_on_home)}
              />
              <ActionIconButton
                label="Update browse sections"
                icon="🧭"
                className="bg-violet-600 hover:bg-violet-500"
                disabled={isPending}
                onClick={() => openBrowseSectionsEditor(restaurant)}
              />
              <ActionIconButton
                label="Delete restaurant"
                icon="🗑"
                className="bg-red-600 hover:bg-red-500"
                disabled={isPending}
                onClick={() => openDeleteModal(restaurant)}
              />
              <ActionIconButton
                label="View more info"
                icon="ℹ"
                className="bg-slate-600 hover:bg-slate-500"
                disabled={isPending}
                onClick={() => setInfoRestaurant(restaurant)}
              />
              {restaurant.subscription_id ? (
                <>
                  <ActionIconButton
                    label="Update subscription status"
                    icon="⚙"
                    className="bg-indigo-600 hover:bg-indigo-500"
                    disabled={isPending}
                    onClick={() =>
                      updateSubscriptionStatus(
                        restaurant.subscription_id as string,
                        restaurant.subscription_status,
                      )
                    }
                  />
                  <ActionIconButton
                    label="Set next due date"
                    icon="📅"
                    className="bg-cyan-600 hover:bg-cyan-500"
                    disabled={isPending}
                    onClick={() =>
                      setNextDueDate(restaurant.subscription_id as string, restaurant.next_due_at)
                    }
                  />
                </>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      <div className="mt-4 hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[980px] text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-left text-[11px] uppercase tracking-wide text-slate-500">
              <th className="py-2 whitespace-nowrap">Restaurant</th>
              <th className="py-2 whitespace-nowrap">Slug</th>
              <th className="py-2 whitespace-nowrap">Sub status</th>
              <th className="py-2 whitespace-nowrap">Next due</th>
              <th className="py-2 whitespace-nowrap">Outstanding</th>
              <th className="py-2 whitespace-nowrap">Status</th>
              <th className="py-2 whitespace-nowrap">Home</th>
              <th className="py-2 whitespace-nowrap">Browse sections</th>
              <th className="py-2 whitespace-nowrap">Created</th>
              <th className="py-2 whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((restaurant) => (
              <tr key={restaurant.id} className="border-b border-slate-100">
                <td className="py-3 whitespace-nowrap font-medium text-slate-900">{restaurant.name}</td>
                <td className="py-3 whitespace-nowrap text-slate-600">/{restaurant.slug}</td>
                <td className="py-3 whitespace-nowrap text-slate-600">{restaurant.subscription_status ?? "—"}</td>
                <td className="py-3 whitespace-nowrap text-slate-600">
                  {restaurant.next_due_at
                    ? new Date(restaurant.next_due_at).toLocaleDateString()
                    : "—"}
                </td>
                <td className="py-3 whitespace-nowrap font-medium text-amber-700">
                  ${restaurant.outstanding_balance.toFixed(2)}
                </td>
                <td className="py-3 whitespace-nowrap">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      restaurant.is_active
                        ? "bg-violet-100 text-violet-700"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {restaurant.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="py-3 whitespace-nowrap">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      restaurant.show_on_home
                        ? "bg-violet-100 text-violet-700"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {restaurant.show_on_home ? "Visible" : "Hidden"}
                  </span>
                </td>
                <td className="py-3 whitespace-nowrap text-slate-600">
                  {normalizeBrowseSections(restaurant.browse_sections ?? []).join(", ") || "Lunch"}
                </td>
                <td className="py-3 whitespace-nowrap text-slate-600">
                  {new Date(restaurant.created_at).toLocaleDateString()}
                </td>
                <td className="py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <ActionIconButton
                      label="Renew subscription"
                      icon="↻"
                      className="bg-blue-600 hover:bg-blue-500"
                      disabled={isPending}
                      onClick={() => renewSubscription(restaurant.id)}
                    />
                    <ActionIconButton
                      label={restaurant.is_active ? "Deactivate restaurant" : "Activate restaurant"}
                      icon={restaurant.is_active ? "⏸" : "▶"}
                      className={restaurant.is_active ? "bg-amber-600 hover:bg-amber-500" : "bg-violet-600 hover:bg-violet-500"}
                      disabled={isPending}
                      onClick={() => openToggleModal(restaurant)}
                    />
                    <ActionIconButton
                      label={restaurant.show_on_home ? "Hide from home page" : "Show on home page"}
                      icon={restaurant.show_on_home ? "👁" : "🏠"}
                      className={restaurant.show_on_home ? "bg-slate-700 hover:bg-slate-600" : "bg-violet-600 hover:bg-violet-500"}
                      disabled={isPending}
                      onClick={() => toggleHomeVisibility(restaurant.id, restaurant.show_on_home)}
                    />
                    <ActionIconButton
                      label="Update browse sections"
                      icon="🧭"
                      className="bg-violet-600 hover:bg-violet-500"
                      disabled={isPending}
                      onClick={() => openBrowseSectionsEditor(restaurant)}
                    />
                    <ActionIconButton
                      label="Delete restaurant"
                      icon="🗑"
                      className="bg-red-600 hover:bg-red-500"
                      disabled={isPending}
                      onClick={() => openDeleteModal(restaurant)}
                    />
                    <ActionIconButton
                      label="View more info"
                      icon="ℹ"
                      className="bg-slate-600 hover:bg-slate-500"
                      disabled={isPending}
                      onClick={() => setInfoRestaurant(restaurant)}
                    />
                    {restaurant.subscription_id ? (
                      <>
                        <ActionIconButton
                          label="Update subscription status"
                          icon="⚙"
                          className="bg-indigo-600 hover:bg-indigo-500"
                          disabled={isPending}
                          onClick={() =>
                            updateSubscriptionStatus(
                              restaurant.subscription_id as string,
                              restaurant.subscription_status,
                            )
                          }
                        />
                        <ActionIconButton
                          label="Set next due date"
                          icon="📅"
                          className="bg-cyan-600 hover:bg-cyan-500"
                          disabled={isPending}
                          onClick={() =>
                            setNextDueDate(restaurant.subscription_id as string, restaurant.next_due_at)
                          }
                        />
                      </>
                    ) : null}
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

      {infoRestaurant && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl ring-1 ring-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Restaurant details</h3>
            <div className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
              <p><span className="font-semibold">Name:</span> {infoRestaurant.name}</p>
              <p><span className="font-semibold">Slug:</span> /{infoRestaurant.slug}</p>
              <p><span className="font-semibold">Admin email:</span> {infoRestaurant.admin_email}</p>
              <p><span className="font-semibold">Phone:</span> {infoRestaurant.phone}</p>
              <p><span className="font-semibold">Sections:</span> {infoRestaurant.category_count}</p>
              <p><span className="font-semibold">Items:</span> {infoRestaurant.item_count}</p>
              <p><span className="font-semibold">Plan:</span> {infoRestaurant.plan_name ?? "No plan"}</p>
              <p><span className="font-semibold">Sub status:</span> {infoRestaurant.subscription_status ?? "—"}</p>
              <p>
                <span className="font-semibold">Last payment:</span>{" "}
                {infoRestaurant.last_payment_at
                  ? new Date(infoRestaurant.last_payment_at).toLocaleDateString()
                  : "—"}
              </p>
              <p>
                <span className="font-semibold">Next due:</span>{" "}
                {infoRestaurant.next_due_at
                  ? new Date(infoRestaurant.next_due_at).toLocaleDateString()
                  : "—"}
              </p>
              <p><span className="font-semibold">Outstanding:</span> ${infoRestaurant.outstanding_balance.toFixed(2)}</p>
              <p><span className="font-semibold">Created:</span> {new Date(infoRestaurant.created_at).toLocaleDateString()}</p>
              <p className="sm:col-span-2">
                <span className="font-semibold">Browse sections:</span>{" "}
                {normalizeBrowseSections(infoRestaurant.browse_sections ?? []).join(", ") || "Lunch"}
              </p>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setInfoRestaurant(null)}
                className="btn btn-secondary rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {browseSectionsEditor.open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl ring-1 ring-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Browse sections</h3>
            <p className="mt-1 text-sm text-slate-600">
              Select where <span className="font-semibold">{browseSectionsEditor.restaurantName}</span> appears on the home page.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {BROWSE_SECTION_OPTIONS.map((section) => (
                <label
                  key={section}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                >
                  <input
                    type="checkbox"
                    checked={browseSectionsEditor.sections.includes(section)}
                    onChange={(event) => toggleBrowseSection(section, event.target.checked)}
                    className="h-4 w-4 accent-violet-600"
                  />
                  <span>{section}</span>
                </label>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-500">
              If none are selected, we default to <span className="font-semibold">Lunch</span>.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setBrowseSectionsEditor((prev) => ({ ...prev, open: false }))}
                className="btn btn-secondary rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={saveBrowseSections}
                className="btn btn-primary rounded-xl disabled:opacity-70"
              >
                Save sections
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
