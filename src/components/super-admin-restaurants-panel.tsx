"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deleteRestaurantAction,
  disableAddonAction,
  enableAddonAction,
  grantComplimentaryBillingAction,
  renewSubscriptionAction,
  setNextDueDateAction,
  setRestaurantAdminPasswordAction,
  toggleRestaurantActiveAction,
  toggleRestaurantHomeVisibilityAction,
  updateRestaurantBrowseSectionsAction,
  updateSubscriptionStatusAction,
} from "@/app-actions/superadmin";

const ALL_ADDONS: { key: string; label: string; description: string }[] = [
  { key: "inventory", label: "Inventory Management", description: "Stock tracking, suppliers, and movement log." },
  { key: "accounting", label: "Accounting & Payroll", description: "Financial management, expenses, and staff payroll." },
  { key: "pos", label: "Cloud & Offline POS", description: "Point-of-sale system with customer receipts." },
  { key: "crm", label: "CRM", description: "Customer profiles, order history, notes, and tags." },
  { key: "loyalty", label: "Loyalty Management", description: "Points, stamps, tiers, and referral rewards." },
  { key: "events", label: "Event Management", description: "Table reservations and private event bookings." },
  { key: "pms", label: "Property Management (PMS)", description: "Rooms, reservations, housekeeping, and charges." },
  { key: "ecommerce", label: "E-commerce Integration", description: "Online ordering, delivery zones, and order management." },
  { key: "fleet", label: "Fleet Management", description: "Vehicles, drivers, delivery dispatch, and maintenance logs." },
  { key: "club", label: "Club Management", description: "Membership plans, check-ins, and subscription invoicing." },
];
import { BROWSE_SECTION_OPTIONS, formatBrowseSectionsLabel, getBrowseSubTags, getParentSectionForSubFilter, getRawBrowseSectionValues, getSubFiltersForSection, normalizeBrowseSections, validateBrowseSelection, type BrowseSection } from "@/lib/browse-sections";
import { hasCatalogDashboard, type BusinessTypeKey } from "@/lib/business-types";
import {
  formatNextDueLine,
  formatSubscriptionStatus,
  isSubscriptionPastDue,
  subscriptionStatusBadgeClass,
} from "@/lib/subscription-display";
import { DashboardAlertModal } from "@/components/dashboard-alert-modal";
import { SuperAdminSetPasswordModal } from "@/components/super-admin-set-password-modal";
import { ComplimentaryBillingModalFields } from "@/components/complimentary-billing-fields";
import {
  hasComplimentaryAccess,
  type ComplimentaryUnit,
} from "@/lib/complimentary-billing";

type RestaurantRow = {
  id: string;
  name: string;
  slug: string;
  phone: string;
  business_type: string | null;
  is_active: boolean;
  billing_exempt: boolean;
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
  addons: Record<string, boolean>;
};

type Props = {
  restaurants: RestaurantRow[];
};

type ActionIconButtonProps = {
  /** Full label for tooltips (desktop hover) and screen readers */
  label: string;
  /** Short text shown beside the icon on phone/tablet (defaults to label on desktop) */
  shortLabel?: string;
  icon: string;
  className: string;
  disabled?: boolean;
  onClick: () => void;
  /** Table row: icon-only, single horizontal line */
  tableRow?: boolean;
};

