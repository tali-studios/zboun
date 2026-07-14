"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { MapPin, Loader2, Map, ChevronDown } from "lucide-react";
import { BrowseSectionsCheckboxes } from "@/components/browse-sections-checkboxes";
import { ComplimentaryBillingFields } from "@/components/complimentary-billing-fields";
import { SubscriptionPlanFields } from "@/components/subscription-plan-fields";
import { createRestaurantAction } from "@/app-actions/superadmin";
import type { BrowseSection } from "@/lib/browse-sections";

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
const DEFAULT_CATEGORIES: BrowseSection[] = ["General Shops"];

export function SuperAdminCreateRestaurantForm() {
  const [showLocationSection, setShowLocationSection] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [initLat, setInitLat] = useState<number>(BEIRUT.lat);
  const [initLng, setInitLng] = useState<number>(BEIRUT.lng);
  const [initAddress, setInitAddress] = useState("");
  const [hasPin, setHasPin] = useState(false);
  const [complimentaryFree, setComplimentaryFree] = useState(false);

  return (
    <form id="super-admin-create-restaurant-form" action={createRestaurantAction} className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
      <input name="name" required placeholder="Business name" className="ui-input" />
      <input name="email" type="email" required placeholder="Admin email" className="ui-input" />
      <input name="phone" type="tel" required placeholder="WhatsApp number" className="ui-input" />
      <input
        name="admin_password"
        type="password"
        required
        minLength={8}
        autoComplete="new-password"
        placeholder="Admin password (min 8)"
        className="ui-input"
      />
      <input
        name="admin_password_confirm"
        type="password"
        required
        minLength={8}
        autoComplete="new-password"
        placeholder="Confirm password"
        className="ui-input"
      />
      <p className="text-xs text-slate-500 md:col-span-2 xl:col-span-4">
        Share this password with the store owner (e.g. WhatsApp). It is not emailed — they can
        change it later via Forgot password on the login page.
      </p>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 md:col-span-2 xl:col-span-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Business categories</p>
        <p className="mt-1 text-xs text-slate-500">
          Pick where this business appears on the home page. Each category needs at least one tag.
        </p>
        <BrowseSectionsCheckboxes
          formId="super-admin-create-restaurant-form"
          selected={DEFAULT_CATEGORIES}
          selectedSubs={["Other"]}
        />
      </div>

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
              Location / branch
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

      <div className="md:col-span-2 xl:col-span-4">
        <SubscriptionPlanFields disabled={complimentaryFree} />
      </div>

      <div className="md:col-span-2 xl:col-span-4">
        <ComplimentaryBillingFields onEnabledChange={setComplimentaryFree} />
      </div>

      <button className="btn btn-success rounded-xl">Create business</button>
    </form>
  );
}
