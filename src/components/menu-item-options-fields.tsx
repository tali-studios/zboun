"use client";

import { useMemo, useState } from "react";
import {
  buildVariantKey,
  formatSelectedOptionsDisplay,
  listVariantCombinations,
  type MenuOptionGroup,
  type MenuOptionValue,
} from "@/lib/menu-item-options";

type Props = {
  idPrefix?: string;
  defaultGroups?: MenuOptionGroup[];
  defaultVariantStock?: Record<string, number>;
  /** When true, show stock inputs per value (1 group) or per combination (2+ groups). */
  showStock?: boolean;
};

function emptyGroup(): MenuOptionGroup {
  return { label: "", values: [] };
}

export function MenuItemOptionsFields({
  idPrefix = "",
  defaultGroups = [],
  defaultVariantStock = {},
  showStock = false,
}: Props) {
  const [groups, setGroups] = useState<MenuOptionGroup[]>(
    defaultGroups.length > 0 ? defaultGroups : [emptyGroup()],
  );
  const [draftNames, setDraftNames] = useState<Record<number, string>>({});
  const [draftPrices, setDraftPrices] = useState<Record<number, string>>({});
  const [stocks, setStocks] = useState<Record<string, number>>(defaultVariantStock);

  const cleanGroups = useMemo(
    () =>
      groups
        .map((g) => ({
          label: g.label.trim(),
          values: g.values.filter((v) => v.name.trim()),
        }))
        .filter((g) => g.label && g.values.length > 0),
    [groups],
  );

  const optionValuesJson = useMemo(() => JSON.stringify(cleanGroups), [cleanGroups]);
  const primaryLabel = cleanGroups[0]?.label ?? "";
  const combinations = useMemo(() => listVariantCombinations(cleanGroups), [cleanGroups]);

  // Keep stock map aligned with current combinations when showStock
  const stockJson = useMemo(() => {
    if (!showStock || cleanGroups.length === 0) return "{}";
    const next: Record<string, number> = {};
    for (const combo of combinations) {
      const key = buildVariantKey(cleanGroups, combo);
      if (!key) continue;
      next[key] = Math.max(0, Math.floor(Number(stocks[key] ?? 0)));
    }
    return JSON.stringify(next);
  }, [showStock, cleanGroups, combinations, stocks]);

  const fieldId = (name: string) => `${idPrefix}${name}`;

  function updateGroupLabel(index: number, label: string) {
    setGroups((prev) => prev.map((g, i) => (i === index ? { ...g, label } : g)));
  }

  function addValue(index: number) {
    const name = (draftNames[index] ?? "").trim();
    if (!name) return;
    const price = Number(draftPrices[index] || 0);
    const value: MenuOptionValue = {
      name,
      price: Number.isFinite(price) && price > 0 ? price : 0,
    };
    setGroups((prev) =>
      prev.map((g, i) =>
        i === index && !g.values.some((v) => v.name === name)
          ? { ...g, values: [...g.values, value] }
          : g,
      ),
    );
    setDraftNames((prev) => ({ ...prev, [index]: "" }));
    setDraftPrices((prev) => ({ ...prev, [index]: "" }));
  }

  function removeValue(groupIndex: number, valueName: string) {
    setGroups((prev) =>
      prev.map((g, i) =>
        i === groupIndex ? { ...g, values: g.values.filter((v) => v.name !== valueName) } : g,
      ),
    );
  }

  function addGroup() {
    if (groups.length >= 4) return;
    setGroups((prev) => [...prev, emptyGroup()]);
  }

  function removeGroup(index: number) {
    setGroups((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  }

  return (
    <div className="space-y-4">
      {/* Hidden fields for form submit */}
      <input type="hidden" name="option_label" value={primaryLabel} />
      <input type="hidden" name="option_values" value={optionValuesJson} />
      <input type="hidden" name="option_variant_stock" value={stockJson} />

      {groups.map((group, groupIndex) => (
        <div
          key={`group-${groupIndex}`}
          className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3"
        >
          <div className="flex items-end gap-2">
            <div className="min-w-0 flex-1">
              <label
                htmlFor={fieldId(`option_group_${groupIndex}_label`)}
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Option type {groupIndex + 1}
              </label>
              <input
                id={fieldId(`option_group_${groupIndex}_label`)}
                value={group.label}
                onChange={(e) => updateGroupLabel(groupIndex, e.target.value)}
                placeholder={
                  groupIndex === 0
                    ? "e.g. Size, Grind, Nicotine, Storage"
                    : "e.g. Color, Roast"
                }
                className="ui-input w-full"
              />
            </div>
            {groups.length > 1 ? (
              <button
                type="button"
                onClick={() => removeGroup(groupIndex)}
                className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Remove
              </button>
            ) : null}
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              {group.label.trim() ? `${group.label.trim()} values` : "Values"}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {group.values.map((item) => (
                <span
                  key={`${groupIndex}-${item.name}`}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700"
                >
                  {item.name}
                  {item.price > 0 ? ` +$${item.price.toFixed(2)}` : ""}
                  <button
                    type="button"
                    onClick={() => removeValue(groupIndex, item.name)}
                    className="text-slate-400 hover:text-slate-700"
                    aria-label={`Remove ${item.name}`}
                  >
                    ×
                  </button>
                </span>
              ))}
              {group.values.length === 0 ? (
                <p className="text-xs text-slate-500">No values yet — add below.</p>
              ) : null}
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
              <input
                value={draftNames[groupIndex] ?? ""}
                onChange={(e) =>
                  setDraftNames((prev) => ({ ...prev, [groupIndex]: e.target.value }))
                }
                placeholder="Value (e.g. Large, Espresso, Red, 256GB)"
                className="ui-input"
              />
              <input
                value={draftPrices[groupIndex] ?? ""}
                onChange={(e) =>
                  setDraftPrices((prev) => ({ ...prev, [groupIndex]: e.target.value }))
                }
                type="number"
                min={0}
                step="0.01"
                placeholder="Extra $"
                className="ui-input"
              />
              <button
                type="button"
                onClick={() => addValue(groupIndex)}
                className="btn btn-secondary rounded-xl"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      ))}

      {groups.length < 4 ? (
        <button
          type="button"
          onClick={addGroup}
          className="rounded-xl border border-dashed border-violet-300 bg-violet-50/50 px-3 py-2 text-xs font-semibold text-violet-700 hover:bg-violet-50"
        >
          + Add another option type (e.g. Color)
        </button>
      ) : null}

      {showStock && cleanGroups.length > 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-900">
            Stock by variant
          </p>
          <p className="mt-1 text-xs text-amber-800">
            Set quantity for each combination customers can order. Item total stock is the sum.
          </p>
          {combinations.length > 80 ? (
            <p className="mt-2 text-xs font-semibold text-red-700">
              Too many combinations ({combinations.length}). Reduce values (max ~80 shown).
            </p>
          ) : null}
          <div className="mt-3 max-h-64 space-y-2 overflow-y-auto">
            {combinations.slice(0, 80).map((combo) => {
              const key = buildVariantKey(cleanGroups, combo) ?? "";
              const label = formatSelectedOptionsDisplay(cleanGroups, combo);
              return (
                <div
                  key={key}
                  className="flex items-center justify-between gap-3 rounded-lg border border-amber-100 bg-white px-3 py-2"
                >
                  <span className="min-w-0 truncate text-sm font-medium text-slate-800">{label}</span>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={stocks[key] ?? 0}
                    onChange={(e) => {
                      const n = Math.max(0, Math.floor(Number(e.target.value) || 0));
                      setStocks((prev) => ({ ...prev, [key]: n }));
                    }}
                    className="ui-input w-24 text-right"
                    aria-label={`Stock for ${label}`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      <p className="text-xs text-slate-400">
        Customers must pick one value from each option type when ordering.
      </p>
    </div>
  );
}
