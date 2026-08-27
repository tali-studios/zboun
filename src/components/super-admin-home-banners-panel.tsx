"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createHomeHeroSlideAction,
  deleteHomeHeroSlideAction,
  reorderHomeHeroSlideAction,
  toggleHomeHeroSlideActiveAction,
  updateHomeHeroSlideAction,
} from "@/app-actions/home-hero-slides";
import type { HomeHeroLinkType, HomeHeroSlideRow } from "@/lib/home-hero-slides";
import { isSlideInScheduleWindow } from "@/lib/home-hero-slides";

export type HomeBannerRestaurantOption = {
  id: string;
  name: string;
  slug: string;
};

export type HomeBannerMenuItemOption = {
  id: string;
  name: string;
  restaurant_id: string;
};

type Props = {
  slides: HomeHeroSlideRow[];
  restaurants: HomeBannerRestaurantOption[];
  menuItems: HomeBannerMenuItemOption[];
  success?: string;
  error?: string;
};

function toDateInputValue(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatMoney(amount: number | null) {
  if (amount == null || !Number.isFinite(amount)) return "—";
  return `$${amount.toFixed(2)}`;
}

function formatSchedule(slide: HomeHeroSlideRow) {
  if (!slide.starts_at && !slide.ends_at) return "Always";
  const opts: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };
  const start = slide.starts_at ? new Date(slide.starts_at).toLocaleDateString(undefined, opts) : "…";
  const end = slide.ends_at ? new Date(slide.ends_at).toLocaleDateString(undefined, opts) : "…";
  return `${start} → ${end}`;
}

function slideStatus(slide: HomeHeroSlideRow): "active" | "scheduled" | "expired" | "off" {
  if (!slide.is_active) return "off";
  if (!isSlideInScheduleWindow(slide)) {
    if (slide.starts_at && new Date(slide.starts_at) > new Date()) return "scheduled";
    return "expired";
  }
  return "active";
}

const STATUS_STYLES: Record<ReturnType<typeof slideStatus>, string> = {
  active: "bg-emerald-50 text-emerald-800 border-emerald-200",
  scheduled: "bg-sky-50 text-sky-800 border-sky-200",
  expired: "bg-amber-50 text-amber-800 border-amber-200",
  off: "bg-slate-100 text-slate-600 border-slate-200",
};

type FormState = {
  title: string;
  subtitle: string;
  link_type: HomeHeroLinkType;
  restaurant_id: string;
  menu_item_id: string;
  sort_order: string;
  is_active: boolean;
  use_store_logo: boolean;
  starts_at: string;
  ends_at: string;
  promo_fee_usd: string;
  notes: string;
};

function emptyForm(nextSort: number): FormState {
  return {
    title: "",
    subtitle: "",
    link_type: "none",
    restaurant_id: "",
    menu_item_id: "",
    sort_order: String(nextSort),
    is_active: true,
    use_store_logo: false,
    starts_at: "",
    ends_at: "",
    promo_fee_usd: "",
    notes: "",
  };
}

function formFromSlide(slide: HomeHeroSlideRow): FormState {
  return {
    title: slide.title,
    subtitle: slide.subtitle,
    link_type: slide.link_type,
    restaurant_id: slide.restaurant_id ?? "",
    menu_item_id: slide.menu_item_id ?? "",
    sort_order: String(slide.sort_order),
    is_active: slide.is_active,
    use_store_logo: Boolean(slide.use_store_logo),
    starts_at: toDateInputValue(slide.starts_at),
    ends_at: toDateInputValue(slide.ends_at),
    promo_fee_usd: slide.promo_fee_usd != null ? String(slide.promo_fee_usd) : "",
    notes: slide.notes ?? "",
  };
}

