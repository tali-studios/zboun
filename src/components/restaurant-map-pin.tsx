"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { MapPin, Map, Loader2 } from "lucide-react";

const GoogleMapPicker = dynamic(
  () => import("@/components/google-map-picker").then((m) => m.GoogleMapPicker),
  { ssr: false, loading: () => <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-violet-400" /></div> },
);

type Props = {
  initialLat?: number | null;
  initialLng?: number | null;
};

export function RestaurantMapPin({ initialLat, initialLng }: Props) {
  const [lat, setLat] = useState<number | null>(initialLat ?? null);
  const [lng, setLng] = useState<number | null>(initialLng ?? null);
  const [address, setAddress] = useState("");
  const [showMap, setShowMap] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex-1 grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Latitude</span>
            <input
              name="latitude"
              type="number"
              step="any"
              value={lat ?? ""}
              onChange={(e) => setLat(e.target.value ? Number(e.target.value) : null)}
              placeholder="33.8938"
              className="ui-input"
            />
          </div>
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Longitude</span>
            <input
              name="longitude"
              type="number"
              step="any"
              value={lng ?? ""}
              onChange={(e) => setLng(e.target.value ? Number(e.target.value) : null)}
              placeholder="35.5018"
              className="ui-input"
            />
          </div>
        </div>
        <div className="pt-5">
          <button
            type="button"
            onClick={() => setShowMap(!showMap)}
            className="flex items-center gap-2 rounded-xl bg-violet-50 px-4 py-2.5 text-sm font-semibold text-violet-700 transition hover:bg-violet-100 border border-violet-200"
          >
            <Map className="h-4 w-4" />
            {showMap ? "Close map" : "Pick on map"}
          </button>
        </div>
      </div>

      {lat && lng ? (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-2">
          <MapPin className="h-4 w-4 shrink-0 text-emerald-600" />
          <p className="text-xs text-emerald-700 font-medium">
            {address || `${lat.toFixed(5)}, ${lng.toFixed(5)}`} — customers within your radius will see your store
          </p>
        </div>
      ) : (
        <p className="text-xs text-slate-400">
          Set your store&apos;s coordinates so customers can filter by location on the home page.
        </p>
      )}

      {showMap ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm" style={{ height: 380 }}>
          <GoogleMapPicker
            initial={lat && lng ? { lat, lng } : undefined}
            onConfirm={(result) => {
              setLat(result.lat);
              setLng(result.lng);
              setAddress(result.address);
              setShowMap(false);
            }}
            onClose={() => setShowMap(false)}
          />
        </div>
      ) : null}
    </div>
  );
}
