"use client";

import Image from "next/image";
import { ArrowLeft, Minus, Plus, Trash2, UtensilsCrossed } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { CategoryWithItems } from "@/lib/data";
import { CheckoutDeliverySections } from "@/components/checkout-delivery-sections";
import { CheckoutOrderConfirm } from "@/components/checkout-order-confirm";
import type { DeliveryTimeChoice } from "@/components/delivery-time-sheet";
import type { SavedAddressOption } from "@/components/order-delivery-fields";
import { formatDeliveryTimeLabel, isRestaurantOpenNow, parseOpeningHours } from "@/lib/opening-hours";
import { BRAND_HEX, BRAND_HEX_DEEP } from "@/lib/brand";
import { placeOrderAction } from "@/app-actions/orders";
import { useDeliveryLocation } from "@/components/delivery-location-provider";

const BRAND = BRAND_HEX;
const WHATSAPP_GREEN = "#25D366";

type Props = {
  /** In-restaurant QR: browse items and prices only (no cart / WhatsApp order). */
  viewOnly?: boolean;
  restaurantName: string;
  restaurantPhone: string;
  restaurantId: string;
  restaurantSlug: string;
  lbpRate: number;
  categories: CategoryWithItems[];
  defaultCustomerName?: string;
  savedAddresses?: SavedAddressOption[];
  isLoggedIn?: boolean;
  openingHours?: unknown;
  isTemporarilyClosed?: boolean;
  etaLabel?: string | null;
  freeDelivery?: boolean;
  deliveryFeeUsd?: number;
  orderingEnabled?: boolean;
};

type CartLine = {
  key: string;
  itemId: string;
  name: string;
  imageUrl: string | null;
  qty: number; // either count (each) or kilograms (kg) when unit==="kg"
  unit: "each" | "kg";
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
  qty: number; // either count (each) or kilograms (kg) when sold_by_weight
  editingKey?: string;
};

function isSoldByWeight(item: CategoryWithItems["menu_items"][number]) {
  return Boolean((item as { sold_by_weight?: boolean }).sold_by_weight);
}

function formatQty(unit: "each" | "kg", qty: number): string {
  if (unit === "kg") {
    if (qty < 1) return `${Math.round(qty * 1000)} g`;
    return `${qty.toFixed(2).replace(/0+$/, "").replace(/\.$/, "")} kg`;
  }
  return `${qty}×`;
}