function SlideFields({
  form,
  setForm,
  restaurants,
  menuItems,
  idPrefix,
}: {
  form: FormState;
  setForm: (next: FormState) => void;
  restaurants: HomeBannerRestaurantOption[];
  menuItems: HomeBannerMenuItemOption[];
  idPrefix: string;
}) {
  const itemsForStore = useMemo(
    () => menuItems.filter((item) => item.restaurant_id === form.restaurant_id),
    [menuItems, form.restaurant_id],
  );

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="block sm:col-span-2">
        <span className="mb-1 block text-xs font-semibold text-slate-600">Title</span>
        <input
          id={`${idPrefix}-title`}
          name="title"
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
          placeholder="FREE & FAST delivery."
        />
      </label>
      <label className="block sm:col-span-2">
        <span className="mb-1 block text-xs font-semibold text-slate-600">Subtitle</span>
        <input
          id={`${idPrefix}-subtitle`}
          name="subtitle"
          value={form.subtitle}
          onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
          placeholder="Short supporting line…"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-slate-600">Link type</span>
        <select
          name="link_type"
          value={form.link_type}
          onChange={(e) =>
            setForm({
              ...form,
              link_type: e.target.value as HomeHeroLinkType,
              menu_item_id: e.target.value === "item" ? form.menu_item_id : "",
              restaurant_id: e.target.value === "none" ? "" : form.restaurant_id,
              use_store_logo: e.target.value === "none" ? false : form.use_store_logo,
            })
          }
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          <option value="none">None (marketing only)</option>
          <option value="store">Store</option>
          <option value="item">Specific menu item</option>
        </select>
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-slate-600">Sort order</span>
        <input
          name="sort_order"
          type="number"
          value={form.sort_order}
          onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
        />
      </label>
      {form.link_type !== "none" ? (
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-semibold text-slate-600">Store</span>
          <select
            name="restaurant_id"
            required
            value={form.restaurant_id}
            onChange={(e) =>
              setForm({ ...form, restaurant_id: e.target.value, menu_item_id: "" })
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <option value="">Select store…</option>
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} (/{r.slug})
              </option>
            ))}
          </select>
        </label>
      ) : (
        <input type="hidden" name="restaurant_id" value="" />
      )}
      {form.link_type === "item" ? (
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-semibold text-slate-600">Menu item</span>
          <select
            name="menu_item_id"
            required
            value={form.menu_item_id}
            onChange={(e) => setForm({ ...form, menu_item_id: e.target.value })}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            disabled={!form.restaurant_id}
          >
            <option value="">{form.restaurant_id ? "Select item…" : "Pick a store first"}</option>
            {itemsForStore.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <input type="hidden" name="menu_item_id" value="" />
      )}
      {form.link_type !== "none" ? (
        <label className="flex items-start gap-2 sm:col-span-2">
          <input
            type="checkbox"
            checked={form.use_store_logo}
            onChange={(e) => setForm({ ...form, use_store_logo: e.target.checked })}
            className="mt-0.5 h-4 w-4 rounded border-slate-300"
          />
          <span>
            <span className="block text-sm font-semibold text-slate-700">Use store logo</span>
            <span className="block text-xs text-slate-500">
              Show this store’s logo on the banner instead of the default Z bag. Falls back to the Z
              bag if the store has no logo.
            </span>
          </span>
          <input type="hidden" name="use_store_logo" value={form.use_store_logo ? "true" : "false"} />
        </label>
      ) : (
        <input type="hidden" name="use_store_logo" value="false" />
      )}
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-slate-600">Starts at (optional)</span>
        <input
          name="starts_at"
          type="datetime-local"
          value={form.starts_at}
          onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-slate-600">Ends at (optional)</span>
        <input
          name="ends_at"
          type="datetime-local"
          value={form.ends_at}
          onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-slate-600">Promo fee USD (optional)</span>
        <input
          name="promo_fee_usd"
          type="number"
          min="0"
          step="0.01"
          value={form.promo_fee_usd}
          onChange={(e) => setForm({ ...form, promo_fee_usd: e.target.value })}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
          placeholder="e.g. 25"
        />
      </label>
      <label className="flex items-end gap-2 pb-2">
        <input
          type="checkbox"
          checked={form.is_active}
          onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
          className="h-4 w-4 rounded border-slate-300"
        />
        <span className="text-sm font-semibold text-slate-700">Active</span>
        <input type="hidden" name="is_active" value={form.is_active ? "true" : "false"} />
      </label>
      <label className="block sm:col-span-2">
        <span className="mb-1 block text-xs font-semibold text-slate-600">Notes (optional)</span>
        <textarea
          name="notes"
          rows={2}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
          placeholder="Paid promo for March / welcome new store…"
        />
      </label>
    </div>
  );
}

