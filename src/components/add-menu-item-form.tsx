"use client";

import { useState, useRef } from "react";
import { createMenuItemAction } from "@/app-actions/restaurant";
import { IngredientListField } from "@/components/ingredient-list-field";
import { ImageUploadField } from "@/components/image-upload-field";
import { DisplayQuantityFields } from "@/components/display-quantity-fields";
import { MenuNutritionFields } from "@/components/menu-nutrition-fields";

type Category = { id: string; name: string };
type Brand = { id: string; name: string; logo_url: string | null };

const SECTION_ICONS: Record<string, string> = {
  "1": "🍽️",
};

function FieldLabel({
  children,
  required,
  optional,
  htmlFor,
}: {
  children: React.ReactNode;
  required?: boolean;
  optional?: boolean;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500"
    >
      {children}
      {required && <span className="text-red-500">*</span>}
      {optional && <span className="ml-0.5 text-[10px] font-normal normal-case text-slate-400">(optional)</span>}
    </label>
  );
}

function MoneyInput({
  id,
  name,
  placeholder,
  required,
  autoFocus,
  defaultValue,
}: {
  id: string;
  name: string;
  placeholder: string;
  required?: boolean;
  autoFocus?: boolean;
  defaultValue?: string | number;
}) {
  return (
    <div className="flex min-h-[2.75rem] w-full items-center gap-2 rounded-[0.85rem] border-[1.5px] border-[#e2e5f5] bg-[var(--surface-strong)] px-3 transition focus-within:border-[var(--brand)] focus-within:shadow-[0_0_0_4px_rgba(120,84,255,0.14)]">
      <span className="shrink-0 text-sm font-semibold text-slate-400" aria-hidden>
        $
      </span>
      <input
        id={id}
        name={name}
        required={required}
        placeholder={placeholder}
        type="number"
        step="0.01"
        min={0}
        autoFocus={autoFocus}
        defaultValue={defaultValue}
        className="min-w-0 flex-1 border-0 bg-transparent py-2.5 text-[0.9375rem] text-[#0f1126] outline-none placeholder:text-[#a0a8c4]"
      />
    </div>
  );
}

function SectionCard({
  icon,
  title,
  subtitle,
  children,
  accent = false,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        accent
          ? "border-violet-200 bg-gradient-to-br from-violet-50/80 to-white"
          : "border-slate-200 bg-white"
      } shadow-sm`}
    >
      <div className="mb-4 flex items-center gap-2.5">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-base ${
            accent ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-600"
          }`}
        >
          {icon}
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900">{title}</p>
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

