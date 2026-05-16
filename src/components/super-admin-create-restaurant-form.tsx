"use client";

import { useMemo, useState } from "react";
import { createRestaurantAction } from "@/app-actions/superadmin";
import { BROWSE_SECTION_OPTIONS } from "@/lib/browse-sections";
import {
  ADDON_LABELS,
  BUSINESS_TYPE_PRESETS,
  DEFAULT_BUSINESS_TYPE,
  supportsHomeBrowseCategory,
  type BusinessTypeKey,
} from "@/lib/business-types";

export function SuperAdminCreateRestaurantForm() {
  const [businessType, setBusinessType] = useState<BusinessTypeKey>(DEFAULT_BUSINESS_TYPE);
  const activePreset = useMemo(
    () => BUSINESS_TYPE_PRESETS.find((preset) => preset.key === businessType) ?? BUSINESS_TYPE_PRESETS[0],
    [businessType],
  );
  const showBrowse = supportsHomeBrowseCategory(businessType);

  return (
    <form action={createRestaurantAction} className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
      <input name="name" required placeholder="Business name" className="ui-input" />
      <input name="email" type="email" required placeholder="Admin email" className="ui-input" />
      <input name="phone" type="tel" required placeholder="WhatsApp number" className="ui-input" />

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 md:col-span-2 xl:col-span-4">
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Business type</span>
          <select
            name="business_type"
            value={businessType}
            onChange={(event) => setBusinessType(event.target.value as BusinessTypeKey)}
            className="ui-select"
          >
            {BUSINESS_TYPE_PRESETS.map((preset) => (
              <option key={preset.key} value={preset.key}>
                {preset.label}
              </option>
            ))}
          </select>
        </label>
        {/* <p className="mt-2 text-xs text-slate-500">{activePreset.description}</p>
        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Recommended features
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {activePreset.recommendedAddons.map((addonKey) => (
            <span
              key={addonKey}
              className="rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-semibold text-violet-700"
            >
              {ADDON_LABELS[addonKey]}
            </span>
          ))}
        </div> */}
      </div>

      {showBrowse ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 md:col-span-2 xl:col-span-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Home browse category</p>
          {/* <p className="mt-1 text-xs text-slate-500">Each business appears in exactly one home section.</p> */}
          <div className="mt-2 flex flex-wrap gap-2">
            {BROWSE_SECTION_OPTIONS.map((section) => (
              <label
                key={section}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700"
              >
                <input
                  type="radio"
                  name="browse_section"
                  value={section}
                  defaultChecked={section === "Lunch"}
                  className="h-4 w-4 accent-violet-600"
                />
                <span>{section}</span>
              </label>
            ))}
          </div>
        </div>
      ) : (
        <input type="hidden" name="browse_section" value="Lunch" />
      )}

      <button className="btn btn-success rounded-xl">Create business</button>
    </form>
  );
}
