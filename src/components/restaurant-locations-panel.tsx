"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Loader2, Map, MapPin } from "lucide-react";
import type { RestaurantLocationRow } from "@/app-actions/restaurant";

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

type Props = {
  initialLocations: RestaurantLocationRow[];
  /** Nest inside Store settings (no separate panel card). */
  embedded?: boolean;
};

const BEIRUT = { lat: 33.8938, lng: 35.5018 };

export function RestaurantLocationsPanel({ initialLocations, embedded = false }: Props) {
  const location = initialLocations[0] ?? null;
  const [showMap, setShowMap] = useState(false);
  const [lat, setLat] = useState<number | null>(location?.latitude ?? null);
  const [lng, setLng] = useState<number | null>(location?.longitude ?? null);
  const [address, setAddress] = useState(location?.address ?? "");

  const hasPin = lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng);

  return (
    <div id="locations" className={embedded ? "p-5" : "panel p-5"}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="panel-title">Store location</h2>
        <button
          type="button"
          onClick={() => setShowMap((open) => !open)}
          className="flex items-center gap-1.5 rounded-xl border border-violet-200 bg-white px-3 py-2 text-xs font-semibold text-violet-700 shadow-sm transition hover:bg-violet-50"
        >
          <Map className="h-3.5 w-3.5" />
          {showMap ? "Close map" : "Pick on map"}
        </button>
      </div>

      {location?.id ? <input type="hidden" name="location_id" value={location.id} /> : null}
      <input type="hidden" name="latitude" value={hasPin ? String(lat) : ""} />
      <input type="hidden" name="longitude" value={hasPin ? String(lng) : ""} />
      <input type="hidden" name="location_address" value={address} />

      {showMap ? (
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200" style={{ height: 360 }}>
          <GoogleMapPicker
            initial={{ lat: lat ?? BEIRUT.lat, lng: lng ?? BEIRUT.lng }}
            onConfirm={(result) => {
              setLat(result.lat);
              setLng(result.lng);
              setAddress(result.address);
              setShowMap(false);
            }}
            onClose={() => setShowMap(false)}
          />
        </div>
      ) : hasPin ? (
        <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-violet-100 bg-violet-50/60 px-3 py-2.5">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" aria-hidden />
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-800">
              {address || "Location pinned"}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              {lat!.toFixed(5)}, {lng!.toFixed(5)}
            </p>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-xs text-slate-400">No location picked yet.</p>
      )}
    </div>
  );
}
