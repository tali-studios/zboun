"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import type { CategoryWithItems } from "@/lib/data";

type Props = {
  restaurantName: string;
  restaurantPhone: string;
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

export function MenuClient({ restaurantName, restaurantPhone, lbpRate, categories }: Props) {
  const [cart, setCart] = useState<Record<string, CartLine>>({});
  const [customizing, setCustomizing] = useState<CustomizationState | null>(null);
  const [query, setQuery] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);
  const [isSendingOrder, setIsSendingOrder] = useState(false);

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
  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0),
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
    setCustomizing({
      item,
      remove: [],
      add: {},
      note: "",
      qty: 1,
    });
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
        const lineTotal = item.qty * item.unitPrice;
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
      `Total: ${formatUsd(total)} (${formatLbp(total)})`,
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

  function buildOrderPdfBlob() {
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = 210;
    const left = 14;
    const right = pageWidth - left;
    let y = 18;

    const addLine = (text: string, size = 12, bold = false, color: [number, number, number] = [15, 23, 42]) => {
      pdf.setFont("helvetica", bold ? "bold" : "normal");
      pdf.setFontSize(size);
      pdf.setTextColor(color[0], color[1], color[2]);
      const lines = pdf.splitTextToSize(text, right - left);
      pdf.text(lines, left, y);
      y += lines.length * (size * 0.42) + 2.4;
    };

    const ensureSpace = (height = 12) => {
      if (y + height > 285) {
        pdf.addPage();
        y = 18;
      }
    };

    addLine("ORDER CONFIRMATION", 18, true);
    addLine(restaurantName, 15, true, [5, 150, 105]);
    addLine(`Date: ${new Date().toLocaleString()}`, 10);
    y += 2;
    addLine(`Customer Name: ${customerName.trim()}`, 12, true);
    addLine(`Location: ${address.trim()}`, 12, true);
    if (notes.trim()) {
      addLine(`Special notes: ${notes.trim()}`, 11);
    }
    y += 2;
    addLine("Items", 13, true);

    items.forEach((item, index) => {
      ensureSpace(22);
      const lineTotal = item.qty * item.unitPrice;
      addLine(`${index + 1}) ${item.qty}x ${item.name}`, 12, true);
      if (item.removedIngredients.length > 0) {
        addLine(`- Remove: ${item.removedIngredients.join(", ")}`, 10);
      }
      if (item.addedIngredients.length > 0) {
        addLine(
          `- Add: ${item.addedIngredients.map((add) => `${add.name} x${add.qty}`).join(", ")}`,
          10,
        );
      }
      if (item.specialInstructions) {
        addLine(`- Note: ${item.specialInstructions}`, 10);
      }
      addLine(
        `Line total: ${formatUsd(lineTotal)} (${formatLbp(lineTotal)})`,
        11,
        true,
        [15, 23, 42],
      );
      y += 1.5;
    });

    ensureSpace(20);
    y += 2;
    addLine(`TOTAL: ${formatUsd(total)} (${formatLbp(total)})`, 14, true, [5, 150, 105]);
    addLine(
      "This PDF is generated by Zboun order confirmation.",
      9,
      false,
      [100, 116, 139],
    );

    const blob = pdf.output("blob");
    const filename = `order-${restaurantName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}.pdf`;
    return { blob, filename };
  }

  async function handleOrderClick() {
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
    try {
      setIsSendingOrder(true);
      const { blob, filename } = buildOrderPdfBlob();
      const file = new File([blob], filename, { type: "application/pdf" });

      if (
        typeof navigator !== "undefined" &&
        "canShare" in navigator &&
        navigator.canShare &&
        navigator.canShare({ files: [file] }) &&
        "share" in navigator
      ) {
        await navigator.share({
          title: `Order for ${restaurantName}`,
          text: `Please send this order PDF to ${restaurantName} on WhatsApp.`,
          files: [file],
        });
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
      window.alert("Order PDF downloaded. Please attach it in WhatsApp and send.");
      window.location.href = orderLink;
    } finally {
      setIsSendingOrder(false);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
      <section className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search items..."
            className="ui-input"
          />
        </div>
        {filteredCategories.map((category) => (
          <div key={category.id} className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">{category.name}</h2>
            <div className="mt-3 space-y-2.5">
              {category.menu_items.map((item) => (
                <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="flex items-start gap-3">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        width={68}
                        height={68}
                        className="h-[68px] w-[68px] rounded-lg object-cover"
                        unoptimized
                      />
                    ) : null}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold leading-tight text-slate-900">{item.name}</h3>
                      {item.description ? (
                        <p className="mt-0.5 text-sm text-slate-600">{item.description}</p>
                      ) : null}
                      {item.contents ? (
                        <p className="mt-1 text-xs text-slate-500">Contains: {item.contents}</p>
                      ) : null}
                      {item.grams ? (
                        <p className="mt-0.5 text-xs text-slate-500">{item.grams}g</p>
                      ) : null}
                      <div className="mt-1.5 flex items-baseline gap-2">
                        <p className="text-lg font-bold text-emerald-700">{formatUsd(item.price)}</p>
                        <p className="text-sm font-medium text-slate-400">{formatLbp(item.price)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2.5 flex justify-end">
                    <button
                      disabled={!item.is_available}
                      onClick={() => openCustomization(item)}
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600 text-2xl font-bold leading-none text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                      aria-label={item.is_available ? `Customize ${item.name}` : `${item.name} out of stock`}
                    >
                      {item.is_available ? "+" : "−"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
        {filteredCategories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <p className="font-semibold text-slate-800">No items found</p>
            <p className="mt-1 text-sm text-slate-500">Try a different keyword.</p>
          </div>
        ) : null}
      </section>

      <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-4 lg:sticky lg:top-4">
        <h2 className="text-lg font-bold text-slate-900">Your cart</h2>
        <div className="mt-3 max-h-44 space-y-1.5 overflow-y-auto text-sm">
          {items.length === 0 ? (
            <p className="text-slate-500">No items yet.</p>
          ) : (
            items.map((item) => (
              <div key={item.key} className="text-slate-700">
                <p>
                  {item.qty}x {item.name}
                </p>
                {item.removedIngredients.length > 0 ? (
                  <p className="text-xs text-slate-500">Remove: {item.removedIngredients.join(", ")}</p>
                ) : null}
                {item.addedIngredients.length > 0 ? (
                  <p className="text-xs text-slate-500">
                    Add:{" "}
                    {item.addedIngredients
                      .map(
                        (add) =>
                          `${add.name} x${add.qty}${
                            add.price > 0 ? ` (+${formatUsd(add.price * add.qty)})` : ""
                          }`,
                      )
                      .join(", ")}
                  </p>
                ) : null}
                {item.specialInstructions ? (
                  <p className="text-xs text-slate-500">Note: {item.specialInstructions}</p>
                ) : null}
                <p className="text-xs text-slate-500">
                  {formatUsd(item.qty * item.unitPrice)} ({formatLbp(item.qty * item.unitPrice)})
                </p>
                <div className="mt-1 flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEditCustomization(item)}
                    className="text-xs font-semibold text-emerald-700 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => removeCartLine(item.key)}
                    className="text-xs font-semibold text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <p className="mt-3 text-sm font-semibold text-slate-900">
          Total: {formatUsd(total)}{" "}
          <span className="font-medium text-slate-500">({formatLbp(total)})</span>
        </p>
        <div className="mt-4 space-y-2">
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Name"
            className="ui-input"
          />
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Address"
            className="ui-input"
          />
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (optional)"
            rows={3}
            className="ui-textarea"
          />
        </div>
        <label className="mt-4 block rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={isOrderConfirmed}
              onChange={(event) => setIsOrderConfirmed(event.target.checked)}
              className="mt-1"
            />
            <div>
              <p className="font-semibold">I confirm my order listed above.</p>
              <p className="text-slate-600">
                The price I have to pay is <span className="font-semibold">{formatUsd(total)}</span>.
              </p>
            </div>
          </div>
        </label>
        <button
          type="button"
          onClick={handleOrderClick}
          disabled={!canOrder || isSendingOrder}
          className="mt-4 inline-flex w-full justify-center rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isSendingOrder ? "Preparing PDF..." : "Send order as PDF"}
        </button>
      </aside>

      {customizing ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-xl ring-1 ring-slate-200">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                  {customizing.item.name}
                </h3>
                {customizing.item.description ? (
                  <p className="mt-1 text-sm text-slate-600">{customizing.item.description}</p>
                ) : null}
                <div className="mt-1">
                  <p className="text-sm font-semibold text-emerald-700">
                    {formatUsd(customizing.item.price)}
                  </p>
                  <p className="text-sm font-medium text-slate-400">
                    {formatLbp(customizing.item.price)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeCustomization}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-lg font-bold leading-none text-white transition hover:bg-red-500"
                aria-label="Close customization"
              >
                ×
              </button>
            </div>

            {(customizing.item.removable_ingredients?.length ?? 0) > 0 ? (
              <div className="mt-4 border-t border-slate-100 pt-4">
                <h4 className="text-lg font-semibold text-slate-900">Remove</h4>
                <div className="mt-2 space-y-2">
                  {(customizing.item.removable_ingredients ?? []).map((ingredient) => (
                    <label key={`remove-${ingredient.name}`} className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={customizing.remove.includes(ingredient.name)}
                        onChange={(event) => {
                          const checked = event.target.checked;
                          setCustomizing((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  remove: checked
                                    ? [...prev.remove, ingredient.name]
                                    : prev.remove.filter((item) => item !== ingredient.name),
                                }
                              : prev,
                          );
                        }}
                      />
                      <span>{ingredient.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            ) : null}

            {(customizing.item.add_ingredients?.length ?? 0) > 0 ? (
              <div className="mt-4 border-t border-slate-100 pt-4">
                <h4 className="text-lg font-semibold text-slate-900">Add ingredients</h4>
                <div className="mt-2 space-y-2">
                  {(customizing.item.add_ingredients ?? []).map((ingredient) => (
                    <div key={`add-${ingredient.name}`} className="flex items-center justify-between gap-2 text-sm text-slate-700">
                      <span>
                        {ingredient.name}
                        {Number(ingredient.price ?? 0) > 0 ? (
                          <span className="text-slate-500">
                            {" "}
                            + {formatUsd(Number(ingredient.price ?? 0))} (
                            {formatLbp(Number(ingredient.price ?? 0))})
                          </span>
                        ) : null}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-slate-700"
                          onClick={() =>
                            setCustomizing((prev) => {
                              if (!prev) return prev;
                              const current = prev.add[ingredient.name] ?? 0;
                              const next = Math.max(0, current - 1);
                              return {
                                ...prev,
                                add: { ...prev.add, [ingredient.name]: next },
                              };
                            })
                          }
                        >
                          −
                        </button>
                        <span className="min-w-6 text-center font-semibold">
                          {customizing.add[ingredient.name] ?? 0}
                        </span>
                        <button
                          type="button"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-slate-700"
                          onClick={() =>
                            setCustomizing((prev) => {
                              if (!prev) return prev;
                              const current = prev.add[ingredient.name] ?? 0;
                              return {
                                ...prev,
                                add: { ...prev.add, [ingredient.name]: current + 1 },
                              };
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

            <div className="mt-4 border-t border-slate-100 pt-4">
              <h4 className="text-lg font-semibold text-slate-900">Special instructions</h4>
              <textarea
                value={customizing.note}
                onChange={(event) =>
                  setCustomizing((prev) => (prev ? { ...prev, note: event.target.value } : prev))
                }
                rows={3}
                placeholder="Tell us here."
                className="ui-textarea mt-2"
              />
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="btn btn-secondary rounded-xl"
                  onClick={() =>
                    setCustomizing((prev) =>
                      prev ? { ...prev, qty: Math.max(1, prev.qty - 1) } : prev,
                    )
                  }
                >
                  −
                </button>
                <span className="min-w-8 text-center font-semibold text-slate-900">{customizing.qty}</span>
                <button
                  type="button"
                  className="btn btn-secondary rounded-xl"
                  onClick={() =>
                    setCustomizing((prev) => (prev ? { ...prev, qty: prev.qty + 1 } : prev))
                  }
                >
                  +
                </button>
              </div>
              <button type="button" onClick={addCustomizedItem} className="btn btn-success rounded-xl">
                Add to cart
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