export function AddMenuItemForm({
  categories,
  brands,
}: {
  categories: Category[];
  brands: Brand[];
}) {
  const [soldByWeight, setSoldByWeight] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={createMenuItemAction}
      id="add-item"
      className="space-y-4"
    >
      {/* ── Row 1: Identity ── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <SectionCard
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
              <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
            </svg>
          }
          title="Item identity"
          subtitle="Name and where it appears in the menu"
        >
          <div className="space-y-3">
            <div>
              <FieldLabel htmlFor="add-category_id" required>Section</FieldLabel>
              <select id="add-category_id" name="category_id" required className="ui-select w-full">
                <option value="">Choose a section…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <FieldLabel htmlFor="add-name" required>Item name</FieldLabel>
              <input
                id="add-name"
                name="name"
                required
                placeholder="e.g. Grilled Chicken Burger"
                className="ui-input w-full"
                autoComplete="off"
              />
            </div>
            <div>
              <FieldLabel htmlFor="add-brand_id" optional>Brand</FieldLabel>
              <select id="add-brand_id" name="brand_id" className="ui-select w-full">
                <option value="">No brand</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-slate-400">
                {brands.length > 0
                  ? "Choose a brand you added under Manage brands."
                  : "Add brands below first — useful for grocery and ice cream aisles."}
              </p>
            </div>
            <div>
              <FieldLabel htmlFor="add-description" optional>Description</FieldLabel>
              <textarea
                id="add-description"
                name="description"
                placeholder="Describe this item for your customers…"
                rows={2}
                className="ui-textarea w-full resize-none"
              />
            </div>
          </div>
        </SectionCard>

        {/* ── Image ── */}
        <SectionCard
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
            </svg>
          }
          title="Photo"
          subtitle="PNG / JPG / WebP, max 5MB"
        >
          <ImageUploadField name="image_file" optional />
        </SectionCard>
      </div>

      {/* ── Row 2: Pricing ── */}
      <SectionCard
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
            <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        }
        title="Pricing"
        subtitle="Set how this item is priced"
        accent={soldByWeight}
      >
        {/* Sold by weight toggle */}
        <button
          type="button"
          onClick={() => setSoldByWeight((v) => !v)}
          className={`mb-4 flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
            soldByWeight
              ? "border-violet-300 bg-violet-50 shadow-sm"
              : "border-slate-200 bg-slate-50 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm transition ${
                soldByWeight ? "bg-violet-100 text-violet-700" : "bg-white text-slate-500 shadow-sm"
              }`}
            >
              ⚖️
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Sold by weight</p>
              <p className="text-xs text-slate-500">
                {soldByWeight
                  ? "Price is calculated automatically from kg/grams"
                  : "Enable for potatoes, cheese, meat, bulk items…"}
              </p>
            </div>
          </div>
          {/* Toggle pill */}
          <div
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
              soldByWeight ? "bg-violet-600" : "bg-slate-200"
            }`}
          >
            <div
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                soldByWeight ? "translate-x-[22px]" : "translate-x-0.5"
              }`}
            />
          </div>
        </button>

        {/* Hidden checkbox for server action */}
        <input type="hidden" name="sold_by_weight" value={soldByWeight ? "true" : "false"} />

        {soldByWeight ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <input type="hidden" name="price" value="0" />
            <input type="hidden" name="display_quantity" value="" />
            <input type="hidden" name="display_unit" value="g" />
            <div>
              <FieldLabel htmlFor="add-price_per_kg" required>Price per KG ($/kg)</FieldLabel>
              <MoneyInput
                id="add-price_per_kg"
                name="price_per_kg"
                placeholder="2.80"
                required
                autoFocus
              />
              <p className="mt-1 text-xs text-slate-400">e.g. $2.80/kg → 750g = $2.10</p>
            </div>
            <div>
              <FieldLabel htmlFor="add-weight_step_kg" optional>Weight step (kg)</FieldLabel>
              <input
                id="add-weight_step_kg"
                name="weight_step_kg"
                placeholder="0.1"
                type="number"
                step="0.01"
                min={0.01}
                defaultValue={0.1}
                className="ui-input w-full"
              />
              <p className="mt-1 text-xs text-slate-400">0.1 = 100g increments · 0.05 = 50g</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <input type="hidden" name="price_per_kg" value="" />
            <input type="hidden" name="weight_step_kg" value="0.1" />
            <input type="hidden" name="display_quantity" value="" />
            <input type="hidden" name="display_unit" value="g" />
            <div>
              <FieldLabel htmlFor="add-price" required>Price ($)</FieldLabel>
              <MoneyInput id="add-price" name="price" placeholder="4.50" required />
              <p className="mt-1 text-xs text-slate-400">Base price before optional add-ons</p>
            </div>
            <div className="min-w-0">
              <DisplayQuantityFields idPrefix="add-item-qty" />
            </div>
          </div>
        )}
      </SectionCard>

      {/* ── Row 3: Allergens ── */}
      <SectionCard
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        }
        title="Allergens & contents"
        subtitle="Helps customers with dietary restrictions"
      >
        <div>
          <FieldLabel htmlFor="add-contents" optional>Contains / key ingredients</FieldLabel>
          <input
            id="add-contents"
            name="contents"
            placeholder="e.g. wheat, milk, sesame, nuts"
            className="ui-input w-full"
          />
          <p className="mt-1 text-xs text-slate-400">Separate items with commas</p>
        </div>
        <MenuNutritionFields idPrefix="add-item-nutrition" />
      </SectionCard>

      {/* ── Row 4: Customization (collapsible) ── */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
                <circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Customization options</p>
              <p className="text-xs text-slate-400">Removable ingredients, add-ons, size variants</p>
            </div>
          </div>
          <svg
            className={`h-4 w-4 text-slate-400 transition-transform ${showAdvanced ? "rotate-180" : ""}`}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        {showAdvanced && (
          <div className="border-t border-slate-100 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <IngredientListField
                name="removable_ingredients"
                label="Remove ingredients (one by one)"
              />
              <IngredientListField
                name="add_ingredients"
                label="Add ingredients (+ extra price per line)"
                withPrice
              />
            </div>
            <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
              <div>
                <FieldLabel htmlFor="add-option_label" optional>Option type</FieldLabel>
                <input
                  id="add-option_label"
                  name="option_label"
                  placeholder="e.g. Size, Quantity, Packing"
                  className="ui-input w-full"
                />
                <p className="mt-1 text-xs text-slate-400">Add one option category, then define the values below.</p>
              </div>
              <IngredientListField
                name="option_values"
                label="Option values (Small / Large, 1kg / 2kg, etc.)"
                withPrice
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Submit ── */}
      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition hover:brightness-105 active:scale-[0.99]"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Add item to menu
      </button>
    </form>
  );
}