export function MenuClient({
  viewOnly = false,
  restaurantName,
  restaurantPhone,
  restaurantId,
  restaurantSlug,
  lbpRate,
  categories,
  defaultCustomerName = "",
  savedAddresses = [],
  isLoggedIn = false,
  openingHours: openingHoursRaw,
  isTemporarilyClosed = false,
  etaLabel = null,
  freeDelivery = false,
  deliveryFeeUsd = 0,
  orderingEnabled = true,
}: Props) {
  const parsedOpeningHours = useMemo(() => parseOpeningHours(openingHoursRaw), [openingHoursRaw]);
  const isOpenNow = useMemo(
    () => isRestaurantOpenNow(parsedOpeningHours, { isTemporarilyClosed }),
    [parsedOpeningHours, isTemporarilyClosed],
  );
  const orderingBlocked = isTemporarilyClosed || !orderingEnabled;
  const canShop = !viewOnly && !orderingBlocked;
  const [cart, setCart] = useState<Record<string, CartLine>>({});
  const [customizing, setCustomizing] = useState<CustomizationState | null>(null);
  const [query, setQuery] = useState("");
  const [menuCategoryFilter, setMenuCategoryFilter] = useState<string>("all");
  const [customerName, setCustomerName] = useState(defaultCustomerName);
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [noCutlery, setNoCutlery] = useState(false);
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"review" | "confirm">("review");
  const [checkoutBackToCart, setCheckoutBackToCart] = useState(false);
  const [deliveryTime, setDeliveryTime] = useState<DeliveryTimeChoice>({ mode: "now" });
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<{ orderId: string; whatsappUrl: string | null } | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);
  const { location } = useDeliveryLocation();
  const orderTopRef = useRef<HTMLDivElement>(null);

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
  const deliveryCharge = useMemo(
    () => (freeDelivery ? 0 : Math.max(0, deliveryFeeUsd)),
    [freeDelivery, deliveryFeeUsd],
  );
  const orderTotal = useMemo(() => total + deliveryCharge, [total, deliveryCharge]);
  const itemCount = useMemo(
    () =>
      items.reduce((sum, item) => {
        if (item.unit === "kg") return sum + 1;
        return sum + item.qty;
      }, 0),
    [items],
  );

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
    const unitQty = isSoldByWeight(item) ? 1 : 1;
    setCustomizing({ item, remove: [], add: {}, note: "", qty: unitQty });
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
    const soldByWeight = isSoldByWeight(customizing.item);
    const baseUnitPrice = soldByWeight
      ? Number((customizing.item as { price_per_kg?: number | null }).price_per_kg ?? 0)
      : Number(customizing.item.price);
    const unitPrice = Math.max(0, baseUnitPrice + addCost);
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
            imageUrl: customizing.item.image_url ?? existing.imageUrl ?? null,
            specialInstructions: customizing.note.trim(),
            removedIngredients: [...customizing.remove],
            addedIngredients: selectedAdd,
            unitPrice,
            unit: soldByWeight ? "kg" : "each",
          },
        };
      }
      return {
        ...baseCart,
        [lineKey]: {
          key: lineKey,
          itemId: customizing.item.id,
          name: customizing.item.name,
          imageUrl: customizing.item.image_url ?? null,
          qty: customizing.qty,
          unit: soldByWeight ? "kg" : "each",
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

  function getMenuItemById(itemId: string) {
    return categories.flatMap((category) => category.menu_items).find((item) => item.id === itemId);
  }

  function getLineImageUrl(line: CartLine) {
    if (line.imageUrl) return line.imageUrl;
    return getMenuItemById(line.itemId)?.image_url ?? null;
  }

  function getQtyStepForLine(line: CartLine) {
    if (line.unit !== "kg") return 1;
    const item = getMenuItemById(line.itemId);
    const step = Number((item as { weight_step_kg?: number | null } | undefined)?.weight_step_kg ?? 0.25);
    return step > 0 ? step : 0.25;
  }

  function incrementCartLine(key: string) {
    setCart((prev) => {
      const line = prev[key];
      if (!line) return prev;
      const step = getQtyStepForLine(line);
      const newQty = Math.round((line.qty + step) * 1000) / 1000;
      return { ...prev, [key]: { ...line, qty: newQty } };
    });
  }

  function decrementCartLine(key: string) {
    setCart((prev) => {
      const line = prev[key];
      if (!line) return prev;
      const step = getQtyStepForLine(line);
      if (line.qty <= step) {
        return Object.fromEntries(Object.entries(prev).filter(([k]) => k !== key));
      }
      const newQty = Math.round((line.qty - step) * 1000) / 1000;
      return { ...prev, [key]: { ...line, qty: newQty } };
    });
  }

  function canDecrementCartLine(line: CartLine) {
    const step = getQtyStepForLine(line);
    return line.qty > step + 1e-9;
  }

  function displayCartQty(line: CartLine) {
    if (line.unit === "kg") {
      if (line.qty >= 1 && Number.isInteger(line.qty)) return String(line.qty);
      return formatQty("kg", line.qty).replace(" kg", "").replace(" g", "g");
    }
    return String(line.qty);
  }

  function formatUsd(amount: number) {
    return `$${amount.toFixed(2)}`;
  }

  function formatLbp(amountUsd: number) {
    const lbp = Math.round(amountUsd * lbpRate);
    return `L.L ${lbp.toLocaleString()}`;
  }

  function buildOrderNotes() {
    const parts: string[] = [];
    if (noCutlery) parts.push("Please do not send cutlery.");
    if (deliveryTime.mode === "scheduled") {
      parts.push(`Scheduled delivery: ${formatDeliveryTimeLabel(deliveryTime, etaLabel)}`);
    }
    const trimmed = notes.trim();
    if (trimmed) parts.push(trimmed);
    return parts.length > 0 ? parts.join("\n") : null;
  }

  function createWhatsAppMessage() {
    const cleanName = customerName.trim();
    const cleanAddress = address.trim();
    const orderNotes = buildOrderNotes();
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
        const qtyText = item.unit === "kg" ? formatQty("kg", item.qty) : `${item.qty}x`;
        const priceText = ` (${formatUsd(item.qty * item.unitPrice)})`;
        return `- ${qtyText} ${item.name}${modifierText}${priceText}`;
      }),
      "",
      `Name: ${cleanName}`,
      `Address: ${cleanAddress}`,
      orderNotes ? `Notes: ${orderNotes}` : "",
    ].filter(Boolean);

    return encodeURIComponent(lines.join("\n"));
  }

  const orderLink = `https://wa.me/${restaurantPhone.replace(/\D/g, "")}?text=${createWhatsAppMessage()}`;

  async function handleOrderClick() {
    if (orderingBlocked) {
      setOrderError("This restaurant is closed and not accepting online orders right now.");
      return;
    }
    if (deliveryTime.mode === "now" && !isOpenNow) {
      setOrderError("The restaurant is closed right now. Please schedule your delivery for later.");
      return;
    }
    if (!customerName.trim() || !address.trim()) {
      setOrderError("Please fill in your name and delivery address before ordering.");
      return;
    }
    if (items.length === 0) {
      setOrderError("Your cart is empty.");
      return;
    }
    setOrderError(null);
    setIsPlacingOrder(true);
    try {
      const result = await placeOrderAction({
        restaurantId,
        restaurantSlug,
        customerName: customerName.trim(),
        customerPhone: null,
        deliveryAddress: address.trim(),
        deliveryLat: location?.lat ?? null,
        deliveryLng: location?.lng ?? null,
        items: items.map((item) => ({
          name: item.name,
          qty: item.qty,
          unit: item.unit,
          unitPrice: item.unitPrice,
          removedIngredients: item.removedIngredients,
          addedIngredients: item.addedIngredients,
          specialInstructions: item.specialInstructions,
        })),
        notes: buildOrderNotes(),
        totalUsd: orderTotal,
        scheduledFor: deliveryTime.mode === "scheduled" ? deliveryTime.at : null,
      });
      if (!result.ok) {
        setOrderError(result.error);
        return;
      }
      setPlacedOrder({ orderId: result.orderId, whatsappUrl: result.whatsappNotifyUrl });
      setCart({});
      setNoCutlery(false);
      setShowCheckout(false);
      setCheckoutStep("review");
      setCheckoutBackToCart(false);
      orderTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (err) {
      setOrderError(err instanceof Error ? err.message : "Failed to place order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  }

  /* ─── Suggested items: items from the menu not already in cart ─── */
  function renderSuggestedItems() {
    const cartItemIds = new Set(items.map((l) => l.itemId));
    const allItems = categories.flatMap((c) => c.menu_items);
    const suggestions = allItems
      .filter((m) => m.is_available && !cartItemIds.has(m.id))
      .slice(0, 10);
    if (suggestions.length === 0) return null;
    return (
      <div className="mt-5">
        <p className="mb-2.5 text-xs font-bold uppercase tracking-wide text-slate-400">Complete your order with</p>
        <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {suggestions.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => openCustomization(m)}
              className="group relative flex w-28 shrink-0 flex-col overflow-hidden rounded-2xl bg-white shadow ring-1 ring-black/[0.06] transition hover:shadow-md"
            >
              <div className="h-24 w-full overflow-hidden bg-slate-100">
                {m.image_url ? (
                  <Image
                    src={m.image_url}
                    alt=""
                    width={112}
                    height={96}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl text-slate-200" aria-hidden>···</div>
                )}
              </div>
              <div className="flex h-6 w-6 items-center justify-center rounded-full text-white absolute bottom-[3.4rem] right-2 shadow-sm text-lg font-light leading-none" style={{ backgroundColor: BRAND }}>
                +
              </div>
              <div className="px-2 pb-2.5 pt-1.5 text-left">
                <p className="line-clamp-2 text-[11px] font-semibold leading-snug text-slate-800">{m.name}</p>
                <p className="mt-0.5 text-[11px] font-bold" style={{ color: BRAND }}>{formatLbp(m.price)}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
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
        <div className="mt-4 max-h-[min(50vh,320px)] flex-1 overflow-y-auto lg:max-h-80">
          {items.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">Your cart is empty.</p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const lineTotal = item.qty * item.unitPrice;
                const imageUrl = getLineImageUrl(item);
                const hasModifiers =
                  item.removedIngredients.length > 0 ||
                  item.addedIngredients.length > 0 ||
                  Boolean(item.specialInstructions);

                return (
                  <div key={item.key} className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => openEditCustomization(item)}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      aria-label={`Edit ${item.name}`}
                    >
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt=""
                            width={64}
                            height={64}
                            className="h-full w-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-lg text-slate-300" aria-hidden>
                            ···
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-bold leading-snug text-slate-900">
                          {item.name}
                        </p>
                        <p className="mt-1 text-sm font-bold text-slate-900">{formatLbp(lineTotal)}</p>
                        {hasModifiers ? (
                          <p className="mt-0.5 text-[11px] text-slate-400">Tap to edit options</p>
                        ) : null}
                      </div>
                    </button>

                    <div className="flex shrink-0 items-center rounded-full bg-slate-100 px-1 py-1">
                      <button
                        type="button"
                        onClick={() =>
                          canDecrementCartLine(item) ? decrementCartLine(item.key) : removeCartLine(item.key)
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-white hover:text-slate-800"
                        aria-label={
                          canDecrementCartLine(item)
                            ? `Decrease quantity of ${item.name}`
                            : `Remove ${item.name}`
                        }
                      >
                        {canDecrementCartLine(item) ? (
                          <Minus className="h-4 w-4" strokeWidth={2.5} />
                        ) : (
                          <Trash2 className="h-4 w-4" strokeWidth={2} />
                        )}
                      </button>
                      <span className="min-w-[1.75rem] px-1 text-center text-sm font-bold tabular-nums text-slate-900">
                        {displayCartQty(item)}
                      </span>
                      <button
                        type="button"
                        onClick={() => incrementCartLine(item.key)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-slate-700 transition hover:bg-white"
                        aria-label={`Add one more ${item.name}`}
                      >
                        <Plus className="h-4 w-4" strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Subtotal */}
        {items.length > 0 ? (
          <div className="mt-5 border-t border-dashed border-slate-200 pt-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-slate-900">Subtotal</p>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-bold text-slate-900">{formatLbp(total)}</span>
                <span className="text-xs text-slate-400">{formatUsd(total)}</span>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-3 overflow-hidden rounded-2xl bg-white px-4 py-3.5 shadow-sm ring-1 ring-slate-100">
              <UtensilsCrossed className="h-5 w-5 shrink-0 text-slate-800" strokeWidth={2} aria-hidden />
              <span className="min-w-0 flex-1 text-sm font-semibold leading-snug text-slate-900">
                Please do not send cutlery
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={noCutlery}
                aria-label="Please do not send cutlery"
                onClick={() => setNoCutlery((value) => !value)}
                className={`inline-flex h-7 w-12 shrink-0 items-center rounded-full p-0.5 transition-colors ${
                  noCutlery ? "bg-emerald-500" : "bg-slate-200"
                }`}
              >
                <span
                  className={`block h-6 w-6 rounded-full bg-white shadow transition-transform duration-200 ease-out ${
                    noCutlery ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        ) : null}

        {/* Suggested items */}
        {items.length > 0 ? renderSuggestedItems() : null}

        {/* Two-button footer */}
        {items.length > 0 ? (
          <div className="mt-5 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Add items
            </button>
            <button
              type="button"
              onClick={() => {
                setCheckoutBackToCart(Boolean(onClose));
                setCheckoutStep("review");
                setShowCheckout(true);
                if (onClose) onClose();
              }}
              className="flex flex-col items-center justify-center rounded-full py-2.5 text-white shadow-md transition hover:brightness-105"
              style={{ background: "linear-gradient(135deg, #7854ff 0%, #a855f7 100%)" }}
            >
              <span className="text-[11px] font-semibold leading-none opacity-80">Checkout</span>
              <span className="mt-0.5 text-sm font-bold leading-none">{formatLbp(orderTotal)}</span>
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  function closeCheckoutSheet() {
    setShowCheckout(false);
    setCheckoutStep("review");
    if (checkoutBackToCart) {
      setShowMobileCart(true);
      setCheckoutBackToCart(false);
    }
  }

  function proceedToOrderConfirm() {
    if (orderingBlocked) {
      setOrderError("This restaurant is closed and not accepting online orders right now.");
      return;
    }
    if (deliveryTime.mode === "now" && !isOpenNow) {
      setOrderError("The restaurant is closed right now. Please schedule your delivery for later.");
      return;
    }
    if (!customerName.trim() || !address.trim()) {
      setOrderError("Please fill in your name and delivery address before ordering.");
      return;
    }
    if (items.length === 0) {
      setOrderError("Your cart is empty.");
      return;
    }
    setOrderError(null);
    setCheckoutStep("confirm");
  }

  /* ─── Checkout sheet ─── */
  function renderCheckoutSheet() {
    const canProceed =
      items.length > 0 &&
      customerName.trim().length > 0 &&
      address.trim().length > 0 &&
      !orderingBlocked &&
      (deliveryTime.mode === "scheduled" || isOpenNow);

    const isConfirmStep = checkoutStep === "confirm";

    return (
      <div className="fixed inset-0 z-[60]">
        <div
          className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          onClick={() => {
            if (!isPlacingOrder) closeCheckoutSheet();
          }}
        />
        <div className="absolute inset-x-0 bottom-0 z-10 flex max-h-[96dvh] flex-col overflow-hidden rounded-t-3xl bg-slate-100 shadow-2xl lg:inset-y-0 lg:left-auto lg:right-0 lg:w-[min(100vw,28rem)] lg:max-h-none lg:rounded-none lg:rounded-l-3xl">
          {/* Header */}
          <div className="sticky top-0 z-10 grid shrink-0 grid-cols-[2.5rem_1fr_2.5rem] items-center border-b border-slate-200/80 bg-white px-4 py-3.5">
            <button
              type="button"
              onClick={() => {
                if (isConfirmStep && !isPlacingOrder) {
                  setCheckoutStep("review");
                  return;
                }
                if (!isPlacingOrder) closeCheckoutSheet();
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full text-slate-900 transition hover:bg-slate-100 disabled:opacity-40"
              aria-label={isConfirmStep ? "Back to checkout" : "Back to cart"}
              disabled={isPlacingOrder}
            >
              <ArrowLeft className="h-5 w-5" strokeWidth={2.25} aria-hidden />
            </button>
            <h2 className="text-center text-base font-bold text-slate-900">
              {isConfirmStep ? "Confirm order" : "Checkout"}
            </h2>
            <div aria-hidden />
          </div>

          {isConfirmStep ? (
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-4 pt-4">
              <CheckoutOrderConfirm
                orderTotal={orderTotal}
                itemCount={itemCount}
                formatLbp={formatLbp}
                formatUsd={formatUsd}
                restaurantName={restaurantName}
                onCancel={() => setCheckoutStep("review")}
                onPlaceOrder={handleOrderClick}
                isPlacingOrder={isPlacingOrder}
              />
              {orderError ? (
                <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{orderError}</p>
              ) : null}
            </div>
          ) : (
            <>
              <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-4">
                <CheckoutDeliverySections
                  customerName={customerName}
                  onCustomerNameChange={setCustomerName}
                  address={address}
                  onAddressChange={setAddress}
                  notes={notes}
                  onNotesChange={setNotes}
                  savedAddresses={savedAddresses}
                  isLoggedIn={isLoggedIn}
                  openingHours={parsedOpeningHours}
                  etaLabel={etaLabel}
                  deliveryTime={deliveryTime}
                  onDeliveryTimeChange={setDeliveryTime}
                />

                <section className="mt-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/[0.04]">
                  <p className="text-sm font-bold text-slate-900">Order summary</p>
                  <div className="mt-3 space-y-2">
                    {items.map((item) => (
                      <div key={item.key} className="flex items-start justify-between gap-2">
                        <p className="text-sm text-slate-600">
                          <span className="font-semibold text-slate-800">
                            {item.unit === "kg" ? formatQty("kg", item.qty) : `${item.qty}×`}
                          </span>{" "}
                          {item.name}
                        </p>
                        <p className="shrink-0 text-sm font-semibold text-slate-800">
                          {formatLbp(item.qty * item.unitPrice)}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-dashed border-slate-200 pt-3">
                    <p className="text-sm text-slate-600">Subtotal</p>
                    <p className="text-sm font-bold text-slate-900">{formatLbp(total)}</p>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-sm text-slate-600">Delivery</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {deliveryCharge === 0 ? "Free" : formatLbp(deliveryCharge)}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-900">Total</p>
                    <div className="text-right">
                      <p className="text-base font-bold text-slate-900">{formatLbp(orderTotal)}</p>
                      <p className="text-xs text-slate-400">{formatUsd(orderTotal)}</p>
                    </div>
                  </div>
                </section>

                {orderError ? (
                  <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{orderError}</p>
                ) : null}
              </div>

              <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-slate-500">Total payment</p>
                    <p className="text-lg font-bold tabular-nums text-slate-900">{formatLbp(orderTotal)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={proceedToOrderConfirm}
                    disabled={!canProceed}
                    className="min-w-[9.5rem] shrink-0 rounded-2xl px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
                    style={{ background: `linear-gradient(135deg, ${BRAND_HEX} 0%, ${BRAND_HEX_DEEP} 100%)` }}
                  >
                    Continue
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  /** Confirmation screen shown after order is successfully placed */
  function renderOrderConfirmation() {
    if (!placedOrder) return null;
    const shortId = placedOrder.orderId.slice(0, 8).toUpperCase();
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <svg className="h-8 w-8 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Order Placed!</h2>
        <p className="mt-1 text-sm text-slate-500">Reference: <span className="font-bold text-slate-700">#{shortId}</span></p>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Your order has been received by <span className="font-semibold">{restaurantName}</span>.
          They will confirm it shortly.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Once your order is delivered, you can rate the restaurant from{" "}
          <a href="/account/orders" className="font-semibold text-violet-600 hover:underline">
            My Orders
          </a>
          .
        </p>

        {placedOrder.whatsappUrl ? (
          <div className="mt-6 rounded-2xl border border-green-100 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Also notify via WhatsApp</p>
            <p className="mt-1 text-xs text-slate-500">Tap below to also send your order details directly to the restaurant on WhatsApp.</p>
            <a
              href={placedOrder.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-bold text-white transition hover:brightness-110"
              style={{ backgroundColor: "#25D366" }}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.124 1.532 5.859L.054 23.285a.75.75 0 00.916.916l5.437-1.478A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.89 0-3.67-.5-5.21-1.374l-.374-.213-3.867 1.051 1.052-3.843-.226-.386A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
              </svg>
              Also notify on WhatsApp
            </a>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setPlacedOrder(null)}
          className="mt-5 w-full rounded-full border border-slate-200 py-3 text-sm font-semibold text-slate-600 transition hover:border-violet-300 hover:text-violet-700"
        >
          Order something else
        </button>
      </div>
    );
  }

  /* ─── Render ────────────────────────────────────────────────────────── */
  return (
    <>
      <div ref={orderTopRef} />
      {placedOrder ? (
        <div className="py-8">{renderOrderConfirmation()}</div>
      ) : null}
      {!placedOrder ? (
      <>
      {!viewOnly && (orderingBlocked || !isOpenNow) ? (
        <div
          className={`mb-4 rounded-2xl px-4 py-3 text-sm ${
            orderingBlocked
              ? "border border-rose-200 bg-rose-50 text-rose-800"
              : "border border-amber-200 bg-amber-50 text-amber-900"
          }`}
        >
          {orderingBlocked ? (
            <p className="font-semibold">Closed now — online ordering is unavailable.</p>
          ) : (
            <>
              <p className="font-semibold">Closed now</p>
              <p className="mt-0.5 text-xs opacity-90">
                You can still browse the menu and schedule delivery at checkout during opening hours.
              </p>
            </>
          )}
        </div>
      ) : null}
      <div
        className={`grid min-w-0 gap-4 ${
          viewOnly ? "" : "lg:grid-cols-[minmax(0,1fr)_360px]"
        } ${
          viewOnly
            ? "pb-[calc(2rem+env(safe-area-inset-bottom,0px))]"
            : items.length > 0
              ? "pb-[calc(10.5rem+env(safe-area-inset-bottom,0px)+1rem)] lg:pb-0"
              : "pb-[calc(3rem+env(safe-area-inset-bottom,0px))] lg:pb-0"
        }`}
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

          {/* Category pills — phone: one row + swipe; sm+: wrap so every section is visible on laptop without hunting for horizontal scroll */}
          <div className="flex min-w-0 w-full max-w-full flex-nowrap gap-2 overflow-x-auto overflow-y-hidden touch-pan-x pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:overflow-x-visible sm:overflow-y-visible sm:touch-auto">
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
                    <div
                      className={`flex min-h-[88px] min-w-0 flex-1 flex-col ${canShop ? "pr-12" : ""}`}
                    >
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

                    {canShop ? (
                      <button
                        disabled={!item.is_available}
                        onClick={() => openCustomization(item)}
                        className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full text-xl font-light leading-none text-white shadow-md shadow-violet-500/35 transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                        style={{ backgroundColor: item.is_available ? BRAND : undefined }}
                        aria-label={item.is_available ? `Add ${item.name}` : `${item.name} unavailable`}
                      >
                        +
                      </button>
                    ) : null}
                  </article>
                ))}
              </div>
            </div>
          ))}

        </section>

        {canShop ? (
          <aside
            className="hidden h-fit rounded-2xl border border-slate-200/80 bg-white p-5 shadow-md lg:block lg:sticky lg:top-6"
            style={{ boxShadow: "0 8px 30px rgba(120, 84, 255, 0.12)" }}
          >
            {renderCartPanel({})}
          </aside>
        ) : null}
      </div>

      {/* ── Mobile cart — purple card (tap → cart sheet) ───── */}
      {canShop && items.length > 0 ? (
        <div className="fixed bottom-0 left-0 right-0 z-30 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-2 lg:hidden">
          <div className="container mx-auto min-w-0 max-w-full px-3 sm:px-6">
            <button
              type="button"
              onClick={() => setShowMobileCart(true)}
              className="block w-full rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F9FAFB]"
              aria-label="Open your cart to review and order on WhatsApp"
            >
              <div
                className="flex items-center gap-3 rounded-2xl border border-white/15 px-3.5 py-2.5 shadow-[0_6px_28px_rgba(76,29,149,0.38),inset_0_1px_0_rgba(255,255,255,0.12)] transition-[filter] duration-150 active:brightness-95"
                style={{ backgroundImage: `linear-gradient(135deg, ${BRAND_HEX} 0%, ${BRAND_HEX_DEEP} 100%)` }}
              >
                {/* Icon + count badge */}
                <div className="relative shrink-0" aria-hidden>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white ring-1 ring-white/25">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <span className="absolute -right-1.5 -top-1.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold leading-none text-white shadow">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                </div>
                {/* Label */}
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/60">Your cart</p>
                  <p className="mt-0.5 text-[14px] font-bold leading-none tracking-tight text-white">
                    {itemCount} {itemCount === 1 ? "item" : "items"}
                  </p>
                </div>
                {/* Divider */}
                <div className="h-8 w-px shrink-0 bg-white/20" aria-hidden />
                {/* Price */}
                <div className="shrink-0 text-right">
                  <p className="text-[17px] font-bold tabular-nums leading-none tracking-tight text-white">
                    {formatUsd(orderTotal)}
                  </p>
                  <p className="mt-0.5 text-[10px] font-medium tabular-nums text-white/60">{formatLbp(orderTotal)}</p>
                </div>
                {/* Chevron */}
                <svg className="h-4 w-4 shrink-0 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      ) : null}

      {/* ── Mobile cart sheet ──────────────────────────────────────────── */}
      {canShop && showMobileCart ? (
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

      {/* ── Checkout sheet ─────────────────────────────────────────────── */}
      {canShop && showCheckout && typeof document !== "undefined"
        ? createPortal(renderCheckoutSheet(), document.body)
        : null}

      {/* ── Customization modal ────────────────────────────────────────── */}
      {canShop && customizing ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 backdrop-blur-sm p-0 sm:items-center sm:p-4">
          <div className="w-full max-h-[95dvh] overflow-y-auto rounded-t-3xl bg-white px-5 pb-6 pt-5 shadow-2xl sm:max-h-[90vh] sm:max-w-xl sm:rounded-3xl sm:px-6 sm:pb-6 sm:pt-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="text-xl font-bold tracking-tight text-slate-900">{customizing.item.name}</h3>
                {customizing.item.description ? (
                  <p className="mt-0.5 text-sm text-slate-500">{customizing.item.description}</p>
                ) : null}
                <div className="mt-1.5 flex items-baseline gap-2">
                  <span className="text-base font-bold" style={{ color: BRAND }}>
                    {isSoldByWeight(customizing.item)
                      ? `${formatUsd(
                          Number(
                            (customizing.item as { price_per_kg?: number | null }).price_per_kg ?? 0,
                          ),
                        )} / kg`
                      : formatUsd(customizing.item.price)}
                  </span>
                  <span className="text-sm text-slate-400">
                    {isSoldByWeight(customizing.item) ? "" : formatLbp(customizing.item.price)}
                  </span>
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
              {isSoldByWeight(customizing.item) ? (
                <div className="flex items-center gap-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Weight</p>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="number"
                        min={Number((customizing.item as { weight_step_kg?: number | null }).weight_step_kg ?? 0.1)}
                        step={Number((customizing.item as { weight_step_kg?: number | null }).weight_step_kg ?? 0.1)}
                        value={customizing.qty}
                        onChange={(e) => {
                          const raw = Number(e.target.value);
                          const step = Number((customizing.item as { weight_step_kg?: number | null }).weight_step_kg ?? 0.1);
                          const next = Number.isFinite(raw) ? Math.max(step, raw) : step;
                          setCustomizing((prev) => (prev ? { ...prev, qty: next } : prev));
                        }}
                        className="w-24 rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm font-semibold text-slate-800"
                      />
                      <span className="text-sm font-semibold text-slate-600">kg</span>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    {[
                      { label: "250g", kg: 0.25 },
                      { label: "500g", kg: 0.5 },
                      { label: "750g", kg: 0.75 },
                      { label: "1kg", kg: 1 },
                    ].map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setCustomizing((prev) => (prev ? { ...prev, qty: p.kg } : prev))}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-violet-200 hover:text-violet-700"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
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
              )}
              <button
                type="button"
                onClick={addCustomizedItem}
                className="btn btn-primary flex-1 rounded-xl py-3"
              >
                Add to cart — {formatUsd(
                  (() => {
                    const addCost = normalizeAddIngredients(customizing.item.add_ingredients)
                      .reduce((s, o) => s + (customizing.add[o.name] ?? 0) * o.price, 0);
                    const soldByWeight = isSoldByWeight(customizing.item);
                    const base = soldByWeight
                      ? Number((customizing.item as { price_per_kg?: number | null }).price_per_kg ?? 0)
                      : Number(customizing.item.price);
                    return Math.max(0, base + addCost) * customizing.qty;
                  })()
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      </>
      ) : null}
    </>
  );
}
