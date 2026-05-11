"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { CategoryWithItems } from "@/lib/data";
import { MenuRestaurantRating } from "@/components/menu-restaurant-rating";
import { BRAND_HEX } from "@/lib/brand";

const BRAND = BRAND_HEX;
const WHATSAPP_GREEN = "#25D366";

type Props = {
  restaurantName: string;
  restaurantPhone: string;
  restaurantId: string;
  restaurantSlug: string;
  avgRating: number | null;
  ratingCount: number;
  lbpRate: number;
  categories: CategoryWithItems[];
};

type CartLine = {
  key: string;
  itemId: string;
  name: string;
  qty: number;
  unitPrice: number;
  removedIngredients: string[];
  addedIngredients: Array<{ name: string; price: number; qty: number }>;
  specialInstructions: string;
};

type AddIngredientOption = { name: string; price: number };
type CustomizationState = {
  item: CategoryWithItems["menu_items"][number];
  remove: string[];
  add: Record<string, number>;
  note: string;
  qty: number;
  editingKey?: string;
};

export function MenuClient({
  restaurantName,
  restaurantPhone,
  restaurantId,
  restaurantSlug,
  avgRating,
  ratingCount,
  lbpRate,
  categories,
}: Props) {
  const [cart, setCart] = useState<Record<string, CartLine>>({});
  const [customizing, setCustomizing] = useState<CustomizationState | null>(null);
  const [query, setQuery] = useState("");
  const [menuCategoryFilter, setMenuCategoryFilter] = useState<string>("all");
  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);
  const [showMobileCart, setShowMobileCart] = useState(false);

  const items = useMemo(() => Object.values(cart), [cart]);
  const filteredCategories = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return categories;
    return categories
      .map((category) => ({
        ...category,
        menu_items: category.menu_items.filter((item) => {
          return (
            item.name.toLowerCase().includes(normalized) ||
            (item.description ?? "").toLowerCase().includes(normalized) ||
            (item.contents ?? "").toLowerCase().includes(normalized)
          );
        }),
      }))
      .filter((category) => category.menu_items.length > 0);
  }, [categories, query]);

  const displayCategories = useMemo(() => {
    if (menuCategoryFilter === "all") return filteredCategories;
    return filteredCategories.filter((c) => c.id === menuCategoryFilter);
  }, [filteredCategories, menuCategoryFilter]);
  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0),
    [items],
  );
  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.qty, 0), [items]);

  function normalizeAddIngredients(
    addIngredients: CategoryWithItems["menu_items"][number]["add_ingredients"] | null | undefined,
  ): AddIngredientOption[] {
    return (addIngredients ?? [])
      .map((item) => ({
        name: String(item?.name ?? "").trim(),
        price: Number(item?.price ?? 0),
      }))
      .filter((item) => item.name);
  }

  function openCustomization(item: CategoryWithItems["menu_items"][number]) {
    setCustomizing({ item, remove: [], add: {}, note: "", qty: 1 });
  }

  function openEditCustomization(line: CartLine) {
    const item = categories
      .flatMap((category) => category.menu_items)
      .find((candidate) => candidate.id === line.itemId);
    if (!item) return;
    const add: Record<string, number> = {};
    line.addedIngredients.forEach((ingredient) => {
      add[ingredient.name] = ingredient.qty;
    });
    setCustomizing({
      item,
      remove: [...line.removedIngredients],
      add,
      note: line.specialInstructions,
      qty: line.qty,
      editingKey: line.key,
    });
  }

  function closeCustomization() {
    setCustomizing(null);
  }

  function addCustomizedItem() {
    if (!customizing) return;
    const addOptions = normalizeAddIngredients(customizing.item.add_ingredients);
    const selectedAdd = addOptions
      .map((option) => {
        const qty = customizing.add[option.name] ?? 0;
        return qty > 0 ? { ...option, qty } : null;
      })
      .filter((option): option is AddIngredientOption & { qty: number } => Boolean(option));
    const addCost = selectedAdd.reduce((sum, option) => sum + option.price * option.qty, 0);
    const unitPrice = Math.max(0, Number(customizing.item.price) + addCost);
    const lineKey = [
      customizing.item.id,
      [...customizing.remove].sort().join("|"),
      Object.entries(customizing.add)
        .filter(([, qty]) => qty > 0)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, qty]) => `${name}:${qty}`)
        .join("|"),
      customizing.note.trim(),
    ].join("::");

    setCart((prev) => {
      const baseCart =
        customizing.editingKey && prev[customizing.editingKey]
          ? Object.fromEntries(
              Object.entries(prev).filter(([key]) => key !== customizing.editingKey),
            )
          : prev;
      const existing = prev[lineKey];
      if (existing) {
        return {
          ...baseCart,
          [lineKey]: {
            ...existing,
            qty: customizing.editingKey ? customizing.qty : existing.qty + customizing.qty,
            specialInstructions: customizing.note.trim(),
            removedIngredients: [...customizing.remove],
            addedIngredients: selectedAdd,
            unitPrice,
          },
        };
      }
      return {
        ...baseCart,
        [lineKey]: {
          key: lineKey,
          itemId: customizing.item.id,
          name: customizing.item.name,
          qty: customizing.qty,
          unitPrice,
          removedIngredients: [...customizing.remove],
          addedIngredients: selectedAdd,
          specialInstructions: customizing.note.trim(),
        },
      };
    });

    closeCustomization();
  }

  function removeCartLine(key: string) {
    setCart((prev) => Object.fromEntries(Object.entries(prev).filter(([lineKey]) => lineKey !== key)));
  }

  function formatUsd(amount: number) {
    return `$${amount.toFixed(2)}`;
  }

  function formatLbp(amountUsd: number) {
    const lbp = Math.round(amountUsd * lbpRate);
    return `L.L ${lbp.toLocaleString()}`;
  }

  function createWhatsAppMessage() {
    const cleanName = customerName.trim();
    const cleanAddress = address.trim();
    const lines = [
      "Hello 👋",
      `I'd like to order from ${restaurantName}:`,
      "",
      ...items.map((item) => {
        const modifiers: string[] = [];
        if (item.removedIngredients.length > 0) {
          modifiers.push(`remove: ${item.removedIngredients.join(", ")}`);
        }
        if (item.addedIngredients.length > 0) {
          modifiers.push(
            `add: ${item.addedIngredients
              .map((add) => `${add.name} x${add.qty}`)
              .join(", ")}`,
          );
        }
        if (item.specialInstructions) {
          modifiers.push(`note: ${item.specialInstructions}`);
        }
        const modifierText = modifiers.length > 0 ? ` [${modifiers.join(" | ")}]` : "";
        return `- ${item.qty}x ${item.name}${modifierText}`;
      }),
      "",
      `Name: ${cleanName}`,
      `Address: ${cleanAddress}`,
      notes ? `Notes: ${notes}` : "",
    ].filter(Boolean);

    return encodeURIComponent(lines.join("\n"));
  }

  const orderLink = `https://wa.me/${restaurantPhone.replace(/\D/g, "")}?text=${createWhatsAppMessage()}`;
  const canOrder =
    items.length > 0 &&
    customerName.trim().length > 0 &&
    address.trim().length > 0 &&
    isOrderConfirmed;

  function handleOrderClick() {
    if (!customerName.trim() || !address.trim()) {
      window.alert("Please fill both Name and Address before ordering.");
      return;
    }
    if (!isOrderConfirmed) {
      window.alert("Please confirm your order before ordering via WhatsApp.");
      return;
    }
    if (items.length === 0) {
      window.alert("Please add at least one item to your cart.");
      return;
    }
    window.location.href = orderLink;
  }

  /* ─── Cart panel (shared between desktop sidebar and mobile sheet) ─── */
  function renderCartPanel({ onClose }: { onClose?: () => void }) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Your cart</h2>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
              aria-label="Close cart"
            >
              ×
            </button>
          ) : null}
        </div>

        {/* Items list */}
        <div className="mt-3 max-h-52 flex-1 space-y-2 overflow-y-auto lg:max-h-64">
          {items.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-400">Your cart is empty.</p>
          ) : (
            items.map((item) => (
              <div
                key={item.key}
                className="rounded-xl border border-slate-100 bg-slate-50 p-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-800">
                    {item.qty}× {item.name}
                  </p>
                  <p className="shrink-0 text-xs font-semibold" style={{ color: BRAND }}>
                    {formatUsd(item.qty * item.unitPrice)}
                  </p>
                </div>
                {item.removedIngredients.length > 0 ? (
                  <p className="mt-0.5 text-xs text-slate-400">
                    Remove: {item.removedIngredients.join(", ")}
                  </p>
                ) : null}
                {item.addedIngredients.length > 0 ? (
                  <p className="mt-0.5 text-xs text-slate-400">
                    Add:{" "}
                    {item.addedIngredients
                      .map((a) => `${a.name} x${a.qty}${a.price > 0 ? ` (+${formatUsd(a.price * a.qty)})` : ""}`)
                      .join(", ")}
                  </p>
                ) : null}
                {item.specialInstructions ? (
                  <p className="mt-0.5 text-xs text-slate-400">Note: {item.specialInstructions}</p>
                ) : null}
                <div className="mt-1.5 flex gap-3">
                  <button
                    type="button"
                    onClick={() => openEditCustomization(item)}
                    className="text-xs font-semibold hover:underline"
                    style={{ color: BRAND }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => removeCartLine(item.key)}
                    className="text-xs font-semibold text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Total */}
        {items.length > 0 ? (
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
            <p className="text-sm font-bold text-slate-900">Total</p>
            <div className="text-right">
              <p className="text-base font-bold" style={{ color: BRAND }}>
                {formatUsd(total)}
              </p>
              <p className="text-xs text-slate-400">{formatLbp(total)}</p>
            </div>
          </div>
        ) : null}

        {/* Delivery details */}
        <div className="mt-4 space-y-2.5">
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Your name"
            className="ui-input"
          />
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Delivery address"
            className="ui-input"
          />
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Order notes (optional)"
            rows={2}
            className="ui-textarea"
          />
        </div>

        {/* Confirm checkbox */}
        <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
          <input
            type="checkbox"
            checked={isOrderConfirmed}
            onChange={(e) => setIsOrderConfirmed(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-[#7854ff]"
          />
          <div>
            <p className="font-semibold text-slate-800">I confirm my order above.</p>
            <p className="text-xs text-slate-500">
              Total to pay: <span className="font-semibold text-slate-700">{formatUsd(total)}</span>
            </p>
          </div>
        </label>

        <MenuRestaurantRating
          variant="cart"
          restaurantId={restaurantId}
          slug={restaurantSlug}
          avgRating={avgRating}
          ratingCount={ratingCount}
        />

        {/* Order button */}
        <button
          type="button"
          onClick={handleOrderClick}
          disabled={!canOrder}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold text-[#111827] shadow-md transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
          style={{ backgroundColor: WHATSAPP_GREEN }}
        >
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.124 1.532 5.859L.054 23.285a.75.75 0 00.916.916l5.437-1.478A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.89 0-3.67-.5-5.21-1.374l-.374-.213-3.867 1.051 1.052-3.843-.226-.386A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
          </svg>
          Order on WhatsApp
        </button>
      </div>
    );
  }

  function openReviewSheet() {
    setShowMobileCart(true);
  }

  /* ─── Render ────────────────────────────────────────────────────────── */
  return (
    <>
      <div
        className={`grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_360px] ${items.length > 0 ? "pb-44 lg:pb-0" : ""}`}
      >
        {/* ── Menu items column ──────────────────────────────────────── */}
        <section className="min-w-0 space-y-4">
          {/* Search */}
          <div className="relative w-full min-w-0">
            <svg
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search this menu"
              className="ui-input ui-input-search box-border h-12 w-full max-w-full min-w-0 !rounded-full border border-slate-200 bg-white text-base shadow-sm"
            />
          </div>

          {/* Category pills (menu sections) — min-w-0 keeps horizontal scroll from widening the column */}
          <div className="flex min-w-0 max-w-full gap-2 overflow-x-auto overflow-y-hidden touch-pan-x pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => setMenuCategoryFilter("all")}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                menuCategoryFilter === "all" ? "text-white shadow-md" : "bg-slate-100 text-slate-600"
              }`}
              style={menuCategoryFilter === "all" ? { backgroundColor: BRAND } : undefined}
            >
              All
            </button>
            {categories.map((category) => {
              const active = menuCategoryFilter === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setMenuCategoryFilter(category.id)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    active ? "text-white shadow-md" : "bg-slate-100 text-slate-600"
                  }`}
                  style={active ? { backgroundColor: BRAND } : undefined}
                >
                  {category.name}
                </button>
              );
            })}
          </div>

          {/* No results */}
          {displayCategories.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-12 text-center shadow-sm">
              <p className="font-semibold text-slate-700">No items found</p>
              <p className="mt-1 text-sm text-slate-400">Try a different search or category.</p>
            </div>
          ) : null}

          {/* Categories */}
          {displayCategories.map((category) => (
            <div key={category.id} className="space-y-3">
              {menuCategoryFilter === "all" ? (
                <h2 className="text-lg font-bold tracking-tight text-slate-900">{category.name}</h2>
              ) : (
                <h2 className="sr-only">{category.name}</h2>
              )}

              <div className="space-y-3">
                {category.menu_items.map((item) => (
                  <article
                    key={item.id}
                    className={`relative flex gap-3 rounded-2xl bg-white p-3 shadow-md ring-1 ring-black/[0.06] transition ${
                      item.is_available ? "" : "opacity-60"
                    }`}
                  >
                    {/* Image */}
                    <div className="h-[88px] w-[88px] shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt=""
                          width={88}
                          height={88}
                          className="h-full w-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-2xl text-slate-300" aria-hidden>
                          ···
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex min-h-[88px] min-w-0 flex-1 flex-col pr-12">
                      <h3 className="text-[15px] font-bold leading-snug text-slate-900 sm:text-base">
                        {item.name}
                        {!item.is_available ? (
                          <span className="ml-2 align-middle text-[10px] font-bold uppercase tracking-wide text-slate-400">
                            — Out
                          </span>
                        ) : null}
                      </h3>
                      {item.description ? (
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500 sm:text-sm">
                          {item.description}
                        </p>
                      ) : item.contents ? (
                        <p className="mt-1 line-clamp-2 text-xs text-slate-500 sm:text-sm">{item.contents}</p>
                      ) : null}
                      {item.grams ? <p className="mt-0.5 text-[11px] text-slate-400">{item.grams} g</p> : null}
                      <div className="mt-auto flex flex-wrap items-end gap-x-2 pt-2">
                        <span className="text-base font-bold" style={{ color: BRAND }}>
                          {formatUsd(item.price)}
                        </span>
                        <span className="text-xs text-slate-400">{formatLbp(item.price)}</span>
                      </div>
                    </div>

                    {/* Add button */}
                    <button
                      disabled={!item.is_available}
                      onClick={() => openCustomization(item)}
                      className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full text-xl font-light leading-none text-white shadow-md shadow-violet-500/35 transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                      style={{ backgroundColor: item.is_available ? BRAND : undefined }}
                      aria-label={item.is_available ? `Add ${item.name}` : `${item.name} unavailable`}
                    >
                      +
                    </button>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* ── Desktop cart sidebar ───────────────────────────────────── */}
        <aside
          className="hidden h-fit rounded-2xl border border-slate-200/80 bg-white p-5 shadow-md lg:block lg:sticky lg:top-6"
          style={{ boxShadow: "0 8px 30px rgba(120, 84, 255, 0.12)" }}
        >
          {renderCartPanel({})}
        </aside>
      </div>

      {/* ── Mobile checkout bar — same horizontal track as menu cards (container + px) + matching card chrome ───── */}
      {items.length > 0 ? (
        <div className="fixed bottom-0 left-0 right-0 z-30 pt-2 lg:hidden">
          <div className="container mx-auto min-w-0 max-w-full px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6">
            <div
              className="rounded-2xl p-3 text-white shadow-md ring-1 ring-white/25"
              style={{ backgroundColor: BRAND }}
            >
              <div className="flex min-h-[88px] items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2.5 text-sm font-semibold">
                  <span className="flex h-[88px] w-[88px] shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                    <svg className="h-8 w-8 shrink-0 opacity-95" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </span>
                  <span className="min-w-0 leading-tight">
                    <span className="block text-[15px] font-bold sm:text-base">
                      {itemCount} {itemCount === 1 ? "item" : "items"}
                    </span>
                  </span>
                </span>
                <span className="shrink-0 pr-1 text-right">
                  <span className="block text-base font-bold tabular-nums leading-none">{formatUsd(total)}</span>
                  <span className="mt-1 block text-[11px] font-medium text-white/80 tabular-nums">{formatLbp(total)}</span>
                </span>
              </div>
              <div className="mt-2 flex gap-2 border-t border-white/15 pt-2">
                <button
                  type="button"
                  onClick={openReviewSheet}
                  className="flex-1 rounded-full bg-white/15 py-2.5 text-sm font-semibold text-white ring-1 ring-white/25 transition hover:bg-white/20"
                >
                  Review
                </button>
                <button
                  type="button"
                  onClick={handleOrderClick}
                  disabled={!canOrder}
                  className="min-w-0 flex-[1.35] rounded-full py-2.5 text-sm font-bold text-[#111827] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-45"
                  style={{ backgroundColor: WHATSAPP_GREEN }}
                >
                  Order on WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* ── Mobile cart sheet ──────────────────────────────────────────── */}
      {showMobileCart ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setShowMobileCart(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[90dvh] overflow-y-auto rounded-t-3xl bg-white px-5 pb-8 pt-5 shadow-2xl">
            {renderCartPanel({ onClose: () => setShowMobileCart(false) })}
          </div>
        </div>
      ) : null}

      {/* ── Customization modal ────────────────────────────────────────── */}
      {customizing ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 backdrop-blur-sm p-0 sm:items-center sm:p-4">
          <div className="w-full max-h-[95dvh] overflow-y-auto rounded-t-3xl bg-white px-5 pb-6 pt-4 shadow-2xl sm:max-h-[90vh] sm:max-w-xl sm:rounded-3xl sm:px-6 sm:pb-6 sm:pt-5">
            {/* Pull handle (mobile) */}
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-200 sm:hidden" />

            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="text-xl font-bold tracking-tight text-slate-900">{customizing.item.name}</h3>
                {customizing.item.description ? (
                  <p className="mt-0.5 text-sm text-slate-500">{customizing.item.description}</p>
                ) : null}
                <div className="mt-1.5 flex items-baseline gap-2">
                  <span className="text-base font-bold" style={{ color: BRAND }}>
                    {formatUsd(customizing.item.price)}
                  </span>
                  <span className="text-sm text-slate-400">{formatLbp(customizing.item.price)}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={closeCustomization}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Remove ingredients */}
            {(customizing.item.removable_ingredients?.length ?? 0) > 0 ? (
              <div className="mt-5 border-t border-slate-100 pt-4">
                <h4 className="text-sm font-bold text-slate-900">Remove ingredients</h4>
                <div className="mt-2.5 space-y-2">
                  {(customizing.item.removable_ingredients ?? []).map((ingredient) => (
                    <label
                      key={`remove-${ingredient.name}`}
                      className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm text-slate-700 transition hover:border-[#7854ff]/35"
                    >
                      <input
                        type="checkbox"
                        checked={customizing.remove.includes(ingredient.name)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setCustomizing((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  remove: checked
                                    ? [...prev.remove, ingredient.name]
                                    : prev.remove.filter((i) => i !== ingredient.name),
                                }
                              : prev,
                          );
                        }}
                        className="h-4 w-4 accent-[#7854ff]"
                      />
                      <span>{ingredient.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Add ingredients */}
            {(customizing.item.add_ingredients?.length ?? 0) > 0 ? (
              <div className="mt-5 border-t border-slate-100 pt-4">
                <h4 className="text-sm font-bold text-slate-900">Add extras</h4>
                <div className="mt-2.5 space-y-2">
                  {(customizing.item.add_ingredients ?? []).map((ingredient) => (
                    <div
                      key={`add-${ingredient.name}`}
                      className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm text-slate-700"
                    >
                      <span>
                        {ingredient.name}
                        {Number(ingredient.price ?? 0) > 0 ? (
                          <span className="ml-1 text-xs text-slate-400">
                            +{formatUsd(Number(ingredient.price ?? 0))}
                          </span>
                        ) : null}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-[#7854ff]/45"
                          onClick={() =>
                            setCustomizing((prev) => {
                              if (!prev) return prev;
                              const current = prev.add[ingredient.name] ?? 0;
                              return { ...prev, add: { ...prev.add, [ingredient.name]: Math.max(0, current - 1) } };
                            })
                          }
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-sm font-bold text-slate-900">
                          {customizing.add[ingredient.name] ?? 0}
                        </span>
                        <button
                          type="button"
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-[#7854ff]/45"
                          onClick={() =>
                            setCustomizing((prev) => {
                              if (!prev) return prev;
                              const current = prev.add[ingredient.name] ?? 0;
                              return { ...prev, add: { ...prev.add, [ingredient.name]: current + 1 } };
                            })
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Special instructions */}
            <div className="mt-5 border-t border-slate-100 pt-4">
              <h4 className="text-sm font-bold text-slate-900">Special instructions</h4>
              <textarea
                value={customizing.note}
                onChange={(e) =>
                  setCustomizing((prev) => (prev ? { ...prev, note: e.target.value } : prev))
                }
                rows={2}
                placeholder="Any special requests?"
                className="ui-textarea mt-2"
              />
            </div>

            {/* Quantity + Add to cart */}
            <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="btn btn-secondary h-10 w-10 rounded-full p-0 text-lg"
                  onClick={() =>
                    setCustomizing((prev) =>
                      prev ? { ...prev, qty: Math.max(1, prev.qty - 1) } : prev,
                    )
                  }
                >
                  −
                </button>
                <span className="w-6 text-center text-base font-bold text-slate-900">
                  {customizing.qty}
                </span>
                <button
                  type="button"
                  className="btn btn-secondary h-10 w-10 rounded-full p-0 text-lg"
                  onClick={() =>
                    setCustomizing((prev) => (prev ? { ...prev, qty: prev.qty + 1 } : prev))
                  }
                >
                  +
                </button>
              </div>
              <button
                type="button"
                onClick={addCustomizedItem}
                className="btn btn-primary flex-1 rounded-xl py-3"
              >
                Add to cart — {formatUsd(
                  Math.max(0, Number(customizing.item.price) +
                    normalizeAddIngredients(customizing.item.add_ingredients)
                      .reduce((s, o) => s + (customizing.add[o.name] ?? 0) * o.price, 0)
                  ) * customizing.qty
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
