"use client";

import { useState, useRef } from "react";
import { useFormStatus } from "react-dom";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { createMenuItemAction } from "@/app-actions/restaurant";
import { IngredientListField } from "@/components/ingredient-list-field";
import { ImageUploadField } from "@/components/image-upload-field";
import { DisplayQuantityFields } from "@/components/display-quantity-fields";
import { MenuNutritionFields } from "@/components/menu-nutrition-fields";
import { MenuItemOptionsFields } from "@/components/menu-item-options-fields";
import { MenuItemStockFields } from "@/components/menu-item-stock-fields";
import type { StoreItemProfile } from "@/lib/store-item-profile";

type Category = { id: string; name: string };
type Brand = { id: string; name: string; logo_url: string | null };

const DEFAULT_PROFILE: StoreItemProfile = {
  weightPricing: false,
  displayQuantity: false,
  nutrition: false,
  contents: false,
  ingredientCustomization: false,
  isFoodLike: false,
};

// ─── Shared sub-components ────────────────────────────────────────────────────

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
  value,
  onChange,
}: {
  id: string;
  name: string;
  placeholder: string;
  required?: boolean;
  autoFocus?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <div className="flex min-h-[2.75rem] w-full items-center gap-2 rounded-[0.85rem] border-[1.5px] border-[#e2e5f5] bg-white px-3 transition focus-within:border-violet-400 focus-within:shadow-[0_0_0_3px_rgba(120,84,255,0.12)]">
      <span className="shrink-0 text-sm font-semibold text-slate-400" aria-hidden>$</span>
      <input
        id={id}
        name={name}
        required={required}
        placeholder={placeholder}
        type="number"
        step="0.01"
        min={0}
        autoFocus={autoFocus}
        value={value}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        className="min-w-0 flex-1 border-0 bg-transparent py-2.5 text-[0.9375rem] text-slate-900 outline-none placeholder:text-slate-400"
      />
    </div>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="h-px flex-1 bg-slate-100" />
      <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
      <div className="h-px flex-1 bg-slate-100" />
    </div>
  );
}