function ActionIconButton({
  label,
  shortLabel,
  icon,
  className,
  disabled,
  onClick,
  tableRow,
}: ActionIconButtonProps) {
  const displayShort = shortLabel ?? label;
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={
        tableRow
          ? `inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
          : `inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full font-semibold text-white shadow-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 max-lg:min-w-0 max-lg:flex-1 max-lg:px-2.5 max-lg:py-2 max-lg:text-[11px] lg:h-9 lg:w-9 lg:gap-0 lg:px-0 lg:text-base lg:font-bold ${className}`
      }
    >
      <span aria-hidden className="shrink-0 text-sm lg:text-base">
        {icon}
      </span>
      <span className={tableRow ? "sr-only" : "truncate lg:sr-only"}>{displayShort}</span>
    </button>
  );
}

/** Data column tints — helps scan rows; actions stay in a neutral column. */
const TABLE_DATA_COLUMNS = [
  { label: "Business", header: "bg-slate-200/90 text-slate-800", cell: "bg-slate-50" },
  { label: "Slug", header: "bg-zinc-200/90 text-zinc-800", cell: "bg-zinc-50/90" },
  { label: "Sub status", header: "bg-emerald-200/90 text-emerald-900", cell: "bg-emerald-50/80" },
  { label: "Next due", header: "bg-sky-200/90 text-sky-900", cell: "bg-sky-50/80" },
  { label: "Outstanding", header: "bg-amber-200/90 text-amber-900", cell: "bg-amber-50/80" },
  { label: "Status", header: "bg-violet-200/90 text-violet-900", cell: "bg-violet-50/80" },
  { label: "Home", header: "bg-indigo-200/90 text-indigo-900", cell: "bg-indigo-50/80" },
  { label: "Categories", header: "bg-fuchsia-200/90 text-fuchsia-900", cell: "bg-fuchsia-50/80" },
  { label: "Created", header: "bg-stone-200/90 text-stone-800", cell: "bg-stone-50/90" },
] as const;

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
  sections: BrowseSection[];
  subTags: string[];
  error: string | null;
};

type AddonsEditorState = {
  open: boolean;
  restaurantId: string;
  restaurantName: string;
  addons: Record<string, boolean>;
};

type ComplimentaryModalState = {
  open: boolean;
  restaurant: RestaurantRow | null;
  unit: ComplimentaryUnit;
  amount: number;
};

function restaurantHasComplimentaryAccess(restaurant: RestaurantRow) {
  return hasComplimentaryAccess(
    restaurant.billing_exempt,
    restaurant.billing_cycle_price,
    restaurant.next_due_at,
  );
}

function subscriptionStatusLabel(restaurant: RestaurantRow) {
  if (restaurant.billing_exempt) return "Lifetime free";
  if (restaurantHasComplimentaryAccess(restaurant)) return "Complimentary";
  return formatSubscriptionStatus(restaurant.subscription_status);
}

function isRestaurantPastDue(restaurant: RestaurantRow) {
  if (restaurantHasComplimentaryAccess(restaurant)) return false;
  return isSubscriptionPastDue(restaurant.next_due_at, restaurant.subscription_status);
}

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
    sections: ["Food & Restaurants"],
    subTags: [],
    error: null,
  });
  const [addonsEditor, setAddonsEditor] = useState<AddonsEditorState>({
    open: false,
    restaurantId: "",
    restaurantName: "",
    addons: {},
  });
  const [passwordRestaurant, setPasswordRestaurant] = useState<RestaurantRow | null>(null);
  const [complimentaryModal, setComplimentaryModal] = useState<ComplimentaryModalState>({
    open: false,
    restaurant: null,
    unit: "months",
    amount: 3,
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

  function hasHomeCategory(restaurant: RestaurantRow) {
    return hasCatalogDashboard(
      (restaurant.business_type ?? "retail_store") as BusinessTypeKey,
    );
  }

  function openDeleteModal(restaurant: RestaurantRow) {
    setModal({
      open: true,
      restaurantId: restaurant.id,
      isActive: restaurant.is_active,
      action: "delete",
      title: "Delete business?",
      message:
        "This will remove the business and related records. This action cannot be undone.",
    });
  }

  function openToggleModal(restaurant: RestaurantRow) {
    const isActive = restaurant.is_active;
    setModal({
      open: true,
      restaurantId: restaurant.id,
      isActive,
      action: "toggle",
      title: isActive ? "Deactivate business?" : "Activate business?",
      message: isActive
        ? "The public page will stop working for this business."
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

  function openComplimentaryModal(restaurant: RestaurantRow) {
    setComplimentaryModal({
      open: true,
      restaurant,
      unit: "months",
      amount: 3,
    });
  }

  function grantComplimentaryAccess() {
    if (!complimentaryModal.restaurant) return;
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", complimentaryModal.restaurant!.id);
      formData.set("complimentary_unit", complimentaryModal.unit);
      formData.set("complimentary_amount", String(complimentaryModal.amount));
      await grantComplimentaryBillingAction(formData);
      setComplimentaryModal((prev) => ({ ...prev, open: false, restaurant: null }));
      router.refresh();
    });
  }

  function removeComplimentaryAccess(restaurant: RestaurantRow) {
    if (
      !window.confirm(
        `Remove free access for ${restaurant.name} and return to standard monthly billing?`,
      )
    ) {
      return;
    }
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", restaurant.id);
      formData.set("remove_complimentary", "true");
      await grantComplimentaryBillingAction(formData);
      router.refresh();
    });
  }

  function handleComplimentaryAction(restaurant: RestaurantRow) {
    if (restaurantHasComplimentaryAccess(restaurant)) {
      removeComplimentaryAccess(restaurant);
      return;
    }
    openComplimentaryModal(restaurant);
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
    const raw = getRawBrowseSectionValues(restaurant.browse_sections ?? []);
    const sections = normalizeBrowseSections(raw);
    const subTags = getBrowseSubTags(raw);
    setBrowseSectionsEditor({
      open: true,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      sections: sections.length > 0 ? sections : ["Food & Restaurants"],
      subTags,
      error: null,
    });
  }

  function toggleBrowseSection(section: BrowseSection) {
    setBrowseSectionsEditor((prev) => {
      const has = prev.sections.includes(section);
      const sections = has
        ? prev.sections.filter((value) => value !== section)
        : [...prev.sections, section];
      const subTags = has
        ? prev.subTags.filter((tag) => getParentSectionForSubFilter(tag) !== section)
        : prev.subTags;
      return { ...prev, sections, subTags, error: null };
    });
  }

  function toggleSubTag(tag: string) {
    setBrowseSectionsEditor((prev) => {
      const has = prev.subTags.includes(tag);
      const subTags = has ? prev.subTags.filter((value) => value !== tag) : [...prev.subTags, tag];
      return { ...prev, subTags, error: null };
    });
  }

  function saveBrowseSections() {
    const selection = [...browseSectionsEditor.sections, ...browseSectionsEditor.subTags];
    const validated = validateBrowseSelection(selection);
    if (!validated.ok) {
      setBrowseSectionsEditor((prev) => ({ ...prev, error: validated.error }));
      return;
    }
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", browseSectionsEditor.restaurantId);
      for (const section of browseSectionsEditor.sections) {
        formData.append("browse_sections", section);
      }
      for (const tag of browseSectionsEditor.subTags) {
        formData.append("browse_sections", tag);
      }
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

  function openAddonsEditor(restaurant: RestaurantRow) {
    setAddonsEditor({
      open: true,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      addons: { ...restaurant.addons },
    });
  }

  function toggleAddon(key: string) {
    setAddonsEditor((prev) => ({
      ...prev,
      addons: { ...prev.addons, [key]: !prev.addons[key] },
    }));
  }

  function saveAddons() {
    startTransition(async () => {
      const { restaurantId, addons } = addonsEditor;
      await Promise.all(
        ALL_ADDONS.map(async ({ key }) => {
          const enabled = Boolean(addons[key]);
          const formData = new FormData();
          formData.set("restaurant_id", restaurantId);
          formData.set("addon_key", key);
          if (enabled) {
            await enableAddonAction(formData);
          } else {
            await disableAddonAction(formData);
          }
        }),
      );
      setAddonsEditor((prev) => ({ ...prev, open: false }));
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

  function resetRestaurantPassword(
    restaurant: RestaurantRow,
    password: string,
    confirmPassword: string,
  ) {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("restaurant_id", restaurant.id);
      formData.set("password", password);
      formData.set("confirm_password", confirmPassword);
      await setRestaurantAdminPasswordAction(formData);
      setPasswordRestaurant(null);
      router.refresh();
    });
  }

  function canResetPassword(restaurant: RestaurantRow) {
    return Boolean(restaurant.admin_email && restaurant.admin_email !== "No admin linked");
  }

  return (
    <section className="panel p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900">Businesses</h2>
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
              <span
                className={`rounded-full px-2 py-1 font-semibold ${subscriptionStatusBadgeClass(
                  restaurant.subscription_status,
                  isRestaurantPastDue(restaurant),
                )}`}
              >
                {subscriptionStatusLabel(restaurant)}
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-1">
                Due:{" "}
                {formatNextDueLine(
                  restaurant.next_due_at,
                  restaurant.billing_exempt,
                  restaurant.billing_cycle_price,
                )}
              </span>
              {!restaurantHasComplimentaryAccess(restaurant) ? (
                <span className="rounded-full bg-amber-50 px-2 py-1 text-amber-700">
                  Outstanding: ${restaurant.outstanding_balance.toFixed(2)}
                </span>
              ) : null}
              {hasHomeCategory(restaurant) ? (
                <>
                  <span
                    className={`rounded-full px-2 py-1 ${
                      restaurant.show_on_home ? "bg-violet-100 text-violet-700" : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {restaurant.show_on_home ? "Visible on home" : "Hidden on home"}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-1">
                    Categories: {formatBrowseSectionsLabel(restaurant.browse_sections)}
                  </span>
                </>
              ) : (
                <span className="rounded-full bg-slate-100 px-2 py-1">
                  Home category: N/A
                </span>
              )}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              <ActionIconButton
                label={
                  restaurantHasComplimentaryAccess(restaurant)
                    ? "Remove free access"
                    : "Grant free access"
                }
                shortLabel={restaurantHasComplimentaryAccess(restaurant) ? "Paid plan" : "Free access"}
                icon={restaurantHasComplimentaryAccess(restaurant) ? "💳" : "🎁"}
                className={
                  restaurantHasComplimentaryAccess(restaurant)
                    ? "bg-slate-700 hover:bg-slate-600"
                    : "bg-emerald-600 hover:bg-emerald-500"
                }
                disabled={isPending}
                onClick={() => handleComplimentaryAction(restaurant)}
              />
              <ActionIconButton
                label="Renew subscription"
                shortLabel="Renew"
                icon="↻"
                className="bg-blue-600 hover:bg-blue-500"
                disabled={isPending}
                onClick={() => renewSubscription(restaurant.id)}
              />
              <ActionIconButton
                label={restaurant.is_active ? "Deactivate business" : "Activate business"}
                shortLabel={restaurant.is_active ? "Deactivate" : "Activate"}
                icon={restaurant.is_active ? "⏸" : "▶"}
                className={restaurant.is_active ? "bg-amber-600 hover:bg-amber-500" : "bg-violet-600 hover:bg-violet-500"}
                disabled={isPending}
                onClick={() => openToggleModal(restaurant)}
              />
              {hasHomeCategory(restaurant) ? (
                <>
                  <ActionIconButton
                    label={restaurant.show_on_home ? "Hide from home page" : "Show on home page"}
                    shortLabel={restaurant.show_on_home ? "Hide home" : "Show home"}
                    icon={restaurant.show_on_home ? "👁" : "🏠"}
                    className={restaurant.show_on_home ? "bg-slate-700 hover:bg-slate-600" : "bg-violet-600 hover:bg-violet-500"}
                    disabled={isPending}
                    onClick={() => toggleHomeVisibility(restaurant.id, restaurant.show_on_home)}
                  />
                  <ActionIconButton
                    label="Home browse category"
                    shortLabel="Category"
                    icon="🧭"
                    className="bg-violet-600 hover:bg-violet-500"
                    disabled={isPending}
                    onClick={() => openBrowseSectionsEditor(restaurant)}
                  />
                </>
              ) : null}
              <ActionIconButton
                label="Delete business"
                shortLabel="Delete"
                icon="🗑"
                className="bg-red-600 hover:bg-red-500"
                disabled={isPending}
                onClick={() => openDeleteModal(restaurant)}
              />
              <ActionIconButton
                label="View more info"
                shortLabel="Info"
                icon="ℹ"
                className="bg-slate-600 hover:bg-slate-500"
                disabled={isPending}
                onClick={() => setInfoRestaurant(restaurant)}
              />
              {canResetPassword(restaurant) ? (
                <ActionIconButton
                  label="Reset admin password"
                  shortLabel="Password"
                  icon="🔑"
                  className="bg-violet-600 hover:bg-violet-500"
                  disabled={isPending}
                  onClick={() => setPasswordRestaurant(restaurant)}
                />
              ) : null}
              <ActionIconButton
                label="Manage add-ons"
                shortLabel="Add-ons"
                icon="🧩"
                className="bg-teal-600 hover:bg-teal-500"
                disabled={isPending}
                onClick={() => openAddonsEditor(restaurant)}
              />
              {restaurant.subscription_id ? (
                <>
                  <ActionIconButton
                    label="Update subscription status"
                    shortLabel="Sub status"
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
                    shortLabel="Due date"
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
        <table className="w-full min-w-[1320px] border-separate border-spacing-0 text-xs">
          <colgroup>
            <col className="w-[min(14rem,16%)]" />
            <col className="w-[min(9rem,11%)]" />
            <col className="w-[6.5rem]" />
            <col className="w-[min(11rem,13%)]" />
            <col className="w-[5.5rem]" />
            <col className="w-[5rem]" />
            <col className="w-[4.5rem]" />
            <col className="w-[min(6.5rem,8%)]" />
            <col className="w-[5.5rem]" />
            <col className="min-w-[21rem]" />
          </colgroup>
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide">
              {TABLE_DATA_COLUMNS.map((col) => (
                <th
                  key={col.label}
                  className={`border-r border-white/70 px-3 py-2 font-bold whitespace-nowrap ${col.header}`}
                >
                  {col.label}
                </th>
              ))}
              <th className="bg-white px-3 py-2 font-bold text-slate-600 whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((restaurant) => (
              <tr key={restaurant.id} className="border-b border-slate-200/80">
                <td className={`border-r border-white/50 px-3 py-3 font-medium text-slate-900 ${TABLE_DATA_COLUMNS[0].cell}`}>
                  <span className="block truncate" title={restaurant.name}>
                    {restaurant.name}
                  </span>
                </td>
                <td className={`border-r border-white/50 px-3 py-3 text-slate-600 ${TABLE_DATA_COLUMNS[1].cell}`}>
                  <span className="block truncate" title={restaurant.slug}>
                    /{restaurant.slug}
                  </span>
                </td>
                <td className={`border-r border-white/50 px-3 py-3 whitespace-nowrap ${TABLE_DATA_COLUMNS[2].cell}`}>
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${subscriptionStatusBadgeClass(
                      restaurant.subscription_status,
                      isRestaurantPastDue(restaurant),
                    )}`}
                  >
                    {subscriptionStatusLabel(restaurant)}
                  </span>
                </td>
                <td className={`border-r border-white/50 px-3 py-3 whitespace-nowrap text-slate-700 ${TABLE_DATA_COLUMNS[3].cell}`}>
                  {formatNextDueLine(
                    restaurant.next_due_at,
                    restaurant.billing_exempt,
                    restaurant.billing_cycle_price,
                  )}
                </td>
                <td className={`border-r border-white/50 px-3 py-3 whitespace-nowrap font-semibold text-amber-900 ${TABLE_DATA_COLUMNS[4].cell}`}>
                  {restaurantHasComplimentaryAccess(restaurant)
                    ? "—"
                    : `$${restaurant.outstanding_balance.toFixed(2)}`}
                </td>
                <td className={`border-r border-white/50 px-3 py-3 whitespace-nowrap ${TABLE_DATA_COLUMNS[5].cell}`}>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      restaurant.is_active
                        ? "bg-violet-200 text-violet-900"
                        : "bg-slate-300/80 text-slate-800"
                    }`}
                  >
                    {restaurant.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className={`border-r border-white/50 px-3 py-3 whitespace-nowrap ${TABLE_DATA_COLUMNS[6].cell}`}>
                  {hasHomeCategory(restaurant) ? (
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        restaurant.show_on_home
                          ? "bg-indigo-200 text-indigo-900"
                          : "bg-slate-300/80 text-slate-800"
                      }`}
                    >
                      {restaurant.show_on_home ? "Visible" : "Hidden"}
                    </span>
                  ) : (
                    <span className="rounded-full bg-white/60 px-2 py-1 text-xs font-semibold text-slate-600">N/A</span>
                  )}
                </td>
                <td className={`border-r border-white/50 px-3 py-3 whitespace-nowrap text-slate-700 ${TABLE_DATA_COLUMNS[7].cell}`}>
                  {hasHomeCategory(restaurant)
                    ? formatBrowseSectionsLabel(restaurant.browse_sections)
                    : "N/A"}
                </td>
                <td className={`px-3 py-3 whitespace-nowrap text-slate-700 ${TABLE_DATA_COLUMNS[8].cell}`}>
                  {new Date(restaurant.created_at).toLocaleDateString()}
                </td>
                <td className="bg-white px-2 py-2 align-middle whitespace-nowrap">
                  <div className="inline-flex flex-nowrap items-center justify-end gap-1">
                    <ActionIconButton
                      tableRow
                      label={
                        restaurantHasComplimentaryAccess(restaurant)
                          ? "Remove free access"
                          : "Grant free access"
                      }
                      icon={restaurantHasComplimentaryAccess(restaurant) ? "💳" : "🎁"}
                      className={restaurantHasComplimentaryAccess(restaurant) ? "bg-slate-700" : "bg-emerald-600"}
                      disabled={isPending}
                      onClick={() => handleComplimentaryAction(restaurant)}
                    />
                    <ActionIconButton
                      tableRow
                      label="Renew subscription"
                      icon="↻"
                      className="bg-blue-600"
                      disabled={isPending}
                      onClick={() => renewSubscription(restaurant.id)}
                    />
                    <ActionIconButton
                      tableRow
                      label={restaurant.is_active ? "Deactivate business" : "Activate business"}
                      icon={restaurant.is_active ? "⏸" : "▶"}
                      className={restaurant.is_active ? "bg-amber-600" : "bg-violet-600"}
                      disabled={isPending}
                      onClick={() => openToggleModal(restaurant)}
                    />
                    {hasHomeCategory(restaurant) ? (
                      <>
                        <ActionIconButton
                          tableRow
                          label={restaurant.show_on_home ? "Hide from home page" : "Show on home page"}
                          icon={restaurant.show_on_home ? "👁" : "🏠"}
                          className={restaurant.show_on_home ? "bg-slate-700" : "bg-violet-600"}
                          disabled={isPending}
                          onClick={() => toggleHomeVisibility(restaurant.id, restaurant.show_on_home)}
                        />
                        <ActionIconButton
                          tableRow
                          label="Home browse category"
                          icon="🧭"
                          className="bg-violet-600"
                          disabled={isPending}
                          onClick={() => openBrowseSectionsEditor(restaurant)}
                        />
                      </>
                    ) : null}
                    <ActionIconButton
                      tableRow
                      label="Delete business"
                      icon="🗑"
                      className="bg-red-600"
                      disabled={isPending}
                      onClick={() => openDeleteModal(restaurant)}
                    />
                    <ActionIconButton
                      tableRow
                      label="View more info"
                      icon="ℹ"
                      className="bg-slate-600"
                      disabled={isPending}
                      onClick={() => setInfoRestaurant(restaurant)}
                    />
                    {canResetPassword(restaurant) ? (
                      <ActionIconButton
                        tableRow
                        label="Reset admin password"
                        icon="🔑"
                        className="bg-violet-600"
                        disabled={isPending}
                        onClick={() => setPasswordRestaurant(restaurant)}
                      />
                    ) : null}
                    <ActionIconButton
                      tableRow
                      label="Manage add-ons"
                      icon="🧩"
                      className="bg-teal-600"
                      disabled={isPending}
                      onClick={() => openAddonsEditor(restaurant)}
                    />
                    {restaurant.subscription_id ? (
                      <>
                        <ActionIconButton
                          tableRow
                          label="Update subscription status"
                          icon="⚙"
                          className="bg-indigo-600"
                          disabled={isPending}
                          onClick={() =>
                            updateSubscriptionStatus(
                              restaurant.subscription_id as string,
                              restaurant.subscription_status,
                            )
                          }
                        />
                        <ActionIconButton
                          tableRow
                          label="Set next due date"
                          icon="📅"
                          className="bg-cyan-600"
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

      {complimentaryModal.open && complimentaryModal.restaurant ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl ring-1 ring-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Grant free access</h3>
            <p className="mt-2 text-sm text-slate-600">
              Choose how long <strong>{complimentaryModal.restaurant.name}</strong> stays on a
              complimentary plan. After that, standard monthly billing applies.
            </p>
            <div className="mt-4">
              <ComplimentaryBillingModalFields
                unit={complimentaryModal.unit}
                amount={complimentaryModal.amount}
                onUnitChange={(unit) => setComplimentaryModal((prev) => ({ ...prev, unit }))}
                onAmountChange={(amount) => setComplimentaryModal((prev) => ({ ...prev, amount }))}
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() =>
                  setComplimentaryModal((prev) => ({ ...prev, open: false, restaurant: null }))
                }
                className="btn btn-secondary rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={grantComplimentaryAccess}
                className="btn btn-success rounded-xl disabled:opacity-70"
              >
                Grant access
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {infoRestaurant && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl ring-1 ring-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Business details</h3>
            <div className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
              <p><span className="font-semibold">Name:</span> {infoRestaurant.name}</p>
              <p><span className="font-semibold">Slug:</span> /{infoRestaurant.slug}</p>
              <p><span className="font-semibold">Admin email:</span> {infoRestaurant.admin_email}</p>
              <p><span className="font-semibold">Phone:</span> {infoRestaurant.phone}</p>
              <p><span className="font-semibold">Sections:</span> {infoRestaurant.category_count}</p>
              <p><span className="font-semibold">Items:</span> {infoRestaurant.item_count}</p>
              <p><span className="font-semibold">Plan:</span> {infoRestaurant.plan_name ?? "No plan"}</p>
              <p>
                <span className="font-semibold">Sub status:</span>{" "}
                {formatSubscriptionStatus(infoRestaurant.subscription_status)}
              </p>
              <p>
                <span className="font-semibold">Last payment:</span>{" "}
                {infoRestaurant.last_payment_at
                  ? new Date(infoRestaurant.last_payment_at).toLocaleDateString()
                  : "—"}
              </p>
              <p>
                <span className="font-semibold">Next due:</span>{" "}
                {formatNextDueLine(
                  infoRestaurant.next_due_at,
                  infoRestaurant.billing_exempt,
                  infoRestaurant.billing_cycle_price,
                )}
              </p>
              <p>
                <span className="font-semibold">Billing:</span>{" "}
                {infoRestaurant.billing_exempt
                  ? "Lifetime free"
                  : restaurantHasComplimentaryAccess(infoRestaurant)
                    ? "Complimentary period"
                    : "Monthly subscription"}
              </p>
              <p><span className="font-semibold">Outstanding:</span> ${infoRestaurant.outstanding_balance.toFixed(2)}</p>
              <p><span className="font-semibold">Created:</span> {new Date(infoRestaurant.created_at).toLocaleDateString()}</p>
              <p className="sm:col-span-2">
                <span className="font-semibold">Home browse categories:</span>{" "}
                {hasHomeCategory(infoRestaurant)
                  ? formatBrowseSectionsLabel(infoRestaurant.browse_sections)
                  : "N/A"}
              </p>
            </div>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              {canResetPassword(infoRestaurant) ? (
                <button
                  type="button"
                  onClick={() => {
                    setInfoRestaurant(null);
                    setPasswordRestaurant(infoRestaurant);
                  }}
                  className="btn btn-primary rounded-xl"
                >
                  Reset admin password
                </button>
              ) : null}
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
            <h3 className="text-lg font-bold text-slate-900">Home browse categories</h3>
            <p className="mt-1 text-sm text-slate-600">
              Pick one or more sections where{" "}
              <span className="font-semibold">{browseSectionsEditor.restaurantName}</span> appears on the home page.
              Each category needs at least one tag.
            </p>
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {BROWSE_SECTION_OPTIONS.map((section) => (
                <label
                  key={section}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                >
                  <input
                    type="checkbox"
                    checked={browseSectionsEditor.sections.includes(section)}
                    onChange={() => toggleBrowseSection(section)}
                    className="h-4 w-4 accent-violet-600"
                  />
                  <span>{section}</span>
                </label>
              ))}
            </div>
            {browseSectionsEditor.sections.map((section) => {
              const subOptions = getSubFiltersForSection(section);
              if (subOptions.length === 0) return null;
              return (
                <div key={section} className="mt-4 border-t border-slate-100 pt-4">
                  <p className="text-xs font-semibold text-slate-700">
                    {section} tags <span className="text-red-500">*</span>
                  </p>
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {subOptions.map((tag) => (
                      <label
                        key={tag}
                        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                      >
                        <input
                          type="checkbox"
                          checked={browseSectionsEditor.subTags.includes(tag)}
                          onChange={() => toggleSubTag(tag)}
                          className="h-4 w-4 accent-violet-600"
                        />
                        <span>{tag}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
            {browseSectionsEditor.sections.length === 0 ? (
              <p className="mt-2 text-xs font-medium text-amber-700">Select at least one category.</p>
            ) : null}
            <DashboardAlertModal
              open={browseSectionsEditor.error != null}
              heading="Tags required"
              message={browseSectionsEditor.error ?? ""}
              variant="warning"
              onClose={() => setBrowseSectionsEditor((prev) => ({ ...prev, error: null }))}
            />
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
                disabled={isPending || browseSectionsEditor.sections.length === 0}
                onClick={saveBrowseSections}
                className="btn btn-primary rounded-xl disabled:opacity-70"
              >
                Save categories
              </button>
            </div>
          </div>
        </div>
      )}

      {addonsEditor.open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
          <div className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white p-5 shadow-xl ring-1 ring-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Add-on modules</h3>
            <p className="mt-1 text-sm text-slate-600">
              Enable or disable paid modules for{" "}
              <span className="font-semibold">{addonsEditor.restaurantName}</span>.
            </p>
            <div className="mt-4 space-y-2 overflow-y-auto pr-1">
              {ALL_ADDONS.map((addon) => {
                const enabled = Boolean(addonsEditor.addons[addon.key]);
                return (
                  <label
                    key={addon.key}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition ${
                      enabled
                        ? "border-teal-200 bg-teal-50"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={() => toggleAddon(addon.key)}
                      className="mt-0.5 h-4 w-4 accent-teal-600"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{addon.label}</p>
                      <p className="text-xs text-slate-500">{addon.description}</p>
                    </div>
                    {enabled && (
                      <span className="ml-auto shrink-0 rounded-full bg-teal-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                        Active
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
            <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setAddonsEditor((prev) => ({ ...prev, open: false }))}
                className="btn btn-secondary rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={saveAddons}
                className="btn btn-primary rounded-xl disabled:opacity-70"
              >
                {isPending ? "Saving…" : "Save add-ons"}
              </button>
            </div>
          </div>
        </div>
      )}

      {passwordRestaurant ? (
        <SuperAdminSetPasswordModal
          title="Reset restaurant admin password"
          subtitle={`${passwordRestaurant.name} · ${passwordRestaurant.admin_email}`}
          onSubmit={(password, confirmPassword) =>
            resetRestaurantPassword(passwordRestaurant, password, confirmPassword)
          }
          onCancel={() => setPasswordRestaurant(null)}
          loading={isPending}
        />
      ) : null}
    </section>
  );
}