export function SuperAdminHomeBannersPanel({
  slides,
  restaurants,
  menuItems,
  success,
  error,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const nextSort = slides.length === 0 ? 0 : Math.max(...slides.map((s) => s.sort_order)) + 1;
  const [createForm, setCreateForm] = useState<FormState>(() => emptyForm(nextSort));
  const [editForm, setEditForm] = useState<FormState | null>(null);

  const restaurantById = useMemo(() => {
    const map = new Map<string, HomeBannerRestaurantOption>();
    for (const r of restaurants) map.set(r.id, r);
    return map;
  }, [restaurants]);

  const itemById = useMemo(() => {
    const map = new Map<string, HomeBannerMenuItemOption>();
    for (const item of menuItems) map.set(item.id, item);
    return map;
  }, [menuItems]);

  const stats = useMemo(() => {
    let active = 0;
    let scheduled = 0;
    let off = 0;
    for (const slide of slides) {
      const s = slideStatus(slide);
      if (s === "active") active += 1;
      else if (s === "scheduled") scheduled += 1;
      else off += 1;
    }
    return { active, scheduled, off, total: slides.length };
  }, [slides]);

  function runAction(action: (formData: FormData) => Promise<void>, formData: FormData) {
    startTransition(async () => {
      await action(formData);
      router.refresh();
    });
  }

  function startEdit(slide: HomeHeroSlideRow) {
    setEditingId(slide.id);
    setEditForm(formFromSlide(slide));
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(null);
  }

  return (
    <section className="panel min-w-0 overflow-hidden p-5">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-900">Home carousel banners</h2>
        <p className="mt-1 text-xs text-slate-500">
          Manage the purple home-page slides. Use store/item links to welcome new merchants or run paid
          promotions. Slides outside their schedule window are hidden automatically.
        </p>
      </div>

      {success ? (
        <p className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Saved successfully.
        </p>
      ) : null}
      {error ? (
        <p className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {error}
        </p>
      ) : null}

      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Total</p>
          <p className="text-xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-700">Live now</p>
          <p className="text-xl font-bold text-emerald-800">{stats.active}</p>
        </div>
        <div className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-wide text-sky-700">Scheduled</p>
          <p className="text-xl font-bold text-sky-800">{stats.scheduled}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Off / expired</p>
          <p className="text-xl font-bold text-slate-900">{stats.off}</p>
        </div>
      </div>

      <form
        action={(formData) => {
          runAction(createHomeHeroSlideAction, formData);
          setCreateForm(emptyForm(nextSort + 1));
        }}
        className="mb-5 rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
      >
        <p className="mb-3 text-sm font-bold text-slate-900">Add banner</p>
        <SlideFields
          form={createForm}
          setForm={setCreateForm}
          restaurants={restaurants}
          menuItems={menuItems}
          idPrefix="create"
        />
        <button type="submit" disabled={isPending} className="btn btn-primary mt-4">
          {isPending ? "Saving…" : "Create banner"}
        </button>
      </form>

      <div className="space-y-3">
        {slides.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
            No banners in the database yet. Run{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">supabase/add-home-hero-slides.sql</code>{" "}
            or create one above. Home falls back to the default slides until then.
          </p>
        ) : null}

        {slides.map((slide, index) => {
          const status = slideStatus(slide);
          const store = slide.restaurant_id ? restaurantById.get(slide.restaurant_id) : null;
          const item = slide.menu_item_id ? itemById.get(slide.menu_item_id) : null;
          const isEditing = editingId === slide.id && editForm;

          return (
            <article
              key={slide.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="border-b border-slate-100 bg-gradient-to-r from-white to-slate-50/80 px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-lg bg-slate-100 px-1.5 text-[11px] font-bold text-slate-500">
                    #{slide.sort_order}
                  </span>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS_STYLES[status]}`}
                  >
                    {status}
                  </span>
                  {slide.link_type !== "none" ? (
                    <span className="rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-700">
                      {slide.link_type}
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-2 text-base font-bold leading-snug tracking-tight text-slate-900 sm:text-lg">
                  {slide.title}
                </h3>
                {slide.subtitle ? (
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{slide.subtitle}</p>
                ) : null}
              </div>

              <div className="space-y-3 px-4 py-3">
                <dl className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 px-3 py-2">
                    <dt className="font-semibold uppercase tracking-wide text-slate-400">Schedule</dt>
                    <dd className="mt-0.5 font-medium text-slate-800">{formatSchedule(slide)}</dd>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-3 py-2">
                    <dt className="font-semibold uppercase tracking-wide text-slate-400">Fee</dt>
                    <dd className="mt-0.5 font-medium text-slate-800">{formatMoney(slide.promo_fee_usd)}</dd>
                  </div>
                  {store ? (
                    <div className="rounded-xl bg-slate-50 px-3 py-2">
                      <dt className="font-semibold uppercase tracking-wide text-slate-400">Store</dt>
                      <dd className="mt-0.5 font-medium text-slate-800">{store.name}</dd>
                    </div>
                  ) : null}
                  {item ? (
                    <div className="rounded-xl bg-slate-50 px-3 py-2">
                      <dt className="font-semibold uppercase tracking-wide text-slate-400">Item</dt>
                      <dd className="mt-0.5 font-medium text-slate-800">{item.name}</dd>
                    </div>
                  ) : null}
                  {slide.use_store_logo ? (
                    <div className="rounded-xl bg-slate-50 px-3 py-2">
                      <dt className="font-semibold uppercase tracking-wide text-slate-400">Logo</dt>
                      <dd className="mt-0.5 font-medium text-slate-800">Store logo</dd>
                    </div>
                  ) : null}
                </dl>

                {slide.notes ? (
                  <p className="rounded-xl border border-dashed border-slate-200 px-3 py-2 text-xs leading-relaxed text-slate-600">
                    <span className="font-semibold text-slate-500">Notes · </span>
                    {slide.notes}
                  </p>
                ) : null}

                <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 sm:flex sm:flex-wrap">
                  <div className="col-span-2 grid grid-cols-2 gap-2 sm:flex sm:w-auto">
                    <form action={(fd) => runAction(reorderHomeHeroSlideAction, fd)} className="min-w-0 flex-1 sm:flex-none">
                      <input type="hidden" name="id" value={slide.id} />
                      <input type="hidden" name="direction" value="up" />
                      <button
                        type="submit"
                        disabled={isPending || index === 0}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 sm:w-auto"
                      >
                        Up
                      </button>
                    </form>
                    <form action={(fd) => runAction(reorderHomeHeroSlideAction, fd)} className="min-w-0 flex-1 sm:flex-none">
                      <input type="hidden" name="id" value={slide.id} />
                      <input type="hidden" name="direction" value="down" />
                      <button
                        type="submit"
                        disabled={isPending || index === slides.length - 1}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 sm:w-auto"
                      >
                        Down
                      </button>
                    </form>
                  </div>

                  <form action={(fd) => runAction(toggleHomeHeroSlideActiveAction, fd)} className="min-w-0">
                    <input type="hidden" name="id" value={slide.id} />
                    <input type="hidden" name="is_active" value={slide.is_active ? "false" : "true"} />
                    <button
                      type="submit"
                      disabled={isPending}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 sm:w-auto"
                    >
                      {slide.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </form>

                  <button
                    type="button"
                    onClick={() => (isEditing ? cancelEdit() : startEdit(slide))}
                    className="w-full rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700 transition hover:bg-violet-100 sm:w-auto"
                  >
                    {isEditing ? "Close" : "Edit"}
                  </button>

                  <form
                    action={(fd) => {
                      if (!window.confirm("Delete this banner?")) return;
                      runAction(deleteHomeHeroSlideAction, fd);
                    }}
                    className="col-span-2 min-w-0 sm:col-span-1 sm:ml-auto"
                  >
                    <input type="hidden" name="id" value={slide.id} />
                    <button
                      type="submit"
                      disabled={isPending}
                      className="w-full rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50 sm:w-auto"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>

              {isEditing && editForm ? (
                <form
                  action={(formData) => {
                    runAction(updateHomeHeroSlideAction, formData);
                    cancelEdit();
                  }}
                  className="border-t border-violet-100 bg-violet-50/40 p-4"
                >
                  <input type="hidden" name="id" value={slide.id} />
                  <SlideFields
                    form={editForm}
                    setForm={setEditForm}
                    restaurants={restaurants}
                    menuItems={menuItems}
                    idPrefix={`edit-${slide.id}`}
                  />
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    <button type="submit" disabled={isPending} className="btn btn-primary w-full sm:w-auto">
                      {isPending ? "Saving…" : "Save changes"}
                    </button>
                    <button type="button" onClick={cancelEdit} className="btn btn-secondary w-full sm:w-auto">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
