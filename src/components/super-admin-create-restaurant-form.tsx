"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { MapPin, Loader2, Map, ChevronDown } from "lucide-react";
import { createRestaurantAction } from "@/app-actions/superadmin";
import { BROWSE_SECTION_OPTIONS } from "@/lib/browse-sections";
import {
  BUSINESS_TYPE_PRESETS,
  DEFAULT_BUSINESS_TYPE,
  supportsHomeBrowseCategory,
  type BusinessTypeKey,
} from "@/lib/business-types";

const GoogleMapPicker = dynamic(
  () => import("@/components/google-map-picker").then((m) => m.GoogleMapPicker),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
      </div>
    ),
  },
);

const BEIRUT = { lat: 33.8938, lng: 35.5018 };

export function SuperAdminCreateRestaurantForm() {
  const [businessType, setBusinessType] = useState<BusinessTypeKey>(DEFAULT_BUSINESS_TYPE);
  const activePreset = useMemo(
    () => BUSINESS_TYPE_PRESETS.find((preset) => preset.key === businessType) ?? BUSINESS_TYPE_PRESETS[0],
    [businessType],
  );
  const showBrowse = supportsHomeBrowseCategory(businessType);

  const [showLocationSection, setShowLocationSection] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [initLat, setInitLat] = useState<number>(BEIRUT.lat);
  const [initLng, setInitLng] = useState<number>(BEIRUT.lng);
  const [initAddress, setInitAddress] = useState("");
  const [hasPin, setHasPin] = useState(false);

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

      {/* Optional first location */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 md:col-span-2 xl:col-span-4">
        <button
          type="button"
          onClick={() => setShowLocationSection(!showLocationSection)}
          className="flex w-full items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-violet-500" />
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              First location / branch
            </span>
            <span className="text-xs text-slate-400">(optional)</span>
          </div>
          <ChevronDown className={`h-4 w-4 text-slate-400 transition ${showLocationSection ? "rotate-180" : ""}`} />
        </button>

        {showLocationSection ? (
          <div className="mt-3 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">
                {hasPin
                  ? initAddress || `${initLat.toFixed(5)}, ${initLng.toFixed(5)}`
                  : "Set the main branch coordinates so customers can find it by location."}
              </p>
              <button
                type="button"
                onClick={() => setShowMap(!showMap)}
                className="flex items-center gap-1.5 rounded-lg border border-violet-200 bg-white px-3 py-1.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-50"
              >
                <Map className="h-3.5 w-3.5" />
                {showMap ? "Close map" : "Pick on map"}
              </button>
            </div>

            {showMap ? (
              <div className="overflow-hidden rounded-2xl border border-slate-200" style={{ height: 320 }}>
                <GoogleMapPicker
                  initial={{ lat: initLat, lng: initLng }}
                  onConfirm={(r) => {
                    setInitLat(r.lat);
                    setInitLng(r.lng);
                    setInitAddress(r.address);
                    setHasPin(true);
                    setShowMap(false);
                  }}
                  onClose={() => setShowMap(false)}
                />
              </div>
            ) : null}

            {hasPin ? (
              <>
                <input type="hidden" name="init_latitude" value={initLat} />
                <input type="hidden" name="init_longitude" value={initLng} />
                <input type="hidden" name="init_address" value={initAddress} />
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-2">
                  <MapPin className="h-4 w-4 shrink-0 text-emerald-600" />
                  <p className="text-xs text-emerald-700 font-medium">
                    Pin set: {initAddress || `${initLat.toFixed(5)}, ${initLng.toFixed(5)}`}
                  </p>
                  <button
                    type="button"
                    onClick={() => { setHasPin(false); setInitAddress(""); }}
                    className="ml-auto text-xs text-emerald-500 hover:text-red-500"
                  >
                    Clear
                  </button>
                </div>
              </>
            ) : null}
          </div>
        ) : null}
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 md:col-span-2 xl:col-span-4">
        <input
          type="checkbox"
          name="lifetime_free"
          value="true"
          className="mt-0.5 h-4 w-4 accent-emerald-600"
        />
        <span className="space-y-1">
          <span className="block text-sm font-semibold text-emerald-900">Lifetime free account</span>
          <span className="block text-xs text-emerald-800">
            No monthly billing, no expiry lockouts, and no payment reminder emails.
          </span>
        </span>
      </label>

      <button className="btn btn-success rounded-xl">Create business</button>
    </form>
  );
}
