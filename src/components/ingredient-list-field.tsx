"use client";

import { useMemo, useState } from "react";

type IngredientItem = { name: string; price?: number };

type Props = {
  name: string;
  label: string;
  withPrice?: boolean;
  defaultItems?: IngredientItem[];
};

export function IngredientListField({
  name,
  label,
  withPrice = false,
  defaultItems = [],
}: Props) {
  const [items, setItems] = useState<IngredientItem[]>(defaultItems);
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");

  const payload = useMemo(() => JSON.stringify(items), [items]);

  function addItem() {
    const cleanName = itemName.trim();
    if (!cleanName) return;
    const price = withPrice ? Number(itemPrice || 0) : 0;
    setItems((prev) => [...prev, { name: cleanName, price: Number.isFinite(price) ? price : 0 }]);
    setItemName("");
    setItemPrice("");
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 md:col-span-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">{label}</p>
      <input type="hidden" name={name} value={payload} />
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item, index) => (
          <span
            key={`${item.name}-${index}`}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700"
          >
            {item.name}
            {withPrice && (item.price ?? 0) > 0 ? ` +$${Number(item.price).toFixed(2)}` : ""}
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="text-slate-400 hover:text-slate-700"
              aria-label={`Remove ${item.name}`}
            >
              ×
            </button>
          </span>
        ))}
        {items.length === 0 ? <p className="text-xs text-slate-500">No items yet.</p> : null}
      </div>
      <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
        <input
          value={itemName}
          onChange={(event) => setItemName(event.target.value)}
          placeholder={withPrice ? "Ingredient name" : "Ingredient to remove"}
          className="ui-input"
        />
        {withPrice ? (
          <input
            value={itemPrice}
            onChange={(event) => setItemPrice(event.target.value)}
            type="number"
            min={0}
            step="0.01"
            placeholder="Price"
            className="ui-input w-full sm:w-28"
          />
        ) : null}
        <button type="button" onClick={addItem} className="btn btn-secondary rounded-xl">
          Add
        </button>
      </div>
    </div>
  );
}