function ExpandSection({
  label,
  icon,
  children,
  defaultOpen = false,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-3.5 text-left transition hover:bg-slate-50/60"
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            {icon}
          </span>
          <span className="text-sm font-semibold text-slate-800">{label}</span>
        </div>
        <svg
          className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
          strokeLinecap="round" strokeLinejoin="round" aria-hidden
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="border-t border-slate-100 px-5 pb-5 pt-4 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
}

function AddItemSubmitButton({ isFood }: { isFood: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition hover:brightness-105 active:scale-[0.99] disabled:cursor-wait disabled:opacity-80"
    >
      {pending ? (
        <>
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Adding item…
        </>
      ) : (
        <>
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add item to {isFood ? "menu" : "store"}
        </>
      )}
    </button>
  );
}

// ─── Main form ────────────────────────────────────────────────────────────────

export function AddMenuItemForm({
  categories,
  brands,
  profile = DEFAULT_PROFILE,
}: {
  categories: Category[];
  brands: Brand[];
  profile?: StoreItemProfile;
}) {
  const [soldByWeight, setSoldByWeight] = useState(false);
  const [price, setPrice] = useState("");
  const [pricePerKg, setPricePerKg] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const submittingRef = useRef(false);

  function toggleSoldByWeight() {
    if (!soldByWeight) {
      // Keep the typed amount — move it into $/kg when enabling weight pricing.
      setPricePerKg((current) => current.trim() || price.trim());
      setSoldByWeight(true);
      return;
    }
    setPrice((current) => current.trim() || pricePerKg.trim());
    setSoldByWeight(false);
  }
  const isFood = profile.isFoodLike;
  const canWeighByWeight = profile.weightPricing;
  const canShowQty = profile.displayQuantity;
  const canShowNutritionSection = profile.nutrition || profile.contents;
  const canCustomizeIngredients = profile.ingredientCustomization;

  async function handleCreate(formData: FormData) {
    if (submittingRef.current) return;
    submittingRef.current = true;
    try {
      await createMenuItemAction(formData);
    } catch (error) {
      if (isRedirectError(error)) throw error;
      submittingRef.current = false;
      throw error;
    }
  }

  return (
    <form ref={formRef} action={handleCreate} id="add-item" className="space-y-3">

      {/* ─── STEP 1: Essentials (always shown, fast-fill) ─────────────────── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-100 text-violet-600 text-[10px] font-bold">1</span>
          Essentials
        </p>

        <div className="grid gap-3 sm:grid-cols-3">
          {/* Section */}
          <div>
            <FieldLabel htmlFor="add-category_id" required>Section</FieldLabel>
            <select id="add-category_id" name="category_id" required className="ui-select w-full">
              <option value="">Choose…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Name */}
          <div className="sm:col-span-2">
            <FieldLabel htmlFor="add-name" required>Item name</FieldLabel>
            <input
              id="add-name"
              name="name"
              required
              placeholder={isFood ? "e.g. Grilled Chicken Burger" : "e.g. iPhone 15 Case – Black"}
              className="ui-input w-full"
              autoComplete="off"
            />
          </div>

          {/* Price */}
          {!soldByWeight && (
            <div>
              <FieldLabel htmlFor="add-price" required>Price ($)</FieldLabel>
              <MoneyInput
                id="add-price"
                name="price"
                placeholder="4.50"
                required
                value={price}
                onChange={setPrice}
              />
              <input type="hidden" name="price_per_kg" value="" />
              <input type="hidden" name="weight_step_kg" value="0.1" />
            </div>
          )}

          {/* Display quantity — only for categories where a weight/volume label makes sense */}
          {canShowQty && !soldByWeight ? (
            <div className="min-w-0">
              <DisplayQuantityFields idPrefix="add-item-qty" />
            </div>
          ) : !soldByWeight ? (
            <>
              <input type="hidden" name="display_quantity" value="" />
              <input type="hidden" name="display_unit" value="g" />
            </>
          ) : null}

          {/* Sold by weight — only for categories with bulk/scale-priced items (produce, meat, bulk pet food) */}
          {canWeighByWeight ? (
            <div className="sm:col-span-3">
              <input type="hidden" name="sold_by_weight" value={soldByWeight ? "true" : "false"} />
              <button
                type="button"
                onClick={toggleSoldByWeight}
                className={`flex w-full items-center justify-between rounded-xl border px-4 py-2.5 text-left transition ${
                  soldByWeight
                    ? "border-violet-300 bg-violet-50"
                    : "border-slate-200 bg-slate-50 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">⚖️</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Sold by weight</p>
                    <p className="text-xs text-slate-400">
                      {soldByWeight
                        ? "Price is auto-calculated from kg/grams"
                        : "Enable for potatoes, cheese, meat, bulk items…"}
                    </p>
                  </div>
                </div>
                <div className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${soldByWeight ? "bg-violet-600" : "bg-slate-200"}`}>
                  <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${soldByWeight ? "translate-x-[18px]" : "translate-x-0.5"}`} />
                </div>
              </button>

              {soldByWeight && (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
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
                      value={pricePerKg}
                      onChange={setPricePerKg}
                    />
                    <p className="mt-1 text-xs text-slate-400">e.g. $2.80/kg → 750g = $2.10</p>
                  </div>
                  <div>
                    <FieldLabel htmlFor="add-weight_step_kg" optional>Weight step (kg)</FieldLabel>
                    <input id="add-weight_step_kg" name="weight_step_kg" placeholder="0.1" type="number" step="0.01" min={0.01} defaultValue={0.1} className="ui-input w-full" />
                    <p className="mt-1 text-xs text-slate-400">0.1 = 100g increments</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <input type="hidden" name="sold_by_weight" value="false" />
          )}
        </div>
      </div>

      {/* ─── STEP 2: Photo & Description ──────────────────────────────────── */}
      <ExpandSection
        label="Photo & description"
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden>
            <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
          </svg>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-3">
            {brands.length > 0 && (
              <div>
                <FieldLabel htmlFor="add-brand_id" optional>Brand</FieldLabel>
                <select id="add-brand_id" name="brand_id" className="ui-select w-full">
                  <option value="">No brand</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
              </div>
            )}
            {brands.length === 0 && (
              <input type="hidden" name="brand_id" value="" />
            )}
            <div>
              <FieldLabel htmlFor="add-description" optional>Description</FieldLabel>
              <textarea
                id="add-description"
                name="description"
                placeholder={isFood ? "Describe this dish…" : "Describe this product…"}
                rows={3}
                className="ui-textarea w-full resize-none"
              />
            </div>
          </div>
          <div>
            <ImageUploadField name="image_file" optional />
          </div>
        </div>
      </ExpandSection>

      {/* ─── STEP 3: Contents & nutrition — only for categories where this applies ── */}
      {canShowNutritionSection ? (
        <ExpandSection
          label={isFood ? "Allergens & nutrition" : "Contents & nutrition (optional)"}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden>
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          }
        >
          {profile.contents && (
            <div>
              <FieldLabel htmlFor="add-contents" optional>
                {isFood ? "Contains / key ingredients" : "Ingredients / contents"}
              </FieldLabel>
              <input
                id="add-contents"
                name="contents"
                placeholder={isFood ? "e.g. wheat, milk, sesame, nuts" : "e.g. nicotine 3mg, 50/50 VG/PG — or leave blank"}
                className="ui-input w-full"
              />
              <p className="mt-1 text-xs text-slate-400">
                {isFood ? "Helps customers with dietary restrictions" : "Key ingredients, strength, or contents customers should know"}
              </p>
            </div>
          )}
          {!profile.contents && <input type="hidden" name="contents" value="" />}
          {profile.nutrition && <MenuNutritionFields idPrefix="add-item-nutrition" />}
        </ExpandSection>
      ) : (
        <input type="hidden" name="contents" value="" />
      )}

      {/* ─── STEP 4: Variants & Options ───────────────────────────────────── */}
      <ExpandSection
        label={isFood ? "Customization & options" : "Variants & options"}
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden>
            <circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
          </svg>
        }
      >
        <div className="space-y-4">
          <MenuItemOptionsFields />

          {canCustomizeIngredients ? (
            <>
              <Divider label="Ingredient customization" />
              <div className="grid gap-4 sm:grid-cols-2">
                <IngredientListField
                  name="removable_ingredients"
                  label="Items customers can remove"
                />
                <IngredientListField
                  name="add_ingredients"
                  label="Add-ons (+ extra price per line)"
                  withPrice
                />
              </div>
            </>
          ) : (
            <>
              <input type="hidden" name="removable_ingredients" value="[]" />
              <input type="hidden" name="add_ingredients" value="[]" />
            </>
          )}
        </div>
      </ExpandSection>

      {/* ─── STEP 5: Stock ────────────────────────────────────────────────── */}
      <ExpandSection
        label="Stock & availability"
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden>
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          </svg>
        }
      >
        <MenuItemStockFields />
      </ExpandSection>

      {/* ─── Submit ───────────────────────────────────────────────────────── */}
      <AddItemSubmitButton isFood={isFood} />
    </form>
  );
}
